export type ProductImage = {
  url: string;
  publicId?: string;
  alt?: string;
};

export type ProductCategory = {
  _id: string;
  name: string;
  slug: string;
};

export type ProductVariant = {
  name: string;
  value: string;
  sku?: string;
  price?: number;
  stock: number;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  category: ProductCategory;
  brand: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  images: ProductImage[];
  variants: ProductVariant[];
  tags: string[];
  isFeatured: boolean;
  soldCount: number;
  ratingAverage: number;
  ratingCount: number;
  createdAt: string;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
};

export type ProductPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ProductListResponse = {
  products: Product[];
  pagination: ProductPagination;
};

export type ProductQuery = {
  q?: string;
  category?: string;
  brand?: string;
  minRating?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
  limit?: string;
};
