import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  users,
  suppliers,
  products,
  lots,
  clients,
  purchases,
  sales,
  saleItems,
  employees,
  workSchedules,
  workHours,
  leaveRequests,
  alerts,
  financialRecords,
  type UpsertUser,
  type User,
  type InsertSupplier,
  type Supplier,
  type InsertProduct,
  type Product,
  type InsertLot,
  type Lot,
  type InsertClient,
  type Client,
  type InsertPurchase,
  type Purchase,
  type InsertSale,
  type Sale,
  type InsertSaleItem,
  type SaleItem,
  type InsertEmployee,
  type Employee,
  type InsertWorkSchedule,
  type WorkSchedule,
  type InsertWorkHour,
  type WorkHour,
  type InsertLeaveRequest,
  type LeaveRequest,
  type InsertAlert,
  type Alert,
  type InsertFinancialRecord,
  type FinancialRecord,
} from "@shared/schema";

export interface IStorage {
  // User operations (Replit Auth required)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: string, role: User["role"]): Promise<User>;

  // Supplier operations
  getAllSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;

  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;

  // Lot operations
  getAllLots(): Promise<Lot[]>;
  getLot(id: number): Promise<Lot | undefined>;
  createLot(lot: InsertLot): Promise<Lot>;
  updateLot(id: number, lot: Partial<InsertLot>): Promise<Lot>;
  getActiveLotsByProduct(productId: number): Promise<Lot[]>;

  // Client operations
  getClient(id: number): Promise<Client | undefined>;
  getClientByUserId(userId: string): Promise<Client | undefined>;
  getClientByQRCode(qrCode: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client>;

  // Purchase operations
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchasesByClient(clientId: number): Promise<Purchase[]>;

  // Sale operations
  getAllSales(): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  createSaleItem(saleItem: InsertSaleItem): Promise<SaleItem>;

  // Employee operations
  getAllEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;

  // Work Schedule operations
  createWorkSchedule(schedule: InsertWorkSchedule): Promise<WorkSchedule>;
  getEmployeeSchedules(employeeId: number): Promise<WorkSchedule[]>;

  // Work Hour operations
  getAllWorkHours(): Promise<WorkHour[]>;
  createWorkHour(workHour: InsertWorkHour): Promise<WorkHour>;

  // Leave Request operations
  getAllLeaveRequests(): Promise<LeaveRequest[]>;
  getLeaveRequest(id: number): Promise<LeaveRequest | undefined>;
  createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest>;
  updateLeaveRequest(
    id: number,
    request: Partial<InsertLeaveRequest>
  ): Promise<LeaveRequest>;

  // Alert operations
  getAllAlerts(): Promise<Alert[]>;
  getActiveAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, alert: Partial<InsertAlert>): Promise<Alert>;

  // Financial Record operations
  createFinancialRecord(record: InsertFinancialRecord): Promise<FinancialRecord>;
  getAllFinancialRecords(): Promise<FinancialRecord[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (Replit Auth required)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async updateUserRole(id: string, role: User["role"]): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  // Supplier operations
  async getAllSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(suppliers.name);
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id));
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [created] = await db.insert(suppliers).values(supplier).returning();
    return created;
  }

  // Product operations
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.name);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(
    id: number,
    product: Partial<InsertProduct>
  ): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  // Lot operations
  async getAllLots(): Promise<Lot[]> {
    return await db.select().from(lots).orderBy(desc(lots.createdAt));
  }

  async getLot(id: number): Promise<Lot | undefined> {
    const [lot] = await db.select().from(lots).where(eq(lots.id, id));
    return lot;
  }

  async createLot(lot: InsertLot): Promise<Lot> {
    const [created] = await db.insert(lots).values(lot).returning();
    return created;
  }

  async updateLot(id: number, lot: Partial<InsertLot>): Promise<Lot> {
    const [updated] = await db
      .update(lots)
      .set(lot)
      .where(eq(lots.id, id))
      .returning();
    return updated;
  }

  async getActiveLotsByProduct(productId: number): Promise<Lot[]> {
    return await db
      .select()
      .from(lots)
      .where(
        and(
          eq(lots.productId, productId),
          eq(lots.status, "active"),
          sql`${lots.remainingQuantity} > 0`
        )
      )
      .orderBy(lots.expirationDate); // FEFO: First Expiring First Out
  }

  // Client operations
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClientByUserId(userId: string): Promise<Client | undefined> {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.userId, userId));
    return client;
  }

  async getClientByQRCode(qrCode: string): Promise<Client | undefined> {
    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.qrCode, qrCode));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [created] = await db.insert(clients).values(client).returning();
    return created;
  }

  async updateClient(
    id: number,
    client: Partial<InsertClient>
  ): Promise<Client> {
    const [updated] = await db
      .update(clients)
      .set(client)
      .where(eq(clients.id, id))
      .returning();
    return updated;
  }

  // Purchase operations
  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const [created] = await db.insert(purchases).values(purchase).returning();
    return created;
  }

  async getPurchasesByClient(clientId: number): Promise<Purchase[]> {
    return await db
      .select()
      .from(purchases)
      .where(eq(purchases.clientId, clientId))
      .orderBy(desc(purchases.purchaseDate));
  }

  // Sale operations
  async getAllSales(): Promise<Sale[]> {
    return await db.select().from(sales).orderBy(desc(sales.saleDate));
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const [created] = await db.insert(sales).values(sale).returning();
    return created;
  }

  async createSaleItem(saleItem: InsertSaleItem): Promise<SaleItem> {
    const [created] = await db.insert(saleItems).values(saleItem).returning();
    return created;
  }

  // Employee operations
  async getAllEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, id));
    return employee;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [created] = await db.insert(employees).values(employee).returning();
    return created;
  }

  // Work Schedule operations
  async createWorkSchedule(schedule: InsertWorkSchedule): Promise<WorkSchedule> {
    const [created] = await db
      .insert(workSchedules)
      .values(schedule)
      .returning();
    return created;
  }

  async getEmployeeSchedules(employeeId: number): Promise<WorkSchedule[]> {
    return await db
      .select()
      .from(workSchedules)
      .where(eq(workSchedules.employeeId, employeeId));
  }

  // Work Hour operations
  async getAllWorkHours(): Promise<WorkHour[]> {
    return await db.select().from(workHours).orderBy(desc(workHours.workDate));
  }

  async createWorkHour(workHour: InsertWorkHour): Promise<WorkHour> {
    const [created] = await db.insert(workHours).values(workHour).returning();
    return created;
  }

  // Leave Request operations
  async getAllLeaveRequests(): Promise<LeaveRequest[]> {
    return await db
      .select()
      .from(leaveRequests)
      .orderBy(desc(leaveRequests.createdAt));
  }

  async getLeaveRequest(id: number): Promise<LeaveRequest | undefined> {
    const [request] = await db
      .select()
      .from(leaveRequests)
      .where(eq(leaveRequests.id, id));
    return request;
  }

  async createLeaveRequest(request: InsertLeaveRequest): Promise<LeaveRequest> {
    const [created] = await db
      .insert(leaveRequests)
      .values(request)
      .returning();
    return created;
  }

  async updateLeaveRequest(
    id: number,
    request: Partial<InsertLeaveRequest>
  ): Promise<LeaveRequest> {
    const [updated] = await db
      .update(leaveRequests)
      .set(request)
      .where(eq(leaveRequests.id, id))
      .returning();
    return updated;
  }

  // Alert operations
  async getAllAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts).orderBy(desc(alerts.createdAt));
  }

  async getActiveAlerts(): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(eq(alerts.status, "active"))
      .orderBy(desc(alerts.createdAt));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [created] = await db.insert(alerts).values(alert).returning();
    return created;
  }

  async updateAlert(id: number, alert: Partial<InsertAlert>): Promise<Alert> {
    const [updated] = await db
      .update(alerts)
      .set(alert)
      .where(eq(alerts.id, id))
      .returning();
    return updated;
  }

  // Financial Record operations
  async createFinancialRecord(
    record: InsertFinancialRecord
  ): Promise<FinancialRecord> {
    const [created] = await db
      .insert(financialRecords)
      .values(record)
      .returning();
    return created;
  }

  async getAllFinancialRecords(): Promise<FinancialRecord[]> {
    return await db
      .select()
      .from(financialRecords)
      .orderBy(desc(financialRecords.recordDate));
  }
}

export const storage = new DatabaseStorage();
