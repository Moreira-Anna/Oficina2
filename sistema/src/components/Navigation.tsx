"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GamepadIcon,
  BarChart3,
  Calendar,
  Users,
  FileText,
  LogOut,
  User,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading, isSupervisor } = useAuth();

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!isLoading && !user && pathname !== "/login" && pathname !== "/register") {
      router.push("/login");
    }
  }, [user, isLoading, pathname, router]);

  // Não mostrar navegação nas páginas de login/register
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <GamepadIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Jogos Lúdicos
              </h1>
            </div>
            <div className="animate-pulse">
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Se não estiver autenticado, não mostrar navegação
  if (!user) {
    return null;
  }

  // Itens de navegação baseados no cargo
  const navItems = [
    { href: "/", label: "Dashboard", icon: BarChart3, requiredRole: null },
    { href: "/eventos", label: "Eventos", icon: Calendar, requiredRole: null }, // Disponível para todos
    { href: "/jogos", label: "Jogos", icon: GamepadIcon, requiredRole: "supervisor" },
    { href: "/participantes", label: "Participantes", icon: Users, requiredRole: "supervisor" },
    { href: "/inscricoes", label: "Inscrições", icon: ClipboardList, requiredRole: "supervisor" },
    { href: "/certificados", label: "Certificados", icon: FileText, requiredRole: null },
  ];

  // Filtrar itens baseado no cargo do usuário
  const filteredNavItems = navItems.filter(item => 
    item.requiredRole === null || 
    (item.requiredRole === "supervisor" && isSupervisor)
  );

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <GamepadIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Sistema de Jogos Lúdicos
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Itens de navegação */}
            <div className="flex space-x-4">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors ${
                      isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Informações do usuário */}
            <div className="flex items-center space-x-4 border-l border-gray-200 pl-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user.nome}</div>
                  <div className="text-gray-500 capitalize">{user.cargo}</div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
