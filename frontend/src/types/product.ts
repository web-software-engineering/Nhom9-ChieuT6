export interface Product {
  id: string;
  productId: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  stock: number;
  weight: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface BackendProduct {
  product_ID: number;
  category_ID?: number | null;
  seller_ID?: number | null;
  product_name: string;
  product_image?: string | null;
  description?: string | null;
  price?: number | string | null;
  number?: number | string | null;
  category_name?: string | null;
}
