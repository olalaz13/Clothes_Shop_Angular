export interface OrderItem {
    product: string; // Product ID
    title: string;
    price: number;
    qty: number;
    size?: string;
    color?: string;
    img?: string;
}

export interface ShippingInfo {
    fullname: string;
    address: string;
    phone: string;
    paymentMethod: string;
}

export interface Order {
    _id?: string;
    user: any; // User ID or Populated User object
    items: OrderItem[];
    total: number;
    shippingFee?: number;
    shippingInfo: ShippingInfo;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt?: string;
    updatedAt?: string;
}
