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
import { cn } from "@/lib/utils";

const APP_VERSION = "v1.0.0";

const roleLabels: Record<string, string> = {
  gestor_owner: "Gestor (Proprietário)",
  gestor: "Gestor",
  vendedor: "Vendedor",
};

const Sidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  const { data: sessionData } = useUserSession();
  const { isDark, toggleDarkMode } = useTheme();
  const session = sessionData?.session;
  const profile = sessionData?.profile;
  const userRole = sessionData?.role;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logout realizado com sucesso" });
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
    ...(isOwnerOrGestor
      ? [
          { to: "/users", icon: Users, label: "Usuários" },
          { to: "/integrations", icon: Plug, label: "Integrações" },
          { to: "/settings", icon: Settings, label: "Configurações" },
        ]
      : []),
    { to: "/help", icon: HelpCircle, label: "Ajuda" },
  ];

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) =>
        cn(
          "flex items-center h-10 rounded-lg transition-all duration-200 relative group",
          isHovered ? "px-3 gap-3" : "justify-center w-10 mx-auto",
          isActive
            ? "bg-white/10 text-accent border-l-[3px] border-accent"
            : "text-white/70 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent"
        )
      }
    >
      <item.icon className="h-5 w-5 shrink-0" />
      <span
        className={cn(
          "text-sm font-medium whitespace-nowrap transition-all duration-300",
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 w-0 overflow-hidden"
        )}
      >
        {item.label}
      </span>
    </NavLink>
  );

  return (
    <nav
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed top-0 left-0 bottom-0 bg-[#072F4A] flex flex-col py-4 z-50 border-r border-[#0B4F73]/40 transition-all duration-300",
        isHovered ? "w-56" : "w-16"
      )}
    >
      {/* Logo */}
      <div className={cn("mb-6 flex-shrink-0", isHovered ? "px-4" : "flex justify-center")}>
        {profile?.company?.logo_url ? (
          <img
            src={profile.company.logo_url}
            alt={profile.company.name || "Logo"}
            className="h-8 w-8 object-contain rounded"
          />
        ) : (
          <div className="h-9 w-9 rounded-lg bg-[#FF6B00] flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {(profile?.company?.system_name || "O")[0]}
            </span>
          </div>
        )}
      </div>

      {/* Separator */}
      <div className={cn("h-[1px] bg-white/10 rounded-full mb-4", isHovered ? "mx-4" : "mx-4")} />

      {/* Main nav */}
      <div className={cn("flex-1 flex flex-col gap-1 overflow-y-auto", isHovered ? "px-2" : "px-3")}>
        {mainNavItems.map((item) => (
          <NavItem key={item.to} item={item} />
        ))}
      </div>

      {/* Bottom section */}
      <div className={cn("flex flex-col gap-1 mt-2 pt-2 border-t border-white/10", isHovered ? "px-2" : "px-3")}>
        {bottomNavItems.map((item) => (
          <NavItem key={item.to} item={item} />
        ))}

        {/* Theme toggle */}
        <Button
          variant="ghost"
          onClick={toggleDarkMode}
          className={cn(
            "h-10 text-white/70 hover:bg-white/5 hover:text-white transition-all duration-200",
            isHovered ? "justify-start px-3 gap-3 w-full" : "w-10 mx-auto p-0"
          )}
        >
          {isDark ? <Sun className="h-5 w-5 shrink-0" /> : <Moon className="h-5 w-5 shrink-0" />}
          <span
            className={cn(
              "text-sm font-medium whitespace-nowrap transition-all duration-300",
              isHovered ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            )}
          >
            {isDark ? "Modo Claro" : "Modo Escuro"}
          </span>
        </Button>

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "relative rounded-lg mt-1 hover:bg-white/5 transition-all duration-200",
                isHovered ? "justify-start px-3 gap-3 w-full h-12" : "h-10 w-10 mx-auto p-0"
              )}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={userAvatar || undefined} alt={userName} />
                <AvatarFallback className="bg-[#FF6B00] text-white text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {isHovered && (
                <div className="flex flex-col items-start text-left overflow-hidden">
                  <span className="text-sm font-medium text-white truncate max-w-[120px]">{userName}</span>
                  <span className="text-xs text-white/50 truncate max-w-[120px]">{companyName}</span>
                </div>
              )}
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
