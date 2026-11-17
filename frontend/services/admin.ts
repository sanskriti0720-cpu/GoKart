const apiBase = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBase}/admin${path}`, {
    ...init,
    credentials: 'include',
    headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    throw new Error(body?.error?.message || 'The admin request could not be completed.');
  }
  return response.json() as Promise<T>;
}

const send = (method: string, body?: unknown): RequestInit => ({ method, ...(body ? { body: JSON.stringify(body) } : {}) });

export const adminApi = {
  overview: () => request<AdminOverview>('/overview'),
  uploadSignature: () => request<{ cloudName: string; apiKey: string; timestamp: number; folder: string; signature: string }>('/uploads/signature', send('POST')),
  products: (q = '') => request<{ products: AdminProduct[] }>(`/products?limit=100${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  createProduct: (value: AdminProductInput) => request('/products', send('POST', value)),
  updateProduct: (id: string, value: AdminProductInput) => request(`/products/${id}`, send('PATCH', value)),
  archiveProduct: (id: string) => request(`/products/${id}`, send('DELETE')),
  categories: () => request<{ categories: AdminCategory[] }>('/categories'),
  createCategory: (value: AdminCategoryInput) => request('/categories', send('POST', value)),
  updateCategory: (id: string, value: AdminCategoryInput) => request(`/categories/${id}`, send('PATCH', value)),
  deactivateCategory: (id: string) => request(`/categories/${id}`, send('DELETE')),
  orders: () => request<{ orders: AdminOrder[] }>('/orders?limit=100'),
  updateOrder: (id: string, status: string) => request(`/orders/${id}/status`, send('PATCH', { status })),
  customers: (q = '') => request<{ customers: AdminCustomer[] }>(`/customers?limit=100${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  setCustomerActive: (id: string, isActive: boolean) => request(`/customers/${id}`, send('PATCH', { isActive })),
  reviews: () => request<{ reviews: AdminReview[] }>('/reviews?limit=100'),
  deleteReview: (id: string) => request(`/reviews/${id}`, send('DELETE')),
};

export type AdminCategory = { _id: string; name: string; slug: string; description: string; image: string; isActive: boolean };
export type AdminProduct = { _id: string; name: string; slug: string; sku: string; description: string; category: AdminCategory | string; brand: string; price: number; compareAtPrice: number | null; stock: number; images: { url: string; alt: string; publicId?: string }[]; variants: { name: string; value: string; sku: string; price?: number; stock: number }[]; tags: string[]; status: 'draft' | 'active' | 'archived'; isFeatured: boolean };
export type AdminProductInput = Omit<AdminProduct, '_id' | 'category'> & { category: string };
export type AdminCategoryInput = Omit<AdminCategory, '_id'>;
export type AdminOrder = { _id: string; orderNumber: string; total: number; status: string; paymentStatus: string; paymentMethod: string; createdAt: string; user?: { name: string; email: string } };
export type AdminCustomer = { _id: string; name: string; email: string; phone: string; isActive: boolean; createdAt: string };
export type AdminReview = { _id: string; rating: number; title: string; body: string; createdAt: string; user?: { name: string }; product?: { name: string; slug: string } };
export type AdminOverview = { stats: { revenue: number; orders: number; customers: number; products: number }; recentOrders: AdminOrder[]; monthlyRevenue: { _id: { year: number; month: number }; revenue: number; orders: number }[] };
