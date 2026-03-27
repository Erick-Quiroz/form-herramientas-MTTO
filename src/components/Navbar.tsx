"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  ClipboardCheck,
  BarChart3,
  Wrench,
} from "lucide-react";

const NAVIGATION_ITEMS = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/technicians", label: "Técnicos", icon: Users },
  { href: "/tools", label: "Herramientas", icon: Wrench },
  { href: "/evaluation", label: "Evaluación", icon: ClipboardCheck },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-3 px-2 gap-1 transition-colors ${isActive
                  ? "text-blue-600 border-t-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
                  }`}
              >
                <Icon size={24} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">
            Evaluaciones
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 text-xs text-gray-600">
          <p>© 2026 Sistema de Evaluación</p>
        </div>
      </aside>
    </>
  );
}
