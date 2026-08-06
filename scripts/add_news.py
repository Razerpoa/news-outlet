#!/usr/bin/env python3
"""Upload one or more news items into KabarNusantara.

Usage examples:
  python3 scripts/add_news.py --mode db --file ./news.json
  python3 scripts/add_news.py --mode api --file ./news.json \
    --api-url http://localhost:3000/api/articles \
    --cookie "kn_session=..."

JSON structure:
  {
    "title": "Judul berita",
    "excerpt": "Ringkasan singkat",
    "content": "Isi lengkap berita",
    "author": "Nama penulis",
    "category_id": 3,
    "image_url": "https://example.com/image.jpg"
  }

DB-only extras:
  "title_en", "excerpt_en", "content_en", "slug", "featured", "views", "published_at"

Notes:
- `category_id` is required for the real web write route.
- `category_slug` can be used in DB mode as a friendlier alternative.
- `--cookie` is required in API mode because the web route is protected.
- The API mode posts to the same route the web app uses, so it inherits the
  route's server-side validation and translation workflow.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib import error, request

DEFAULT_IMAGE = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80"

DB_EDITABLE_FIELDS = {
    "slug",
    "title",
    "title_en",
    "excerpt",
    "excerpt_en",
    "content",
    "content_en",
    "category_id",
    "author",
    "image_url",
    "published_at",
    "views",
    "featured",
}
API_EDITABLE_FIELDS = {
    "title",
    "excerpt",
    "content",
    "author",
    "category_id",
    "image_url",
}


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9\s-]", "", value)
    value = re.sub(r"\s+", "-", value)
    value = re.sub(r"-+", "-", value)
    return value.strip("-") or "artikel"


def load_payloads(file_path: Path) -> list[dict[str, Any]]:
    try:
        raw = file_path.read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        raise SystemExit(f"JSON file not found: {file_path}") from exc

    try:
        loaded = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Invalid JSON in {file_path}: {exc}") from exc

    if isinstance(loaded, dict):
        return [loaded]
    if isinstance(loaded, list):
        if not all(isinstance(item, dict) for item in loaded):
            raise SystemExit("Each item in the JSON array must be an object.")
        return loaded

    raise SystemExit("JSON file must contain either a single object or an array of objects.")


def normalize_item(item: dict[str, Any], index: int, mode: str) -> dict[str, Any]:
    allowed_fields = DB_EDITABLE_FIELDS if mode == "db" else API_EDITABLE_FIELDS
    unknown_fields = sorted(set(item.keys()) - allowed_fields - {"category_slug"})
    if unknown_fields:
        raise SystemExit(
            f"Item #{index + 1} contains unsupported field(s): {', '.join(unknown_fields)}. "
            f"Allowed fields for {mode} mode: {', '.join(sorted(allowed_fields))}."
        )

    required = ["title", "excerpt", "content", "author"]
    missing = [field for field in required if not str(item.get(field, "")).strip()]
    if missing:
        raise SystemExit(f"Item #{index + 1} is missing required field(s): {', '.join(missing)}")

    normalized = {key: value for key, value in item.items() if key in allowed_fields or key == "category_slug"}
    normalized["title"] = str(normalized["title"]).strip()
    normalized["excerpt"] = str(normalized["excerpt"]).strip()
    normalized["content"] = str(normalized["content"]).strip()
    normalized["author"] = str(normalized["author"]).strip()

    if mode == "db":
        normalized.setdefault("title_en", None)
        normalized.setdefault("excerpt_en", None)
        normalized.setdefault("content_en", None)
        normalized.setdefault("image_url", DEFAULT_IMAGE)
        normalized.setdefault("slug", slugify(normalized["title"]))
        normalized.setdefault("featured", False)
        normalized.setdefault("views", 0)
        normalized.setdefault("published_at", None)
    else:
        normalized.setdefault("image_url", DEFAULT_IMAGE)

    if normalized.get("category_id") is None and normalized.get("category_slug") is not None:
        normalized["category_id"] = normalized.get("category_slug")
    if normalized.get("category_id") is None:
        raise SystemExit(f"Item #{index + 1} must include category_id or category_slug.")

    return normalized


def parse_db_url(database_url: str) -> str:
    url = database_url or os.environ.get(
        "DATABASE_URL",
        "postgres://kabar:kabar_secret@localhost:5432/kabar_nusantara",
    )
    # Supabase (host *.supabase.co / *.supabase.com) mewajibkan SSL —
    # tambahkan sslmode=require ke DSN bila belum ada.
    if "supabase" in url and "sslmode=" not in url:
        sep = "&" if "?" in url else "?"
        url = f"{url}{sep}sslmode=require"
    return url


def ensure_db_dep() -> tuple[str, Any]:
    try:
        import psycopg

        return "psycopg", psycopg
    except Exception:
        try:
            import psycopg2

            return "psycopg2", psycopg2
        except Exception as exc:
            raise SystemExit(
                "Missing PostgreSQL driver. Install one of: pip install psycopg[binary] or pip install psycopg2-binary"
            ) from exc


def fetch_category_id(cur: Any, category_id_or_slug: Any) -> int:
    if isinstance(category_id_or_slug, int):
        cur.execute("SELECT id FROM categories WHERE id = %s", (category_id_or_slug,))
        row = cur.fetchone()
        if row is None:
            raise SystemExit(f"Category id not found: {category_id_or_slug}")
        return int(row[0])

    slug = str(category_id_or_slug).strip()
    cur.execute("SELECT id FROM categories WHERE slug = %s", (slug,))
    row = cur.fetchone()
    if row is None:
        raise SystemExit(f"Category slug not found: {slug}")
    return int(row[0])


def db_insert(records: list[dict[str, Any]], database_url: str) -> None:
    driver_name, dbmod = ensure_db_dep()
    connect = getattr(dbmod, "connect", None)
    if connect is None:
        raise SystemExit("The installed PostgreSQL driver does not expose `connect()`.")

    dsn = parse_db_url(database_url)
    conn = connect(dsn)
    try:
        with conn.cursor() as cur:
            for index, item in enumerate(records):
                payload = normalize_item(item, index, "db")
                category_id = fetch_category_id(cur, payload.get("category_id"))
                slug = payload.get("slug") or slugify(payload["title"])
                if payload.get("published_at"):
                    published_at = str(payload["published_at"])
                else:
                    published_at = datetime.now(timezone.utc).isoformat()

                cur.execute(
                    """
                    INSERT INTO articles (
                        slug, title, title_en, excerpt, excerpt_en, content, content_en,
                        category_id, author, image_url, published_at, views, featured
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (slug) DO UPDATE SET
                        title = EXCLUDED.title,
                        title_en = EXCLUDED.title_en,
                        excerpt = EXCLUDED.excerpt,
                        excerpt_en = EXCLUDED.excerpt_en,
                        content = EXCLUDED.content,
                        content_en = EXCLUDED.content_en,
                        category_id = EXCLUDED.category_id,
                        author = EXCLUDED.author,
                        image_url = EXCLUDED.image_url,
                        published_at = EXCLUDED.published_at,
                        views = EXCLUDED.views,
                        featured = EXCLUDED.featured
                    """,
                    (
                        slug,
                        payload["title"],
                        payload.get("title_en") or None,
                        payload["excerpt"],
                        payload.get("excerpt_en") or None,
                        payload["content"],
                        payload.get("content_en") or None,
                        category_id,
                        payload["author"],
                        payload.get("image_url") or DEFAULT_IMAGE,
                        published_at,
                        int(payload.get("views") or 0),
                        bool(payload.get("featured") or False),
                    ),
                )
                print(f"[db] inserted/updated: {slug}")
            conn.commit()
    finally:
        conn.close()


def api_insert(records: list[dict[str, Any]], api_url: str, cookie_header: str) -> None:
    if not api_url:
        api_url = os.environ.get("NEXT_PUBLIC_APP_URL", "http://localhost:3000") + "/api/articles"

    for index, item in enumerate(records):
        payload = normalize_item(item, index, "api")
        body_payload = {
            "title": payload["title"],
            "excerpt": payload["excerpt"],
            "content": payload["content"],
            "author": payload["author"],
            "category_id": payload.get("category_id"),
            "image_url": payload.get("image_url") or DEFAULT_IMAGE,
        }

        body = json.dumps(body_payload).encode("utf-8")
        req = request.Request(api_url, data=body, method="POST")
        req.add_header("Content-Type", "application/json")
        req.add_header("Accept", "application/json")
        req.add_header("Cookie", cookie_header)

        try:
            with request.urlopen(req, timeout=60) as resp:
                response_body = resp.read().decode("utf-8")
                print(f"[api] #{index + 1} {resp.status} {response_body}")
        except error.HTTPError as exc:
            body_text = exc.read().decode("utf-8", errors="replace")
            print(f"[api] #{index + 1} {exc.code} {body_text}", file=sys.stderr)
            raise SystemExit(1) from exc
        except error.URLError as exc:
            print(f"[api] #{index + 1} network error: {exc}", file=sys.stderr)
            raise SystemExit(1) from exc


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Add one or more articles to the KabarNusantara data store.")
    parser.add_argument("--file", required=True, help="Path to a JSON file containing the article payload.")
    parser.add_argument("--mode", choices=["db", "api"], default="db", help="Write directly to Postgres or use the web API route.")
    parser.add_argument("--database-url", default=None, help="Optional PostgreSQL DSN; defaults to DATABASE_URL.")
    parser.add_argument("--api-url", default=None, help="API endpoint to POST to; defaults to NEXT_PUBLIC_APP_URL/api/articles.")
    parser.add_argument("--cookie", default=None, help="Required in API mode; example: 'kn_session=...'.")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    file_path = Path(args.file)
    records = load_payloads(file_path)
    if not records:
        raise SystemExit("No article payloads were found in the JSON file.")

    if args.mode == "db":
        db_insert(records, args.database_url or os.environ.get("DATABASE_URL", ""))
        return 0

    if not args.cookie:
        raise SystemExit("API mode requires --cookie with an authenticated session cookie value.")

    api_insert(records, args.api_url or "", args.cookie)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
