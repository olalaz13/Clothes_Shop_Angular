export interface User {
    _id?: string;
    fullname: string;
    username: string;
    password?: string;
    role: 'admin' | 'employee' | 'customer';
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    addresses?: any[];
    birthday?: string;
    gender?: 'male' | 'female' | 'other';
    wishlist?: any[];
    createdAt?: Date;
    updatedAt?: Date;
}
