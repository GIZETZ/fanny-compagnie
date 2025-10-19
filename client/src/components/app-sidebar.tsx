import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Package,
  ShoppingCart,
  CreditCard,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import type { User } from "@shared/schema";

interface AppSidebarProps {
  user: User;
}

const roleMenus = {
  stock_manager: [
    {
      title: "Gestion des Stocks",
      url: "/stock",
      icon: Package,
    },
  ],
  cashier: [
    {
      title: "Point de Vente",
      url: "/cashier",
      icon: ShoppingCart,
    },
  ],
  client: [
    {
      title: "Ma Carte de Fidélité",
      url: "/client",
      icon: CreditCard,
    },
  ],
  hr: [
    {
      title: "Ressources Humaines",
      url: "/hr",
      icon: Users,
    },
  ],
  supervisor: [
    {
      title: "Tableau de Bord",
      url: "/supervisor",
      icon: BarChart3,
    },
  ],
};

export function AppSidebar({ user }: AppSidebarProps) {
  const [location] = useLocation();
  const items = roleMenus[user.role] || [];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-lg">F&C</span>
          </div>
          <div>
            <h2 className="font-semibold text-base text-sidebar-foreground">
              Fanny & Compagnie
            </h2>
            <p className="text-xs text-muted-foreground capitalize">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    data-active={location === item.url}
                    data-testid={`link-${item.url.slice(1)}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.firstName || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-muted-foreground text-sm font-medium">
                {user.firstName?.[0] || user.email?.[0] || "U"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.email}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            window.location.href = "/api/logout";
          }}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
