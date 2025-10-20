import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import {
  Card,
  CardContent,
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
} from "@/components/ui/dialog";
// QR Scanner
// Requires: npm i @yudiel/react-qr-scanner
import { Scanner } from "@yudiel/react-qr-scanner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  QrCode,
  Receipt,
  Search,
} from "lucide-react";
import { apiRequest, apiRequestJson, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Product, Lot, Client } from "@shared/schema";

type ClientWithUser = Client & { user?: { firstName?: string; lastName?: string } };

interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export default function Cashier() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientWithUser | null>(null);
  const [qrCodeInput, setQrCodeInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);

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

  const completeSaleMutation = useMutation({
    mutationFn: async (data: {
      items: { productId: number; quantity: number }[];
      clientId?: number;
      paymentMethod: string;
    }) => {
      return await apiRequestJson<any>("POST", "/api/sales", data);
    },
    onSuccess: async (data) => {
      console.debug("Sale success:", data);
      // Snapshot current cart and totals for the receipt before clearing state
      const safeUid = selectedClient?.userId
        ? `UID:${selectedClient.userId.slice(0, 6)}...`
        : "Client";
      const receiptSnapshot = {
        receiptNumber: (data as any).receiptNumber,
        paymentMethod: (data as any).paymentMethod,
        date: new Date().toISOString(),
        client: selectedClient,
        clientDisplayName: selectedClient
          ? ((): string => {
              const u: any = selectedClient.user || {};
              const fn = u.first_name ?? u.firstName ?? "";
              const ln = u.last_name ?? u.lastName ?? "";
              const full = `${fn} ${ln}`.trim();
              if (full.length > 0) return full;
              if (u.email) return u.email;
              return safeUid;
            })()
          : null,
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.unitPrice * item.quantity,
        })),
        subtotal,
        discountAmount,
        total,
      };
      queryClient.invalidateQueries({ queryKey: ["/api/lots"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      // Refresh selected client CRM (points/purchases) if any
      try {
        if (selectedClient?.id) {
          const refreshed = await apiRequestJson<ClientWithUser>(
            "GET",
            `/api/clients/${selectedClient.id}`,
            undefined,
          );
          setSelectedClient(refreshed);
        }
      } catch (e) {
        console.debug("Client refresh failed", e);
      }
      toast({
        title: "Vente effectuée",
        description: "La transaction a été enregistrée avec succès.",
      });
      setLastReceipt(receiptSnapshot);
      setShowReceipt(true);
      // Trigger browser print shortly after opening the receipt dialog
      setTimeout(() => {
        try {
          window.print();
        } catch {}
      }, 300);
      setCart([]);
      setQrCodeInput("");
    },
    onError: async (error: any) => {
      console.debug("Sale error:", error);
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
      // Try to display server error message if available
      const message = (error?.responseJSON?.message || error?.message || "Impossible d'effectuer la vente.");
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    },
  });

  const scanClientMutation = useMutation({
    mutationFn: async (qrCode: string) => {
      return await apiRequestJson<ClientWithUser>(
        "GET",
        `/api/clients/qr/${qrCode}`,
        undefined,
      );
    },
    onSuccess: (data) => {
      const base = data as ClientWithUser;
      // Enrich with user if missing
      if (!base.user && base.userId) {
        apiRequestJson<any>("GET", `/api/users/${base.userId}`, undefined)
          .then((user: any) => {
            setSelectedClient({ ...base, user });
            const fn = (user as any)?.first_name ?? (user as any)?.firstName ?? "";
            const ln = (user as any)?.last_name ?? (user as any)?.lastName ?? "";
            const full = `${fn} ${ln}`.trim();
            toast({
              title: "Client identifié",
              description: `Bienvenue ${full || (user as any)?.email || "Client"}!`,
            });
          })
          .catch(() => {
            setSelectedClient(base);
            toast({
              title: "Client identifié",
              description: `Bienvenue Client!`,
            });
          })
          .finally(() => setShowQRScanner(false));
      } else {
        setSelectedClient(base);
        const fn = (base.user as any)?.first_name ?? (base.user as any)?.firstName ?? "";
        const ln = (base.user as any)?.last_name ?? (base.user as any)?.lastName ?? "";
        const full = `${fn} ${ln}`.trim();
        toast({
          title: "Client identifié",
          description: `Bienvenue ${full || (base.user as any)?.email || "Client"}!`,
        });
        setShowQRScanner(false);
      }
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Client non trouvé.",
        variant: "destructive",
      });
    },
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

  const availableProducts = products.filter((product) => {
    const productLots = lots.filter(
      (lot) => lot.productId === product.id && lot.status === "active" && lot.remainingQuantity > 0
    );
    return productLots.length > 0;
  });

  const filteredProducts = availableProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const productLot = lots.find(
      (lot) => lot.productId === product.id && lot.status === "active" && lot.remainingQuantity > 0
    );
    if (!productLot) {
      toast({
        title: "Stock insuffisant",
        description: "Ce produit n'est plus en stock.",
        variant: "destructive",
      });
      return;
    }

    const existing = cart.find((item) => item.productId === product.id);
    if (existing) {
      updateQuantity(product.id, existing.quantity + 1);
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: Number(productLot.unitPrice),
        },
      ]);
    }
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.productId !== productId));
      return;
    }

    const totalStock = lots
      .filter((lot) => lot.productId === productId && lot.status === "active")
      .reduce((sum, lot) => sum + lot.remainingQuantity, 0);

    if (newQuantity > totalStock) {
      toast({
        title: "Stock insuffisant",
        description: `Seulement ${totalStock} unités disponibles.`,
        variant: "destructive",
      });
      return;
    }

    setCart(
      cart.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const discountAmount = selectedClient && selectedClient.eligibleDiscountsRemaining > 0 ? subtotal * 0.05 : 0;
  const total = subtotal - discountAmount;

  const handleCompleteSale = (paymentMethod: string) => {
    if (cart.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des articles avant de finaliser la vente.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedClient) {
      toast({
        title: "Client requis",
        description: "Scannez ou identifiez un client pour appliquer la fidélité et les réductions.",
        variant: "destructive",
      });
      return;
    }
    completeSaleMutation.mutate({
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      clientId: selectedClient.id,
      paymentMethod,
    });
  };

  const handleScanClient = () => {
    if (!qrCodeInput.trim()) {
      toast({
        title: "QR Code requis",
        description: "Veuillez entrer le code QR du client.",
        variant: "destructive",
      });
      return;
    }
    scanClientMutation.mutate(qrCodeInput);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Point de Vente</h1>
        <p className="text-sm text-muted-foreground">
          Effectuez des ventes et gérez les transactions
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Produits Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-product"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => {
                  const productLot = lots.find(
                    (lot) =>
                      lot.productId === product.id &&
                      lot.status === "active" &&
                      lot.remainingQuantity > 0
                  );
                  return (
                    <Card
                      key={product.id}
                      className="hover-elevate active-elevate-2 cursor-pointer"
                      onClick={() => addToCart(product)}
                      data-testid={`card-product-${product.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{product.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {product.category}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {lots
                              .filter(
                                (lot) =>
                                  lot.productId === product.id &&
                                  lot.status === "active"
                              )
                              .reduce((sum, lot) => sum + lot.remainingQuantity, 0)}{" "}
                            en stock
                          </Badge>
                        </div>
                        <p className="text-base font-semibold text-primary">
                          {productLot ? Number(productLot.unitPrice).toFixed(0) : "0"}{" "}
                          FCFA
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    Aucun produit disponible
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart and Checkout */}
        <div className="space-y-4">
          {/* Client Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedClient ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-md bg-muted">
                    <p className="font-medium text-sm">
                      {(() => {
                        const u: any = selectedClient.user || {};
                        const fn = u.first_name ?? u.firstName ?? "";
                        const ln = u.last_name ?? u.lastName ?? "";
                        const full = `${fn} ${ln}`.trim();
                        return full || u.email || (selectedClient.userId ? `UID:${selectedClient.userId.slice(0,6)}...` : "Client");
                      })()}
                    </p>
                    <p className="text-xs text-muted-foreground break-all">
                      QR: {selectedClient.qrCode}
                    </p>
                    <div className="text-xs text-muted-foreground flex items-center gap-4 mt-1">
                      <span>Points: {selectedClient.loyaltyPoints}</span>
                      <span>Achats: {selectedClient.totalPurchases}</span>
                    </div>
                    {selectedClient.eligibleDiscountsRemaining > 0 && (
                      <Badge variant="default" className="mt-2 text-xs">
                        {selectedClient.eligibleDiscountsRemaining} réduction(s) 5% disponible(s)
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedClient(null);
                      setQrCodeInput("");
                    }}
                    className="w-full"
                    data-testid="button-remove-client"
                  >
                    Retirer le client
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="qr-code" className="text-sm">
                      Code QR du client
                    </Label>
                    <Input
                      id="qr-code"
                      value={qrCodeInput}
                      onChange={(e) => setQrCodeInput(e.target.value)}
                      placeholder="Scanner ou entrer le code"
                      data-testid="input-client-qr"
                    />
                  </div>
                  <Button
                    onClick={handleScanClient}
                    disabled={scanClientMutation.isPending}
                    className="w-full"
                    size="sm"
                    data-testid="button-scan-client"
                  >
                    {scanClientMutation.isPending ? "Recherche..." : "Identifier"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowQRScanner(true)}
                    className="w-full"
                    size="sm"
                    data-testid="button-open-qr-camera"
                  >
                    Scanner avec la caméra
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Panier ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Panier vide
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {cart.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center gap-2 p-2 rounded-md bg-muted"
                          data-testid={`cart-item-${item.productId}`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.productName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.unitPrice.toFixed(0)} FCFA
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity - 1)
                              }
                              data-testid={`button-decrease-${item.productId}`}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity + 1)
                              }
                              data-testid={`button-increase-${item.productId}`}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive"
                              onClick={() => removeFromCart(item.productId)}
                              data-testid={`button-remove-${item.productId}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sous-total:</span>
                        <span className="font-medium">
                          {subtotal.toFixed(0)} FCFA
                        </span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-primary">
                          <span>Réduction (5%):</span>
                          <span>-{discountAmount.toFixed(0)} FCFA</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-base font-semibold">
                        <span>Total:</span>
                        <span data-testid="text-total">{total.toFixed(0)} FCFA</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <Label className="text-sm">Méthode de paiement</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => handleCompleteSale("cash")}
                          disabled={completeSaleMutation.isPending}
                          data-testid="button-pay-cash"
                        >
                          Espèces
                        </Button>
                        <Button
                          onClick={() => handleCompleteSale("card")}
                          disabled={completeSaleMutation.isPending}
                          variant="outline"
                          data-testid="button-pay-card"
                        >
                          Carte
                        </Button>
                      </div>
                      <Button
                        onClick={() => handleCompleteSale("mobile")}
                        disabled={completeSaleMutation.isPending}
                        variant="outline"
                        className="w-full"
                        data-testid="button-pay-mobile"
                      >
                        Mobile Money
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reçu de Vente</DialogTitle>
            <DialogDescription>
              Transaction effectuée avec succès
            </DialogDescription>
          </DialogHeader>
          {lastReceipt && (
            <div className="space-y-4 font-mono text-sm">
              <div className="text-center border-b pb-3">
                <h3 className="font-bold text-base">Fanny & Compagnie</h3>
                <p className="text-xs text-muted-foreground">Supermarché</p>
              </div>
              <div className="space-y-1 text-xs">
                <p>Reçu: {lastReceipt.receiptNumber}</p>
                <p>Date: {new Date(lastReceipt.date).toLocaleString("fr-FR")}</p>
                {lastReceipt.clientDisplayName && (
                  <p>Client: {lastReceipt.clientDisplayName}</p>
                )}
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="font-semibold text-xs mb-2">Articles:</p>
                {lastReceipt.items.map((item: any) => (
                  <div key={item.productId} className="flex justify-between text-xs">
                    <span>
                      {item.productName} x{item.quantity}
                    </span>
                    <span>{(item.subtotal).toFixed(0)} FCFA</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span>{Number(lastReceipt.subtotal).toFixed(0)} FCFA</span>
                </div>
                {Number(lastReceipt.discountAmount) > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Réduction:</span>
                    <span>-{Number(lastReceipt.discountAmount).toFixed(0)} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>TOTAL:</span>
                  <span>{Number(lastReceipt.total).toFixed(0)} FCFA</span>
                </div>
              </div>
              <div className="text-center text-xs text-muted-foreground pt-3 border-t">
                <p>Merci de votre visite!</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Scanner Dialog */}
      <Dialog open={showQRScanner} onOpenChange={setShowQRScanner}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scanner le code QR</DialogTitle>
            <DialogDescription>
              Alignez le code QR du client dans le cadre pour l’identifier automatiquement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-md overflow-hidden">
              <Scanner
                onScan={(detected) => {
                  const value = Array.isArray(detected) && detected[0]?.rawValue
                    ? String(detected[0].rawValue)
                    : "";
                  if (!value) return;
                  setQrCodeInput(value);
                  scanClientMutation.mutate(value);
                }}
                onError={(_err) => { /* ignore camera errors for now */ }}
                constraints={{ facingMode: "environment" }}
                scanDelay={400}
              />
            </div>
            <Button variant="outline" onClick={() => setShowQRScanner(false)} className="w-full">
              Annuler
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
