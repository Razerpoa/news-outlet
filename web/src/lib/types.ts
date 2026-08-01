export interface Category {
  id: number;
  slug: string;
  name: string;
  color: string;
  article_count: number;
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  image_url: string;
  published_at: string;
  views: number;
  featured: boolean;
  created_at: string;
  category_id: number;
  category_slug: string;
  category_name: string;
  category_color: string;
}

export interface ArticleList {
  items: Article[];
  total: number;
  limit: number;
  offset: number;
}
