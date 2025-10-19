import { useEffect } from "react";
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
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Supervisor() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: stats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/supervisor/stats"],
  });

  if (isLoading || !isAuthenticated || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const {
    totalProducts = 0,
    totalStock = 0,
    lowStockCount = 0,
    expiredCount = 0,
    totalSales = 0,
    salesRevenue = 0,
    totalEmployees = 0,
    activeEmployees = 0,
    totalSalaries = 0,
    totalInvestments = 0,
    totalExpenses = 0,
    netRevenue = 0,
    salesByCategory = [],
    recentSales = [],
  } = stats || {};

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Tableau de Bord Superviseur</h1>
        <p className="text-sm text-muted-foreground">
          Vue d'ensemble des performances et statistiques
        </p>
      </div>

      {/* Stock & Inventory Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Inventaire & Stock</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Produits
                  </p>
                  <p className="text-2xl font-semibold mt-1">{totalProducts}</p>
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
      </div>

      {/* Sales Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Ventes</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Ventes
                  </p>
                  <p className="text-2xl font-semibold mt-1">{totalSales}</p>
                </div>
                <div className="w-12 h-12 rounded-md bg-chart-2/10 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-chart-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Chiffre d'Affaires
                  </p>
                  <p className="text-2xl font-semibold mt-1">
                    {salesRevenue.toLocaleString()} FCFA
                  </p>
                </div>
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Vente Moyenne
                  </p>
                  <p className="text-2xl font-semibold mt-1">
                    {totalSales > 0
                      ? (salesRevenue / totalSales).toFixed(0)
                      : 0}{" "}
                    FCFA
                  </p>
                </div>
                <div className="w-12 h-12 rounded-md bg-chart-5/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-chart-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Employee Stats */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Personnel</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Employés
                  </p>
                  <p className="text-2xl font-semibold mt-1">{totalEmployees}</p>
                </div>
                <div className="w-12 h-12 rounded-md bg-chart-3/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Employés Actifs
                  </p>
                  <p className="text-2xl font-semibold mt-1">{activeEmployees}</p>
                </div>
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Masse Salariale
                  </p>
                  <p className="text-2xl font-semibold mt-1">
                    {totalSalaries.toLocaleString()} FCFA
                  </p>
                </div>
                <div className="w-12 h-12 rounded-md bg-chart-4/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-chart-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Financial Overview */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Finances</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Chiffre d'Affaires
                </p>
                <p className="text-2xl font-semibold text-primary">
                  {salesRevenue.toLocaleString()} FCFA
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Investissements
                </p>
                <p className="text-2xl font-semibold text-chart-1">
                  {totalInvestments.toLocaleString()} FCFA
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Dépenses
                </p>
                <p className="text-2xl font-semibold text-destructive">
                  {totalExpenses.toLocaleString()} FCFA
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Revenu Net
                </p>
                <p
                  className={`text-2xl font-semibold ${
                    netRevenue >= 0 ? "text-primary" : "text-destructive"
                  }`}
                >
                  {netRevenue.toLocaleString()} FCFA
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ventes par Catégorie</CardTitle>
            <CardDescription>Répartition des ventes</CardDescription>
          </CardHeader>
          <CardContent>
            {salesByCategory && salesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) =>
                      `${category} (${percentage}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {salesByCategory.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ventes Récentes</CardTitle>
            <CardDescription>
              Tendance des ventes (dernières 7 jours)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentSales && recentSales.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={recentSales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Ventes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
