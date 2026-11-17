import type { Category, Product, ProductListResponse, ProductQuery } from '@/types/catalog';

const apiBaseUrl = (process.env.SHOPSPHERE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export class CatalogApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'CatalogApiError';
    this.status = status;
  }
}

async function readResponse<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, { cache: 'no-store' });
  } catch {
    throw new CatalogApiError('The GoKart catalog service is unavailable.', 503);
  }

  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    throw new CatalogApiError(
      result?.error?.message || 'The catalog request could not be completed.',
      response.status,
    );
  }

  return (await response.json()) as T;
}

export async function getCategories(): Promise<Category[]> {
  const result = await readResponse<{ categories: Category[] }>('/categories');
  return result.categories;
}

export async function getProducts(query: ProductQuery = {}): Promise<ProductListResponse> {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) searchParams.set(key, value);
  }

  const suffix = searchParams.size ? `?${searchParams.toString()}` : '';
  return readResponse<ProductListResponse>(`/products${suffix}`);
}

export async function getProduct(slug: string): Promise<Product> {
  const result = await readResponse<{ product: Product }>(`/products/${encodeURIComponent(slug)}`);
  return result.product;
}

export async function getRelatedProducts(slug: string): Promise<Product[]> {
  const result = await readResponse<{ products: Product[] }>(
    `/products/${encodeURIComponent(slug)}/related`,
  );
  return result.products;
}
