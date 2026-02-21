import type { Database as _Database } from './config/database.ts';
import { PostgresOrderRepository } from './adapters/postgres/OrderRepository.ts';
import { PostgresInventoryRepository } from './adapters/postgres/InventoryRepository.ts';
import { PostgresSubscriptionRepository } from './adapters/postgres/SubscriptionRepository.ts';
import { InMemoryEventBus } from './adapters/event-bus/InMemoryEventBus.ts';
import { PlaceOrderHandler } from '../application/handlers/PlaceOrderHandler.ts';
import { GetUserOrdersHandler } from '../application/handlers/GetUserOrdersHandler.ts';
import { CreateSubscriptionHandler } from '../application/handlers/subscription/CreateSubscriptionHandler.ts';
import { PauseSubscriptionHandler } from '../application/handlers/subscription/PauseSubscriptionHandler.ts';
import { ResumeSubscriptionHandler } from '../application/handlers/subscription/ResumeSubscriptionHandler.ts';
import { CancelSubscriptionHandler } from '../application/handlers/subscription/CancelSubscriptionHandler.ts';
import { ModifySubscriptionHandler } from '../application/handlers/subscription/ModifySubscriptionHandler.ts';
import {
  GenerateOrderFromSubscriptionHandler,
  ProcessSubscriptionRenewalHandler,
} from '../application/handlers/subscription/SubscriptionProcessHandlers.ts';
import {
  IEventPublisher,
  IInventoryRepository,
  IOrderRepository,
  ISubscriptionRepository,
  IUserRepository,
} from '../domain/ports/index.ts';
import type { KnexType } from '../deps.ts';

export interface Container {
  orderRepository: IOrderRepository;
  inventoryRepository: IInventoryRepository;
  subscriptionRepository: ISubscriptionRepository;
  eventBus: IEventPublisher;
  userRepository: IUserRepository;
  placeOrderHandler: PlaceOrderHandler;
  getUserOrdersHandler: GetUserOrdersHandler;
  createSubscriptionHandler: CreateSubscriptionHandler;
  pauseSubscriptionHandler: PauseSubscriptionHandler;
  resumeSubscriptionHandler: ResumeSubscriptionHandler;
  cancelSubscriptionHandler: CancelSubscriptionHandler;
  modifySubscriptionHandler: ModifySubscriptionHandler;
  processSubscriptionRenewalHandler: ProcessSubscriptionRenewalHandler;
  generateOrderFromSubscriptionHandler: GenerateOrderFromSubscriptionHandler;
}

let containerInstance: Container | null = null;

export function createContainer(db: KnexType): Container {
  const eventBus = new InMemoryEventBus();

  const orderRepository = new PostgresOrderRepository(db);
  const inventoryRepository = new PostgresInventoryRepository(db);
  const subscriptionRepository = new PostgresSubscriptionRepository(db);

  const userRepository: IUserRepository = {
    async findById(id) {
      const row = await db('users').where('id', id).first();
      if (!row) return null;
      let addresses = [];
      try {
        if (row.addresses) {
          addresses = typeof row.addresses === 'string' ? JSON.parse(row.addresses) : row.addresses;
        }
      } catch (_e) {
        addresses = [];
      }
      return {
        id: row.id,
        email: row.email,
        name: row.name || '',
        phone: row.phone || '',
        role: row.role,
        passwordHash: row.password_hash,
        refreshToken: row.refresh_token,
        lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
        addresses,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    },
    async findByEmail(email) {
      const row = await db('users').where('email', email).first();
      if (!row) return null;
      let addresses = [];
      try {
        if (row.addresses) {
          addresses = typeof row.addresses === 'string' ? JSON.parse(row.addresses) : row.addresses;
        }
      } catch (_e) {
        addresses = [];
      }
      return {
        id: row.id,
        email: row.email,
        name: row.name || '',
        phone: row.phone || '',
        role: row.role,
        passwordHash: row.password_hash,
        refreshToken: row.refresh_token,
        lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
        addresses,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    },
    async exists(id) {
      const row = await db('users').where('id', id).first();
      return !!row;
    },
    async save(user) {
      await db('users')
        .insert({
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          password_hash: user.passwordHash,
          addresses: JSON.stringify(user.addresses),
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        })
        .onConflict('id')
        .merge();
    },
    async addAddress(userId, address) {
      const user = await db('users').where('id', userId).first();
      if (!user) throw new Error(`User ${userId} not found`);
      const addresses = user.addresses ? JSON.parse(user.addresses) : [];
      addresses.push(address);
      await db('users').where('id', userId).update({ addresses: JSON.stringify(addresses) });
    },
    async removeAddress(userId, addressId) {
      const user = await db('users').where('id', userId).first();
      if (!user) throw new Error(`User ${userId} not found`);
      const addresses = user.addresses ? JSON.parse(user.addresses) : [];
      const filtered = addresses.filter((a: Record<string, unknown>) => a.id !== addressId);
      await db('users').where('id', userId).update({ addresses: JSON.stringify(filtered) });
    },
    async updateRefreshToken(userId, token) {
      await db('users').where('id', userId).update({ refresh_token: token });
    },
    async updateLastLogin(userId) {
      await db('users').where('id', userId).update({ last_login_at: new Date() });
    },
  };

  const placeOrderHandler = new PlaceOrderHandler(
    orderRepository,
    inventoryRepository,
    userRepository,
    eventBus,
  );

  const getUserOrdersHandler = new GetUserOrdersHandler(orderRepository);

  const createSubscriptionHandler = new CreateSubscriptionHandler(
    subscriptionRepository,
    userRepository,
    eventBus,
  );

  const pauseSubscriptionHandler = new PauseSubscriptionHandler(
    subscriptionRepository,
    eventBus,
  );

  const resumeSubscriptionHandler = new ResumeSubscriptionHandler(
    subscriptionRepository,
    eventBus,
  );

  const cancelSubscriptionHandler = new CancelSubscriptionHandler(
    subscriptionRepository,
    eventBus,
  );

  const modifySubscriptionHandler = new ModifySubscriptionHandler(
    subscriptionRepository,
    eventBus,
  );

  const processSubscriptionRenewalHandler = new ProcessSubscriptionRenewalHandler(
    subscriptionRepository,
    eventBus,
  );

  const generateOrderFromSubscriptionHandler = new GenerateOrderFromSubscriptionHandler(
    subscriptionRepository,
    orderRepository,
    inventoryRepository,
    eventBus,
  );

  return {
    orderRepository,
    inventoryRepository,
    subscriptionRepository,
    eventBus,
    userRepository,
    placeOrderHandler,
    getUserOrdersHandler,
    createSubscriptionHandler,
    pauseSubscriptionHandler,
    resumeSubscriptionHandler,
    cancelSubscriptionHandler,
    modifySubscriptionHandler,
    processSubscriptionRenewalHandler,
    generateOrderFromSubscriptionHandler,
  };
}

export function getContainer(): Container {
  if (!containerInstance) {
    throw new Error('Container not initialized. Call createContainer first.');
  }
  return containerInstance;
}

export function setContainer(container: Container): void {
  containerInstance = container;
}
