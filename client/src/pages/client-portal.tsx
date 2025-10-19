import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Gift, ShoppingBag, TrendingUp } from "lucide-react";
import type { Client, Purchase } from "@shared/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import QRCode from "qrcode";

export default function ClientPortal() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

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

  const { data: clientData } = useQuery<Client>({
    queryKey: ["/api/clients/me"],
    enabled: isAuthenticated,
  });

  const { data: purchases = [] } = useQuery<Purchase[]>({
    queryKey: ["/api/clients/purchases"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (clientData?.qrCode && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, clientData.qrCode, {
        width: 200,
        margin: 2,
      });
    }
  }, [clientData]);

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

  if (!clientData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Profil client introuvable</CardTitle>
            <CardDescription>
              Votre compte client n'a pas encore été créé. Contactez le personnel du
              supermarché.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const qualifyingPurchases = purchases.filter(
    (p) => Number(p.amount) >= 5000
  ).length;
  const progress = Math.min((qualifyingPurchases / 10) * 100, 100);
  const needsMore = Math.max(10 - qualifyingPurchases, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Ma Carte de Fidélité</h1>
        <p className="text-sm text-muted-foreground">
          Programme de fidélité Fanny & Compagnie
        </p>
      </div>

      <div className="space-y-6">
        {/* Loyalty Card */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">
                    Carte de Fidélité
                  </span>
                </div>
                <h2 className="text-2xl font-bold">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-sm opacity-75 mt-1">{user?.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-75">Points</p>
                <p className="text-3xl font-bold">{clientData.loyaltyPoints}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs opacity-75">Achats totaux</p>
                  <p className="text-xl font-semibold">
                    {clientData.totalPurchases}
                  </p>
                </div>
                {clientData.eligibleDiscountsRemaining > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-white/30 text-sm px-3 py-1"
                  >
                    <Gift className="w-4 h-4 mr-1" />
                    {clientData.eligibleDiscountsRemaining} réduction(s) 5%
                  </Badge>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs opacity-75 mb-1">Code Client</p>
                <p className="font-mono text-sm font-medium">
                  {clientData.qrCode.split("-")[1]?.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Code QR</CardTitle>
            <CardDescription>
              Présentez ce code en caisse pour bénéficier de vos avantages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="p-4 rounded-lg bg-white border-2 border-border">
                <canvas
                  ref={qrCanvasRef}
                  data-testid="canvas-qr-code"
                  className="block"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-3 text-center">
                Code: {clientData.qrCode}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Loyalty Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Progression vers la réduction
            </CardTitle>
            <CardDescription>
              Effectuez 10 achats de 5000 FCFA minimum pour débloquer 5 réductions de
              5%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  {qualifyingPurchases} / 10 achats qualifiants
                </span>
                <span className="text-sm text-muted-foreground">
                  {progress.toFixed(0)}%
                </span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
            {needsMore > 0 ? (
              <p className="text-sm text-muted-foreground">
                Plus que {needsMore} achat(s) de 5000 FCFA minimum pour débloquer vos
                réductions!
              </p>
            ) : (
              <Badge variant="default" className="text-sm">
                <Gift className="w-4 h-4 mr-1" />
                Félicitations! Vous avez débloqué vos réductions
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Historique d'Achats
            </CardTitle>
            <CardDescription>Vos dernières transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun achat pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {purchases.slice(0, 10).map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between p-3 rounded-md bg-muted"
                    data-testid={`purchase-${purchase.id}`}
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {Number(purchase.finalAmount).toFixed(0)} FCFA
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(purchase.purchaseDate!),
                          "d MMM yyyy à HH:mm",
                          { locale: fr }
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      {purchase.discountApplied && (
                        <Badge variant="default" className="text-xs mb-1">
                          -5%
                        </Badge>
                      )}
                      {Number(purchase.amount) >= 5000 && (
                        <Badge variant="outline" className="text-xs">
                          Qualifiant
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
