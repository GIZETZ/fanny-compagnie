import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ShoppingCart, CreditCard, Users, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary mb-6">
            <span className="text-primary-foreground font-bold text-3xl">F&C</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Fanny & Compagnie
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Système de gestion complet pour votre supermarché
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => {
                window.location.href = "/api/login";
              }}
              data-testid="button-login"
              className="text-base px-8"
            >
              Se Connecter
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                window.location.href = "/api/login";
              }}
              data-testid="button-login-pending"
              className="text-base px-8"
            >
              Se Connecter (en attente de rôle)
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-md bg-chart-1/10 flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-chart-1" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Gestion des Stocks</h3>
              <p className="text-sm text-muted-foreground">
                Gérez vos produits, lots et fournisseurs avec alertes automatiques
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-md bg-chart-2/10 flex items-center justify-center mb-4">
                <ShoppingCart className="w-6 h-6 text-chart-2" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Point de Vente</h3>
              <p className="text-sm text-muted-foreground">
                Interface caissière optimisée avec gestion des réductions clients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fidélité Client</h3>
              <p className="text-sm text-muted-foreground">
                Programme de fidélité avec réductions automatiques et code QR
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-md bg-chart-3/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-chart-3" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Ressources Humaines</h3>
              <p className="text-sm text-muted-foreground">
                Gestion des employés, horaires et demandes de congé
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-md bg-chart-4/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-chart-4" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Supervision</h3>
              <p className="text-sm text-muted-foreground">
                Tableau de bord complet avec statistiques et analyses financières
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-1">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Multi-Rôles</h3>
                <p className="text-sm text-muted-foreground">
                  5 modules interconnectés pour une gestion complète
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Fanny & Compagnie. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
