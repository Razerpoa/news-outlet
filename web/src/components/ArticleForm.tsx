'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { Category } from '@/lib/types';
import { t, type Lang } from '@/lib/lang';

type Status = 'idle' | 'submitting' | 'success';

interface Props {
  categories: Category[];
  lang?: Lang;
}

export default function ArticleForm({ categories, lang = 'id' }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Pratinjau slug dari judul (server memutuskan slug final)
  const slugPreview = useMemo(
    () =>
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-'),
    [title]
  );

  const previewable = useMemo(() => {
    if (imageFile) return true;
    try {
      return new URL(imageUrl).protocol === 'http:' || new URL(imageUrl).protocol === 'https:';
    } catch {
      return false;
    }
  }, [imageFile, imageUrl]);

  const previewSrc = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return imageUrl;
  }, [imageFile, imageUrl]);

  const reset = () => {
    setTitle('');
    setCategoryId('');
    setExcerpt('');
    setContent('');
    setAuthor('');
    setImageUrl('');
    setImageFile(null);
    setError(null);
    setCreatedSlug(null);
    setStatus('idle');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus('submitting');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category_id', categoryId);
      formData.append('excerpt', excerpt.trim());
      formData.append('content', content.trim());
      formData.append('author', author.trim());

      if (imageFile) {
        formData.append('image_file', imageFile);
      } else {
        formData.append('image_url', imageUrl.trim());
      }

      const res = await fetch('/api/articles', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? t(lang, 'err_generic'));
        setStatus('idle');
        return;
      }

      setCreatedSlug(data?.slug ?? null);
      setStatus('success');
      router.refresh();
    } catch {
      setError(t(lang, 'err_generic'));
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div className="write-page">
        <div className="form-alert success" role="status">
          <h2>{t(lang, 'success_title')}</h2>
          <p>{t(lang, 'success_desc', { title })}</p>
          <div className="form-success-actions">
            <a className="btn" href={createdSlug ? `/article/${createdSlug}` : '/'}>
              {t(lang, 'view_article')}
            </a>
            <button type="button" className="btn btn-ghost" onClick={reset}>
              {t(lang, 'write_another')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="write-page">
      <h1>{t(lang, 'write_title')}</h1>
      <p className="write-lead">{t(lang, 'write_lead')}</p>

      <form className="form-card" onSubmit={submit} noValidate>
        {error && (
          <div className="form-alert error" role="alert">
            {error}
          </div>
        )}

        <div className="form-field">
          <label htmlFor="article-title">
            {t(lang, 'field_title')} <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            id="article-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t(lang, 'field_title_ph')}
            maxLength={200}
            required
          />
          <p className="form-hint">
            {t(lang, 'slug_hint')} <code>/article/{slugPreview || 'article-title'}</code>
          </p>
        </div>

        <div className="form-field">
          <label htmlFor="article-category">
            {t(lang, 'field_category')} <span className="req" aria-hidden="true">*</span>
          </label>
          <select
            id="article-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">{t(lang, 'select_category')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="article-excerpt">
            {t(lang, 'field_excerpt')} <span className="req" aria-hidden="true">*</span>
          </label>
          <textarea
            id="article-excerpt"
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder={t(lang, 'field_excerpt_ph')}
            maxLength={300}
            required
          />
          <p className="form-hint">{t(lang, 'excerpt_hint', { n: excerpt.length })}</p>
        </div>

        <div className="form-field">
          <label htmlFor="article-content">
            {t(lang, 'field_content')} <span className="req" aria-hidden="true">*</span>
          </label>
          <textarea
            id="article-content"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t(lang, 'field_content_ph')}
            required
          />
          <p className="form-hint">{t(lang, 'content_hint')}</p>
        </div>

        <div className="form-field">
          <label htmlFor="article-author">
            {t(lang, 'field_author')} <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            id="article-author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder={t(lang, 'field_author_ph')}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="article-image">{t(lang, 'field_image')}</label>
          <input
            id="article-image"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder={t(lang, 'field_image_ph')}
          />

          <div className="upload-picker">
            <label htmlFor="article-image-upload" className="upload-picker-btn">
              {t(lang, 'upload_file')}
            </label>
            <span className="upload-picker-meta">
              {imageFile ? imageFile.name : t(lang, 'upload_file_empty')}
            </span>
            <input
              id="article-image-upload"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="upload-picker-input"
            />
          </div>

          <p className="form-hint">{t(lang, 'image_hint')}</p>
          {previewable && (
            <div className="image-preview">
              <img src={previewSrc} alt={t(lang, 'image_preview_alt')} />
            </div>
          )}
        </div>

        <div className="form-actions">
          <p className="form-note">{t(lang, 'required_note')}</p>
          <button type="submit" className="btn" disabled={status === 'submitting'}>
            {status === 'submitting' ? t(lang, 'publishing') : t(lang, 'publish')}
          </button>
        </div>
      </form>
    </div>
  );
}
