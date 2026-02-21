import { UserId } from '../value-objects/branded.ts';

export interface UserAddress {
  id: string;
  street: string;
  city: string;
  county?: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role?: string;
  passwordHash?: string;
  refreshToken?: string;
  lastLoginAt?: Date;
  addresses: UserAddress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  exists(id: UserId): Promise<boolean>;
  save(user: User): Promise<void>;
  addAddress(userId: UserId, address: UserAddress): Promise<void>;
  removeAddress(userId: UserId, addressId: string): Promise<void>;
  updateRefreshToken(userId: UserId, token: string | null): Promise<void>;
  updateLastLogin(userId: UserId): Promise<void>;
}
