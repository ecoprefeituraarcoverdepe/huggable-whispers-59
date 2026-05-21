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
import { useAppStore, EventDay, Status } from "@/store/useAppStore";
import logoArcoverde from "@/assets/logo-arcoverde.png";
import { DayDialog } from "@/components/admin/DayDialog";
import { toast } from "sonner";

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
  const { 
    registrations, 
    eventDays, 
    deleteRegistration, 
    updateRegistrationStatus,
    addEventDay,
    updateEventDay,
    deleteEventDay 
  } = useAppStore();

  const [isDayDialogOpen, setDayDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<EventDay | null>(null);

  const stats = useMemo(() => [
    { label: "Total Inscritos", value: registrations.length, color: "bg-blue-600", icon: Users },
    { label: "Idosos", value: registrations.filter(r => r.category === 'idoso').length, color: "bg-green-600", icon: Users },
    { label: "PCD / Neuro", value: registrations.filter(r => r.category === 'pcd').length, color: "bg-orange-600", icon: Users },
    { label: "Acompanhantes", value: registrations.filter(r => r.hasCompanion).length, color: "bg-red-600", icon: Users },
  ], [registrations]);

  const handleAddDay = useCallback(() => {
    setSelectedDay(null);
    setDayDialogOpen(true);
  }, []);

  const handleEditDay = useCallback((day: EventDay) => {
    setSelectedDay(day);
    setDayDialogOpen(true);
  }, []);

  const handleSaveDay = useCallback((dayData: any) => {
    if (selectedDay) {
      updateEventDay(selectedDay.id, dayData);
      toast.success("Dia atualizado com sucesso!");
    } else {
      addEventDay(dayData);
      toast.success("Novo dia cadastrado com sucesso!");
    }
    setDayDialogOpen(false);
  }, [selectedDay, updateEventDay, addEventDay]);

  const handleDeleteDay = useCallback((id: string) => {
    if (confirm("Tem certeza que deseja excluir este dia?")) {
      deleteEventDay(id);
      toast.success("Dia excluído com sucesso!");
    }
  }, [deleteEventDay]);

  const handleDeleteRegistration = useCallback((id: string) => {
    if (confirm("Tem certeza que deseja excluir este cadastro?")) {
      deleteRegistration(id);
      toast.success("Cadastro excluído com sucesso!");
    }
  }, [deleteRegistration]);

  const handleStatusChange = useCallback((id: string, status: Status) => {
    updateRegistrationStatus(id, status);
    toast.success(`Status atualizado para ${status}!`);
  }, [updateRegistrationStatus]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <StatsCards stats={stats} />
      <RegistrationsTable 
        registrations={registrations} 
        onDelete={handleDeleteRegistration}
        onStatusChange={handleStatusChange}
      />
      <EventDaysGrid 
        eventDays={eventDays} 
        onAdd={handleAddDay}
        onEdit={handleEditDay}
        onDelete={handleDeleteDay}
      />

      <DayDialog 
        open={isDayDialogOpen} 
        onOpenChange={setDayDialogOpen}
        day={selectedDay}
        onSave={handleSaveDay}
      />
    </div>
  );
}



