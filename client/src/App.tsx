import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import StockManager from "@/pages/stock-manager";
import Cashier from "@/pages/cashier";
import ClientPortal from "@/pages/client-portal";
import HRManagement from "@/pages/hr-management";
import Supervisor from "@/pages/supervisor";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar user={user!} />
        <main className="flex-1 overflow-auto">
          <Switch>
            <Route path="/" component={getDefaultRoute(user!.role)} />
            <Route path="/stock" component={StockManager} />
            <Route path="/cashier" component={Cashier} />
            <Route path="/client" component={ClientPortal} />
            <Route path="/hr" component={HRManagement} />
            <Route path="/supervisor" component={Supervisor} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </SidebarProvider>
  );
}

function getDefaultRoute(role: string) {
  switch (role) {
    case "stock_manager":
      return StockManager;
    case "cashier":
      return Cashier;
    case "client":
      return ClientPortal;
    case "hr":
      return HRManagement;
    case "supervisor":
      return Supervisor;
    default:
      return Landing;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
