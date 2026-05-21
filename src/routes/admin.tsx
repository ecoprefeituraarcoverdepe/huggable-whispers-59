import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  CalendarDays, 
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { useState, useMemo, useCallback, Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import logoArcoverde from "@/assets/logo-arcoverde.png";

// Lazy load dashboard sections
const StatsCards = lazy(() => import("@/components/admin/StatsCards").then(m => ({ default: m.StatsCards })));
const RegistrationsTable = lazy(() => import("@/components/admin/RegistrationsTable").then(m => ({ default: m.RegistrationsTable })));
const EventDaysGrid = lazy(() => import("@/components/admin/EventDaysGrid").then(m => ({ default: m.EventDaysGrid })));

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = useMemo(() => [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Vagas", icon: Users, path: "/admin" },
    { label: "Pendentes", icon: Clock, path: "/admin" },
    { label: "Presença", icon: CalendarDays, path: "/admin" },
  ], []);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  return (
    <div className="min-h-screen bg-muted/30 flex overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "bg-primary text-primary-foreground w-64 flex flex-col transition-all duration-300 ease-in-out fixed md:relative h-screen z-50 shadow-2xl",
        !isSidebarOpen && "-translate-x-full md:translate-x-0 md:w-20"
      )}>
        <div className="p-6 flex items-center justify-between gap-3">
          <div className={cn("flex items-center gap-3 min-w-0 transition-all", !isSidebarOpen && "md:justify-center")}>
            <div className="bg-white rounded-lg p-1.5 shrink-0 shadow-sm">
              <img src={logoArcoverde} alt="Prefeitura de Arcoverde" className="h-8 w-auto object-contain" />
            </div>
            {isSidebarOpen && (
              <h1 className="font-bold text-lg truncate animate-in fade-in slide-in-from-left-2 duration-300">Admin São João</h1>
            )}
          </div>
          <Button variant="ghost" size="icon" className="md:hidden hover:bg-white/10" onClick={() => setSidebarOpen(false)}>
            <X />
          </Button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 group",
                !isSidebarOpen && "md:justify-center"
              )}
              activeProps={{ className: "bg-white/15 shadow-inner" }}
            >
              <item.icon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
              {isSidebarOpen && (
                <span className="animate-in fade-in slide-in-from-left-1 duration-200">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link 
            to="/" 
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm opacity-70 hover:opacity-100 hover:bg-white/5 rounded-lg transition-all", 
              !isSidebarOpen && "md:justify-center"
            )}
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            {isSidebarOpen && <span>Ver Portal</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm z-40">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hover:bg-muted">
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">Gestor São João</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight mt-1">Prefeitura de Arcoverde</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary shadow-inner border border-primary/10">
              GS
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <Suspense fallback={
            <div className="space-y-8 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}
              </div>
              <div className="h-96 bg-muted rounded-xl" />
            </div>
          }>
            <AdminDashboardContent />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function AdminDashboardContent() {
  const registrations = useAppStore((state) => state.registrations);
  const eventDays = useAppStore((state) => state.eventDays);

  const stats = useMemo(() => [
    { label: "Total Inscritos", value: registrations.length, color: "bg-blue-600", icon: Users },
    { label: "Idosos", value: registrations.filter(r => r.category === 'idoso').length, color: "bg-green-600", icon: Users },
    { label: "PCD / Neuro", value: registrations.filter(r => r.category === 'pcd').length, color: "bg-orange-600", icon: Users },
    { label: "Acompanhantes", value: registrations.filter(r => r.hasCompanion).length, color: "bg-red-600", icon: Users },
  ], [registrations]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <StatsCards stats={stats} />
      <RegistrationsTable registrations={registrations} />
      <EventDaysGrid eventDays={eventDays} />
    </div>
  );
}


