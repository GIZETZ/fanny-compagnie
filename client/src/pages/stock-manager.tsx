import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Product, Lot, Supplier, Alert } from "@shared/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function StockManager() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("lots");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Non autorisé",
        description: "Vous devez vous connecter pour accéder à cette page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: lots = [] } = useQuery<Lot[]>({
    queryKey: ["/api/lots"],
  });

  const { data: suppliers = [] } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const totalStock = lots.reduce((sum, lot) => sum + lot.remainingQuantity, 0);
  const lowStockCount = activeAlerts.filter((a) => a.alertType === "low_stock").length;
  const expiredCount = activeAlerts.filter((a) => a.alertType === "expired_product").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Gestion des Stocks</h1>
        <p className="text-sm text-muted-foreground">
          Gérez vos produits, lots et fournisseurs
        </p>
      </div>

      {/* Alerts Section */}
      {activeAlerts.length > 0 && (
        <div className="space-y-3">
          {activeAlerts.slice(0, 3).map((alert) => (
            <Card
              key={alert.id}
              className={
                alert.alertType === "expired_product"
                  ? "border-destructive/50 bg-destructive/5"
                  : "border-yellow-500/50 bg-yellow-500/5"
              }
            >
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    alert.alertType === "expired_product"
                      ? "text-destructive"
                      : "text-yellow-600"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(alert.createdAt!), "d MMM yyyy à HH:mm", {
                      locale: fr,
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    try {
                      await apiRequest("PATCH", `/api/alerts/${alert.id}`, {
                        status: "resolved",
                      });
                      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
                      toast({
                        title: "Alerte résolue",
                        description: "L'alerte a été marquée comme résolue.",
                      });
                    } catch (error) {
                      toast({
                        title: "Erreur",
                        description: "Impossible de résoudre l'alerte.",
                        variant: "destructive",
                      });
                    }
                  }}
                  data-testid={`button-resolve-alert-${alert.id}`}
                >
                  Résoudre
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Produits
                </p>
                <p className="text-2xl font-semibold mt-1">{products.length}</p>
              </div>
              <div className="w-12 h-12 rounded-md bg-chart-1/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Stock Total
                </p>
                <p className="text-2xl font-semibold mt-1">{totalStock}</p>
              </div>
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Stock Bas
                </p>
                <p className="text-2xl font-semibold mt-1">{lowStockCount}</p>
              </div>
              <div className="w-12 h-12 rounded-md bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Produits Périmés
                </p>
                <p className="text-2xl font-semibold mt-1">{expiredCount}</p>
              </div>
              <div className="w-12 h-12 rounded-md bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventaire</CardTitle>
              <CardDescription>
                Gérez vos produits, lots et fournisseurs
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <AddProductDialog />
              <AddLotDialog products={products} suppliers={suppliers} />
              <AddSupplierDialog />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="lots" data-testid="tab-lots">
                Lots
              </TabsTrigger>
              <TabsTrigger value="products" data-testid="tab-products">
                Produits
              </TabsTrigger>
              <TabsTrigger value="suppliers" data-testid="tab-suppliers">
                Fournisseurs
              </TabsTrigger>
            </TabsList>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>

            <TabsContent value="lots">
              <LotsTable lots={lots} products={products} suppliers={suppliers} searchTerm={searchTerm} />
            </TabsContent>

            <TabsContent value="products">
              <ProductsTable products={products} searchTerm={searchTerm} />
            </TabsContent>

            <TabsContent value="suppliers">
              <SuppliersTable suppliers={suppliers} searchTerm={searchTerm} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Component for Lots Table
function LotsTable({
  lots,
  products,
  suppliers,
  searchTerm,
}: {
  lots: Lot[];
  products: Product[];
  suppliers: Supplier[];
  searchTerm: string;
}) {
  const filteredLots = lots.filter((lot) => {
    const product = products.find((p) => p.id === lot.productId);
    const supplier = suppliers.find((s) => s.id === lot.supplierId);
    return (
      lot.matriculeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (filteredLots.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Aucun lot trouvé</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Matricule</TableHead>
            <TableHead>Produit</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Prix Unitaire</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Expiration</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLots.map((lot) => {
            const product = products.find((p) => p.id === lot.productId);
            const supplier = suppliers.find((s) => s.id === lot.supplierId);
            return (
              <TableRow key={lot.id} data-testid={`row-lot-${lot.id}`}>
                <TableCell className="font-mono text-sm">
                  {lot.matriculeId}
                </TableCell>
                <TableCell>{product?.name || "-"}</TableCell>
                <TableCell>{supplier?.name || "-"}</TableCell>
                <TableCell>{Number(lot.unitPrice).toFixed(0)} FCFA</TableCell>
                <TableCell>
                  {lot.remainingQuantity} / {lot.initialQuantity}
                </TableCell>
                <TableCell>
                  {format(new Date(lot.expirationDate), "d MMM yyyy", {
                    locale: fr,
                  })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      lot.status === "active"
                        ? "default"
                        : lot.status === "expired"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {lot.status}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// Component for Products Table
function ProductsTable({
  products,
  searchTerm,
}: {
  products: Product[];
  searchTerm: string;
}) {
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Aucun produit trouvé</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Seuil d'Alerte</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product) => (
            <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{product.category}</Badge>
              </TableCell>
              <TableCell>{product.stockAlertThreshold}</TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                {product.description || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Component for Suppliers Table
function SuppliersTable({
  suppliers,
  searchTerm,
}: {
  suppliers: Supplier[];
  searchTerm: string;
}) {
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredSuppliers.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Aucun fournisseur trouvé</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Téléphone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSuppliers.map((supplier) => (
            <TableRow key={supplier.id} data-testid={`row-supplier-${supplier.id}`}>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>{supplier.contact || "-"}</TableCell>
              <TableCell>{supplier.email || "-"}</TableCell>
              <TableCell>{supplier.phone || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Dialogs for adding entities
function AddProductDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: {
      name: string;
      category: string;
      description: string;
      stockAlertThreshold: number;
    }) => {
      await apiRequest("POST", "/api/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté avec succès.",
      });
      setOpen(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Reconnexion en cours...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      stockAlertThreshold: parseInt(formData.get("threshold") as string),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" data-testid="button-add-product">
          <Plus className="w-4 h-4 mr-2" />
          Produit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un Produit</DialogTitle>
          <DialogDescription>
            Créez un nouveau produit dans votre inventaire.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom du produit</Label>
            <Input
              id="name"
              name="name"
              required
              data-testid="input-product-name"
            />
          </div>
          <div>
            <Label htmlFor="category">Catégorie</Label>
            <Input
              id="category"
              name="category"
              required
              data-testid="input-product-category"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              data-testid="input-product-description"
            />
          </div>
          <div>
            <Label htmlFor="threshold">Seuil d'alerte</Label>
            <Input
              id="threshold"
              name="threshold"
              type="number"
              defaultValue={10}
              required
              data-testid="input-product-threshold"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
            data-testid="button-submit-product"
          >
            {mutation.isPending ? "Ajout..." : "Ajouter"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddLotDialog({
  products,
  suppliers,
}: {
  products: Product[];
  suppliers: Supplier[];
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: {
      productId: number;
      supplierId: number;
      unitPrice: string;
      initialQuantity: number;
      expirationDate: string;
    }) => {
      await apiRequest("POST", "/api/lots", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lots"] });
      toast({
        title: "Lot ajouté",
        description: "Le lot a été ajouté avec succès.",
      });
      setOpen(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Reconnexion en cours...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le lot.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      productId: parseInt(formData.get("productId") as string),
      supplierId: parseInt(formData.get("supplierId") as string),
      unitPrice: formData.get("unitPrice") as string,
      initialQuantity: parseInt(formData.get("quantity") as string),
      expirationDate: formData.get("expirationDate") as string,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" data-testid="button-add-lot">
          <Plus className="w-4 h-4 mr-2" />
          Lot
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un Lot</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau lot de produits à votre stock.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="productId">Produit</Label>
            <Select name="productId" required>
              <SelectTrigger data-testid="select-lot-product">
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="supplierId">Fournisseur</Label>
            <Select name="supplierId" required>
              <SelectTrigger data-testid="select-lot-supplier">
                <SelectValue placeholder="Sélectionner un fournisseur" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="unitPrice">Prix unitaire (FCFA)</Label>
            <Input
              id="unitPrice"
              name="unitPrice"
              type="number"
              step="0.01"
              required
              data-testid="input-lot-price"
            />
          </div>
          <div>
            <Label htmlFor="quantity">Quantité</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              required
              data-testid="input-lot-quantity"
            />
          </div>
          <div>
            <Label htmlFor="expirationDate">Date d'expiration</Label>
            <Input
              id="expirationDate"
              name="expirationDate"
              type="date"
              required
              data-testid="input-lot-expiration"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
            data-testid="button-submit-lot"
          >
            {mutation.isPending ? "Ajout..." : "Ajouter"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddSupplierDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: {
      name: string;
      contact: string;
      email: string;
      phone: string;
    }) => {
      await apiRequest("POST", "/api/suppliers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      toast({
        title: "Fournisseur ajouté",
        description: "Le fournisseur a été ajouté avec succès.",
      });
      setOpen(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Reconnexion en cours...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le fournisseur.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      name: formData.get("name") as string,
      contact: formData.get("contact") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" data-testid="button-add-supplier">
          <Plus className="w-4 h-4 mr-2" />
          Fournisseur
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un Fournisseur</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau fournisseur à votre base de données.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              name="name"
              required
              data-testid="input-supplier-name"
            />
          </div>
          <div>
            <Label htmlFor="contact">Contact</Label>
            <Input id="contact" name="contact" data-testid="input-supplier-contact" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              data-testid="input-supplier-email"
            />
          </div>
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" name="phone" data-testid="input-supplier-phone" />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
            data-testid="button-submit-supplier"
          >
            {mutation.isPending ? "Ajout..." : "Ajouter"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
