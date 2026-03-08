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
  Sun,
  Moon,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUserSession } from "@/hooks/useUserSession";
import { useTheme } from "@/hooks/useTheme";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const { isDark, toggleDarkMode } = useTheme();
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

  const mainNavItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/leads", icon: Users, label: "Leads" },
    { to: "/prospecting", icon: Search, label: "Prospecção" },
    { to: "/kanban", icon: KanbanSquare, label: "Kanban" },
    { to: "/agenda", icon: Calendar, label: "Agenda" },
    { to: "/tasks", icon: ListTodo, label: "Tarefas" },
    { to: "/kpi", icon: BarChart3, label: "KPI" },
    { to: "/goals", icon: Target, label: "Metas" },
    ...(isOwnerOrGestor ? [{ to: "/gamification", icon: Trophy, label: "Ao Vivo" }] : []),
    ...(isSuperAdmin ? [{ to: "/admin", icon: Shield, label: "Administração" }] : []),
  ];

  const bottomNavItems = [
    ...(isOwnerOrGestor ? [
      { to: "/users", icon: Users, label: "Usuários" },
      { to: "/integrations", icon: Plug, label: "Integrações" },
      { to: "/settings", icon: Settings, label: "Configurações" },
    ] : []),
    { to: "/help", icon: HelpCircle, label: "Ajuda" },
  ];

  return (
    <nav className="fixed top-0 left-0 bottom-0 w-16 bg-[hsl(216,28%,7%)] flex flex-col items-center py-4 z-50 border-r border-border/30">
      {/* Logo */}
      <div className="mb-6 flex-shrink-0">
        {profile?.company?.logo_url ? (
          <img
            src={profile.company.logo_url}
            alt={profile.company.name || "Logo"}
            className="h-8 w-8 object-contain rounded"
          />
        ) : (
          <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">
              {(profile?.company?.system_name || "O")[0]}
            </span>
          </div>
        )}
      </div>

      {/* Blue accent line */}
      <div className="w-8 h-[2px] bg-[hsl(212,100%,67%)] rounded-full mb-4" />

      {/* Main nav items */}
      <div className="flex-1 flex flex-col items-center gap-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <Tooltip key={item.to} delayDuration={0}>
            <TooltipTrigger asChild>
              <NavLink
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-[hsl(210,10%,58%)] hover:bg-[hsl(215,18%,13%)] hover:text-[hsl(33,31%,87%)]"
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover text-popover-foreground">
              {item.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Bottom section */}
      <div className="flex flex-col items-center gap-1 mt-2 pt-2 border-t border-border/20">
        {bottomNavItems.map((item) => (
          <Tooltip key={item.to} delayDuration={0}>
            <TooltipTrigger asChild>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-[hsl(210,10%,58%)] hover:bg-[hsl(215,18%,13%)] hover:text-[hsl(33,31%,87%)]"
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover text-popover-foreground">
              {item.label}
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Theme toggle */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="w-10 h-10 text-[hsl(210,10%,58%)] hover:bg-[hsl(215,18%,13%)] hover:text-[hsl(33,31%,87%)]"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground">
            {isDark ? "Modo Claro" : "Modo Escuro"}
          </TooltipContent>
        </Tooltip>

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 mt-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userAvatar || undefined} alt={userName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-popover" align="end" side="right" forceMount>
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
      </div>
    </nav>
  );
};

export default Sidebar;