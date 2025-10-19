import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./googleAuth";
import { nanoid } from "nanoid";

// Helper function to generate unique matricule ID for lots
function generateMatriculeId(): string {
  const timestamp = Date.now();
  const random = nanoid(8);
  return `LOT-${timestamp}-${random}`;
}

// Helper function to generate unique QR code for clients
function generateQRCode(userId: string): string {
  const uuid = nanoid(12);
  return `CLIENT-${userId}-${uuid}`;
}

// Helper function to generate unique receipt number
function generateReceiptNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const sequential = nanoid(6);
  return `REC-${date}-${sequential}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Supplier routes
  app.get("/api/suppliers", isAuthenticated, async (req, res) => {
    try {
      const suppliers = await storage.getAllSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", isAuthenticated, async (req, res) => {
    try {
      const supplier = await storage.createSupplier(req.body);
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  // Product routes
  app.get("/api/products", isAuthenticated, async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Lot routes
  app.get("/api/lots", isAuthenticated, async (req, res) => {
    try {
      const lots = await storage.getAllLots();
      res.json(lots);
    } catch (error) {
      console.error("Error fetching lots:", error);
      res.status(500).json({ message: "Failed to fetch lots" });
    }
  });

  app.post("/api/lots", isAuthenticated, async (req, res) => {
    try {
      const matriculeId = generateMatriculeId();
      const lot = await storage.createLot({
        ...req.body,
        matriculeId,
        remainingQuantity: req.body.initialQuantity,
        status: "active",
      });

      // Check if we need to create an alert for low stock
      const product = await storage.getProduct(lot.productId);
      if (product && lot.remainingQuantity < product.stockAlertThreshold) {
        await storage.createAlert({
          alertType: "low_stock",
          productId: lot.productId,
          lotId: lot.id,
          message: `Stock faible pour ${product.name} - Lot ${lot.matriculeId}`,
          status: "active",
        });
      }

      res.status(201).json(lot);
    } catch (error) {
      console.error("Error creating lot:", error);
      res.status(500).json({ message: "Failed to create lot" });
    }
  });

  // Client routes
  app.get("/api/clients/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      let client = await storage.getClientByUserId(userId);

      // Auto-create client profile if it doesn't exist
      if (!client) {
        const qrCode = generateQRCode(userId);
        client = await storage.createClient({
          userId,
          qrCode,
          loyaltyPoints: 0,
          totalPurchases: 0,
          eligibleDiscountsRemaining: 0,
        });
      }

      // Get user details
      const user = await storage.getUser(userId);
      res.json({ ...client, user });
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.get("/api/clients/qr/:qrCode", isAuthenticated, async (req, res) => {
    try {
      const client = await storage.getClientByQRCode(req.params.qrCode);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      // Get user details
      const user = await storage.getUser(client.userId);
      res.json({ ...client, user });
    } catch (error) {
      console.error("Error fetching client by QR:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.get("/api/clients/purchases", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const client = await storage.getClientByUserId(userId);

      if (!client) {
        return res.json([]);
      }

      const purchases = await storage.getPurchasesByClient(client.id);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  // Sales routes with FEFO logic and loyalty system
  app.post("/api/sales", isAuthenticated, async (req: any, res) => {
    try {
      const { items, clientId, paymentMethod } = req.body;
      const cashierId = req.user.id;

      // Calculate totals and apply FEFO
      let totalAmount = 0;
      const saleItemsData: any[] = [];

      for (const item of items) {
        const { productId, quantity } = item;

        // Get active lots for this product (ordered by expiration date - FEFO)
        const availableLots = await storage.getActiveLotsByProduct(productId);

        let remainingQuantity = quantity;
        let itemTotal = 0;

        for (const lot of availableLots) {
          if (remainingQuantity <= 0) break;

          const quantityFromThisLot = Math.min(
            remainingQuantity,
            lot.remainingQuantity
          );

          // Update lot quantity
          const newRemainingQuantity =
            lot.remainingQuantity - quantityFromThisLot;
          await storage.updateLot(lot.id, {
            remainingQuantity: newRemainingQuantity,
            status: newRemainingQuantity === 0 ? "depleted" : "active",
          });

          // Add to sale items
          const subtotal = Number(lot.unitPrice) * quantityFromThisLot;
          saleItemsData.push({
            lotId: lot.id,
            productId,
            quantity: quantityFromThisLot,
            unitPrice: lot.unitPrice,
            subtotal: subtotal.toString(),
          });

          itemTotal += subtotal;
          remainingQuantity -= quantityFromThisLot;

          // Check if we need to create a low stock alert
          const product = await storage.getProduct(productId);
          if (product && newRemainingQuantity < product.stockAlertThreshold) {
            // Check if alert already exists
            const existingAlerts = await storage.getActiveAlerts();
            const hasAlert = existingAlerts.some(
              (a) => a.lotId === lot.id && a.alertType === "low_stock"
            );

            if (!hasAlert) {
              await storage.createAlert({
                alertType: "low_stock",
                productId,
                lotId: lot.id,
                message: `Stock faible pour ${product.name} - Lot ${lot.matriculeId}`,
                status: "active",
              });
            }
          }
        }

        if (remainingQuantity > 0) {
          return res.status(400).json({
            message: `Stock insuffisant pour le produit ${productId}`,
          });
        }

        totalAmount += itemTotal;
      }

      // Apply loyalty discount if client is provided
      let discountAmount = 0;
      let discountApplied = false;
      let client = null;

      if (clientId) {
        client = await storage.getClient(clientId);

        if (client && client.eligibleDiscountsRemaining > 0) {
          discountAmount = totalAmount * 0.05; // 5% discount
          discountApplied = true;

          // Update client discount count
          await storage.updateClient(clientId, {
            eligibleDiscountsRemaining: client.eligibleDiscountsRemaining - 1,
            totalPurchases: client.totalPurchases + 1,
            loyaltyPoints: client.loyaltyPoints + Math.floor(totalAmount / 1000),
          });
        } else if (client) {
          // Just update purchase count and points
          await storage.updateClient(clientId, {
            totalPurchases: client.totalPurchases + 1,
            loyaltyPoints: client.loyaltyPoints + Math.floor(totalAmount / 1000),
          });
        }

        // Check if client qualifies for new discounts
        if (client) {
          const purchases = await storage.getPurchasesByClient(clientId);
          const qualifyingPurchases = purchases.filter(
            (p) => Number(p.amount) >= 5000
          ).length;

          // If this purchase is qualifying, add 1 to the count
          const totalQualifying =
            qualifyingPurchases + (totalAmount >= 5000 ? 1 : 0);

          // Award 5 discounts for every 10 qualifying purchases
          if (
            totalQualifying >= 10 &&
            totalQualifying % 10 === 0 &&
            client.eligibleDiscountsRemaining === 0
          ) {
            await storage.updateClient(clientId, {
              eligibleDiscountsRemaining: 5,
            });
          }
        }

        // Record purchase in purchases table
        await storage.createPurchase({
          clientId,
          amount: totalAmount.toString(),
          discountApplied,
          discountPercentage: discountApplied ? "5" : "0",
          finalAmount: (totalAmount - discountAmount).toString(),
        });
      }

      const finalAmount = totalAmount - discountAmount;

      // Create sale
      const receiptNumber = generateReceiptNumber();
      const sale = await storage.createSale({
        receiptNumber,
        cashierId,
        clientId: clientId || null,
        totalAmount: totalAmount.toString(),
        discountAmount: discountAmount.toString(),
        finalAmount: finalAmount.toString(),
        paymentMethod,
      });

      // Create sale items
      for (const saleItemData of saleItemsData) {
        await storage.createSaleItem({
          saleId: sale.id,
          ...saleItemData,
        });
      }

      // Create financial record for revenue
      await storage.createFinancialRecord({
        recordType: "revenue",
        amount: finalAmount.toString(),
        description: `Vente ${receiptNumber}`,
        recordDate: new Date(),
      });

      res.status(201).json(sale);
    } catch (error) {
      console.error("Error creating sale:", error);
      res.status(500).json({ message: "Failed to create sale" });
    }
  });

  app.get("/api/sales", isAuthenticated, async (req, res) => {
    try {
      const sales = await storage.getAllSales();
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  // Employee routes
  app.get("/api/employees", isAuthenticated, async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();

      // Enrich with user data
      const enrichedEmployees = await Promise.all(
        employees.map(async (employee) => {
          const user = await storage.getUser(employee.userId);
          return { ...employee, user };
        })
      );

      res.json(enrichedEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", isAuthenticated, async (req, res) => {
    try {
      const employee = await storage.createEmployee(req.body);
      res.status(201).json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  // Work Hours routes
  app.get("/api/work-hours", isAuthenticated, async (req, res) => {
    try {
      const workHours = await storage.getAllWorkHours();
      res.json(workHours);
    } catch (error) {
      console.error("Error fetching work hours:", error);
      res.status(500).json({ message: "Failed to fetch work hours" });
    }
  });

  app.post("/api/work-hours", isAuthenticated, async (req, res) => {
    try {
      const workHour = await storage.createWorkHour(req.body);
      res.status(201).json(workHour);
    } catch (error) {
      console.error("Error creating work hour:", error);
      res.status(500).json({ message: "Failed to create work hour" });
    }
  });

  // Leave Request routes
  app.get("/api/leave-requests", isAuthenticated, async (req, res) => {
    try {
      const requests = await storage.getAllLeaveRequests();

      // Enrich with employee and user data
      const enrichedRequests = await Promise.all(
        requests.map(async (request) => {
          const employee = await storage.getEmployee(request.employeeId);
          if (employee) {
            const user = await storage.getUser(employee.userId);
            return { ...request, employee: { ...employee, user } };
          }
          return request;
        })
      );

      res.json(enrichedRequests);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  app.post("/api/leave-requests", isAuthenticated, async (req, res) => {
    try {
      const request = await storage.createLeaveRequest(req.body);
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating leave request:", error);
      res.status(500).json({ message: "Failed to create leave request" });
    }
  });

  app.patch("/api/leave-requests/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateLeaveRequest(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating leave request:", error);
      res.status(500).json({ message: "Failed to update leave request" });
    }
  });

  // Alert routes
  app.get("/api/alerts", isAuthenticated, async (req, res) => {
    try {
      const alerts = await storage.getAllAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.patch("/api/alerts/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateAlert(id, {
        ...req.body,
        resolvedAt: req.body.status === "resolved" ? new Date() : undefined,
      });
      res.json(updated);
    } catch (error) {
      console.error("Error updating alert:", error);
      res.status(500).json({ message: "Failed to update alert" });
    }
  });

  // Supervisor stats route
  app.get("/api/supervisor/stats", isAuthenticated, async (req, res) => {
    try {
      // Get all data
      const [
        products,
        lots,
        sales,
        employees,
        financialRecords,
        alerts,
      ] = await Promise.all([
        storage.getAllProducts(),
        storage.getAllLots(),
        storage.getAllSales(),
        storage.getAllEmployees(),
        storage.getAllFinancialRecords(),
        storage.getActiveAlerts(),
      ]);

      // Calculate stock stats
      const totalStock = lots.reduce(
        (sum, lot) => sum + lot.remainingQuantity,
        0
      );
      const lowStockCount = alerts.filter(
        (a) => a.alertType === "low_stock"
      ).length;
      const expiredCount = alerts.filter(
        (a) => a.alertType === "expired_product"
      ).length;

      // Calculate sales stats
      const totalSales = sales.length;
      const salesRevenue = sales.reduce(
        (sum, sale) => sum + Number(sale.finalAmount),
        0
      );

      // Calculate employee stats
      const activeEmployees = employees.filter(
        (e) => e.status === "active"
      ).length;

      // Calculate financial stats
      const totalInvestments = financialRecords
        .filter((r) => r.recordType === "investment")
        .reduce((sum, r) => sum + Number(r.amount), 0);

      const totalExpenses = financialRecords
        .filter((r) => r.recordType === "expense" || r.recordType === "salary")
        .reduce((sum, r) => sum + Number(r.amount), 0);

      const totalSalaries = financialRecords
        .filter((r) => r.recordType === "salary")
        .reduce((sum, r) => sum + Number(r.amount), 0);

      const netRevenue = salesRevenue - totalExpenses;

      // Sales by category (mock data for now - would need product joins)
      const salesByCategory: any[] = [];

      // Recent sales trend (last 7 days)
      const recentSales: any[] = [];

      res.json({
        totalProducts: products.length,
        totalStock,
        lowStockCount,
        expiredCount,
        totalSales,
        salesRevenue: Math.round(salesRevenue),
        totalEmployees: employees.length,
        activeEmployees,
        totalSalaries: Math.round(totalSalaries),
        totalInvestments: Math.round(totalInvestments),
        totalExpenses: Math.round(totalExpenses),
        netRevenue: Math.round(netRevenue),
        salesByCategory,
        recentSales,
      });
    } catch (error) {
      console.error("Error fetching supervisor stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}