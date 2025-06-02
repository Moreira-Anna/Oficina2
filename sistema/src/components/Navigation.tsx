"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GamepadIcon,
  BarChart3,
  Calendar,
  Users,
  FileText,
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: BarChart3 },
    { href: "/jogos", label: "Jogos", icon: GamepadIcon },
    { href: "/eventos", label: "Eventos", icon: Calendar },
    { href: "/participantes", label: "Participantes", icon: Users },
    { href: "/relatorios", label: "Relatórios", icon: FileText },
  ];

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
          <div className="flex space-x-4">
            {navItems.map((item) => {
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
        </div>
      </div>
    </nav>
  );
}
