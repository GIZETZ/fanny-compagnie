import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
  boolean,
  index,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "stock_manager",
  "cashier",
  "client",
  "hr",
  "supervisor",
]);

export const lotStatusEnum = pgEnum("lot_status", [
  "active",
  "expired",
  "depleted",
]);

export const requestTypeEnum = pgEnum("request_type", [
  "vacation",
  "sick_leave",
]);

export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "approved",
  "rejected",
]);

export const alertTypeEnum = pgEnum("alert_type", [
  "low_stock",
  "expired_product",
]);

export const alertStatusEnum = pgEnum("alert_status", [
  "active",
  "resolved",
]);

export const recordTypeEnum = pgEnum("record_type", [
  "investment",
  "revenue",
  "expense",
  "salary",
]);

export const employeeStatusEnum = pgEnum("employee_status", [
  "active",
  "inactive",
]);

export const dayOfWeekEnum = pgEnum("day_of_week", [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").notNull().default("client"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Suppliers
export const suppliers = pgTable("suppliers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  contact: varchar("contact", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// Products
export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  stockAlertThreshold: integer("stock_alert_threshold").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Lots
export const lots = pgTable("lots", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  matriculeId: varchar("matricule_id", { length: 100 }).notNull().unique(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  supplierId: integer("supplier_id")
    .notNull()
    .references(() => suppliers.id),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  initialQuantity: integer("initial_quantity").notNull(),
  remainingQuantity: integer("remaining_quantity").notNull(),
  entryDate: timestamp("entry_date").notNull().defaultNow(),
  expirationDate: timestamp("expiration_date").notNull(),
  status: lotStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLotSchema = createInsertSchema(lots).omit({
  id: true,
  createdAt: true,
});

export type InsertLot = z.infer<typeof insertLotSchema>;
export type Lot = typeof lots.$inferSelect;

// Clients
export const clients = pgTable("clients", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  qrCode: varchar("qr_code", { length: 255 }).notNull().unique(),
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  totalPurchases: integer("total_purchases").notNull().default(0),
  eligibleDiscountsRemaining: integer("eligible_discounts_remaining")
    .notNull()
    .default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// Purchases (for tracking client purchase history)
export const purchases = pgTable("purchases", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  discountApplied: boolean("discount_applied").notNull().default(false),
  discountPercentage: decimal("discount_percentage", {
    precision: 5,
    scale: 2,
  }).default("0"),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow(),
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  purchaseDate: true,
});

export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;

// Sales
export const sales = pgTable("sales", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  receiptNumber: varchar("receipt_number", { length: 100 })
    .notNull()
    .unique(),
  cashierId: varchar("cashier_id")
    .notNull()
    .references(() => users.id),
  clientId: integer("client_id").references(() => clients.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", {
    precision: 10,
    scale: 2,
  }).default("0"),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  saleDate: timestamp("sale_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  saleDate: true,
  createdAt: true,
});

export type InsertSale = z.infer<typeof insertSaleSchema>;
export type Sale = typeof sales.$inferSelect;

// Sale Items
export const saleItems = pgTable("sale_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  saleId: integer("sale_id")
    .notNull()
    .references(() => sales.id),
  lotId: integer("lot_id")
    .notNull()
    .references(() => lots.id),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export const insertSaleItemSchema = createInsertSchema(saleItems).omit({
  id: true,
});

export type InsertSaleItem = z.infer<typeof insertSaleItemSchema>;
export type SaleItem = typeof saleItems.$inferSelect;

// Employees
export const employees = pgTable("employees", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  hireDate: timestamp("hire_date").notNull(),
  status: employeeStatusEnum("status").notNull().default("active"),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

// Work Schedules
export const workSchedules = pgTable("work_schedules", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
  dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
  startTime: varchar("start_time", { length: 10 }).notNull(),
  endTime: varchar("end_time", { length: 10 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertWorkScheduleSchema = createInsertSchema(workSchedules).omit({
  id: true,
});

export type InsertWorkSchedule = z.infer<typeof insertWorkScheduleSchema>;
export type WorkSchedule = typeof workSchedules.$inferSelect;

// Work Hours
export const workHours = pgTable("work_hours", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
  workDate: timestamp("work_date").notNull(),
  hoursWorked: decimal("hours_worked", { precision: 5, scale: 2 }).notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
});

export const insertWorkHourSchema = createInsertSchema(workHours).omit({
  id: true,
});

export type InsertWorkHour = z.infer<typeof insertWorkHourSchema>;
export type WorkHour = typeof workHours.$inferSelect;

// Leave Requests
export const leaveRequests = pgTable("leave_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
  requestType: requestTypeEnum("request_type").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  reason: text("reason"),
  status: requestStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  createdAt: true,
});

export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;

// Alerts
export const alerts = pgTable("alerts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  alertType: alertTypeEnum("alert_type").notNull(),
  productId: integer("product_id").references(() => products.id),
  lotId: integer("lot_id").references(() => lots.id),
  message: text("message").notNull(),
  status: alertStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

// Financial Records
export const financialRecords = pgTable("financial_records", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  recordType: recordTypeEnum("record_type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  recordDate: timestamp("record_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFinancialRecordSchema = createInsertSchema(
  financialRecords
).omit({
  id: true,
  createdAt: true,
});

export type InsertFinancialRecord = z.infer<typeof insertFinancialRecordSchema>;
export type FinancialRecord = typeof financialRecords.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  client: one(clients, {
    fields: [users.id],
    references: [clients.userId],
  }),
  employee: one(employees, {
    fields: [users.id],
    references: [employees.userId],
  }),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  lots: many(lots),
}));

export const productsRelations = relations(products, ({ many }) => ({
  lots: many(lots),
  alerts: many(alerts),
}));

export const lotsRelations = relations(lots, ({ one, many }) => ({
  product: one(products, {
    fields: [lots.productId],
    references: [products.id],
  }),
  supplier: one(suppliers, {
    fields: [lots.supplierId],
    references: [suppliers.id],
  }),
  saleItems: many(saleItems),
  alerts: many(alerts),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id],
  }),
  purchases: many(purchases),
  sales: many(sales),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  client: one(clients, {
    fields: [purchases.clientId],
    references: [clients.id],
  }),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  cashier: one(users, {
    fields: [sales.cashierId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [sales.clientId],
    references: [clients.id],
  }),
  saleItems: many(saleItems),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  lot: one(lots, {
    fields: [saleItems.lotId],
    references: [lots.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  workSchedules: many(workSchedules),
  workHours: many(workHours),
  leaveRequests: many(leaveRequests),
}));

export const workSchedulesRelations = relations(workSchedules, ({ one }) => ({
  employee: one(employees, {
    fields: [workSchedules.employeeId],
    references: [employees.id],
  }),
}));

export const workHoursRelations = relations(workHours, ({ one }) => ({
  employee: one(employees, {
    fields: [workHours.employeeId],
    references: [employees.id],
  }),
}));

export const leaveRequestsRelations = relations(leaveRequests, ({ one }) => ({
  employee: one(employees, {
    fields: [leaveRequests.employeeId],
    references: [employees.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  product: one(products, {
    fields: [alerts.productId],
    references: [products.id],
  }),
  lot: one(lots, {
    fields: [alerts.lotId],
    references: [lots.id],
  }),
}));
