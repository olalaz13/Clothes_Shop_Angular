export interface Product {
  _id?: string;
  id?: number | string;
  title: string;
  price: number;
  cat: string;
  img: string;
  desc: string;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItem {
  _id?: string;
  id: number | string;
  title: string;
  price: number;
  img: string;
  qty: number;
  size?: string;
  color?: string;
}