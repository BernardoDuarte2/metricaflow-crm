import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Settings,
  LogOut,
  Plug,
  Calendar,
  ListTodo,
  Trophy,
  HelpCircle,
  Shield,
  BarChart3,
  Search,
  Target,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUserSession } from "@/hooks/useUserSession";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const APP_VERSION = "v1.0.0";

const roleLabels: Record<string, string> = {
  gestor_owner: "Gestor (Proprietário)",
  gestor: "Gestor",
  vendedor: "Vendedor",
};

const Sidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved === "true";
  });

  const { data: sessionData } = useUserSession();
  const session = sessionData?.session;
  const profile = sessionData?.profile;
  const userRole = sessionData?.role;

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", isCollapsed.toString());
  }, [isCollapsed]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado com sucesso",
    });
    navigate("/auth");
  };

  const isOwnerOrGestor =
    profile?.company?.owner_id === session?.user?.id ||
    userRole === "gestor_owner" ||
    userRole === "gestor";
  const isSuperAdmin = profile?.is_super_admin === true;

  const userName = profile?.name || "Usuário";
  const userAvatar = profile?.avatar_url;
  const companyName = profile?.companies?.name || "Empresa";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const allNavItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard", requiresOwnerOrGestor: false, requiresSuperAdmin: false },
    { to: "/leads", icon: Users, label: "Leads", requiresOwnerOrGestor: false, requiresSuperAdmin: false },
    { to: "/prospecting", icon: Search, label: "Prospecção", requiresOwnerOrGestor: false, requiresSuperAdmin: false },
    { to: "/kanban", icon: KanbanSquare, label: "Kanban", requiresOwnerOrGestor: false, requiresSuperAdmin: false },
    { to: "/agenda", icon: Calendar, label: "Agenda", requiresOwnerOrGestor: false, requiresSuperAdmin: false },
    { to: "/tasks", icon: ListTodo, label: "Tarefas", requiresOwnerOrGestor: false, requiresSuperAdmin: false },
    { to: "/kpi", icon: BarChart3, label: "Desempenho & KPI", requiresOwnerOrGestor: false, requiresSuperAdmin: false },
    { to: "/goals", icon: Target, label: "Metas", requiresOwnerOrGestor: false, requiresSuperAdmin: false },
    { to: "/users", icon: Settings, label: "Usuários", requiresOwnerOrGestor: true, requiresSuperAdmin: false },
    { to: "/integrations", icon: Plug, label: "Integrações", requiresOwnerOrGestor: true, requiresSuperAdmin: false },
    { to: "/gamification", icon: Trophy, label: "Ao Vivo", requiresOwnerOrGestor: true, requiresSuperAdmin: false },
    { to: "/settings", icon: Settings, label: "Configurações", requiresOwnerOrGestor: true, requiresSuperAdmin: false },
    { to: "/help", icon: HelpCircle, label: "Ajuda", requiresOwnerOrGestor: false, requiresSuperAdmin: false },
    { to: "/admin", icon: Shield, label: "Administração", requiresOwnerOrGestor: false, requiresSuperAdmin: true },
  ];

  const navItems = allNavItems.filter((item) => {
    if (item.requiresSuperAdmin) return isSuperAdmin;
    if (item.requiresOwnerOrGestor) return isOwnerOrGestor;
    return true;
  });

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          {profile?.company?.logo_url ? (
            <img
              src={profile.company.logo_url}
              alt={profile.company.name || "Logo"}
              className="h-8 w-auto object-contain"
            />
          ) : (
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {profile?.company?.system_name || "Pro"}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
            <Avatar className="h-9 w-9">
              <AvatarImage src={userAvatar || undefined} alt={userName} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-popover" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="text-xs leading-none text-muted-foreground">{companyName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {roleLabels[userRole || ""] || userRole || "—"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal py-1">
            {APP_VERSION}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sair do sistema
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};

export default Sidebar;
