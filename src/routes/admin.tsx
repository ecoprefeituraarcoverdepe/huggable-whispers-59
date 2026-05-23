import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  CalendarDays, 
  ChevronRight,
  Menu,
  X,
  Trash2
} from "lucide-react";

import { useState, useMemo, useCallback, Suspense, lazy, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore, EventDay, Status } from "@/store/useAppStore";
import logoArcoverde from "@/assets/logo-acessibilidade.jpeg";
import { DayDialog } from "@/components/admin/DayDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { LogOut } from "lucide-react";

// Lazy load dashboard sections
const StatsCards = lazy(() => import("@/components/admin/StatsCards").then(m => ({ default: m.StatsCards })));
const RegistrationsTable = lazy(() => import("@/components/admin/RegistrationsTable").then(m => ({ default: m.RegistrationsTable })));
const EventDaysGrid = lazy(() => import("@/components/admin/EventDaysGrid").then(m => ({ default: m.EventDaysGrid })));

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [session, setSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'registrations' | 'days'>('dashboard');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada.");
  }, []);

  const menuItems = useMemo(() => [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin", view: 'dashboard' as const },
    { label: "Cadastros", icon: Users, path: "/admin", view: 'registrations' as const },
    { label: "Vagas/Dias", icon: CalendarDays, path: "/admin", view: 'days' as const },
  ], []);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!session) {
    return <AdminLogin />;
  }

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
            <button
              key={item.label}
              onClick={() => setActiveView(item.view)}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 group text-left",
                activeView === item.view && "bg-white/15 shadow-inner",
                !isSidebarOpen && "md:justify-center"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
              {isSidebarOpen && (
                <span className="animate-in fade-in slide-in-from-left-1 duration-200">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
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
          <button 
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm opacity-70 hover:opacity-100 hover:bg-white/5 rounded-lg transition-all w-full text-left", 
              !isSidebarOpen && "md:justify-center text-red-400 opacity-90"
            )}
          >
            <LogOut className="w-4 h-4" />
            {isSidebarOpen && <span>Sair</span>}
          </button>
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
            <AdminDashboardContent activeView={activeView} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function AdminDashboardContent({ activeView }: { activeView: 'dashboard' | 'registrations' | 'days' }) {
  const { 
    registrations, 
    eventDays, 
    deleteRegistration, 
    updateRegistrationStatus,
    addEventDay,
    updateEventDay,
    deleteEventDay,
    resetAll,
    fetchData
  } = useAppStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const [isDayDialogOpen, setDayDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<EventDay | null>(null);

  const stats = useMemo(() => [
    { label: "Total Inscritos", value: registrations.length, color: "bg-blue-600", icon: Users },
    { label: "Idosos", value: registrations.filter(r => r.category === 'idoso' || r.category === 'ambos').length, color: "bg-green-600", icon: Users },
    { label: "PCD / Neuro", value: registrations.filter(r => r.category === 'pcd' || r.category === 'ambos').length, color: "bg-orange-600", icon: Users },
    { label: "Ambos", value: registrations.filter(r => r.category === 'ambos').length, color: "bg-purple-600", icon: Users },
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

  const handleResetAll = useCallback(() => {
    if (confirm("ATENÇÃO: Isso irá apagar TODOS os cadastros e dias de evento permanentemente. Esta ação não pode ser desfeita. Deseja continuar?")) {
      resetAll();
      toast.success("Todos os dados foram resetados com sucesso!");
    }
  }, [resetAll]);



  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {activeView === 'dashboard' && "Dashboard Administrativo"}
            {activeView === 'registrations' && "Gestão de Cadastros"}
            {activeView === 'days' && "Gestão de Vagas/Dias"}
          </h2>
          <p className="text-muted-foreground">
            {activeView === 'dashboard' && "Visão geral das inscrições e estatísticas."}
            {activeView === 'registrations' && "Aprove, reprove ou exclua solicitações de espaço."}
            {activeView === 'days' && "Gerencie a programação e o limite de vagas por dia."}
          </p>
        </div>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleResetAll}
          className="bg-red-600 hover:bg-red-700 shadow-md group shrink-0"
        >
          <Trash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
          Limpar Todos os Dados
        </Button>
      </div>

      {activeView === 'dashboard' && (
        <>
          <StatsCards stats={stats} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
             <RegistrationsTable 
              registrations={registrations.slice(0, 5)} 
              onDelete={handleDeleteRegistration}
              onStatusChange={handleStatusChange}
            />
            <div className="space-y-4">
               <h3 className="text-xl font-bold">Resumo da Programação</h3>
               <EventDaysGrid 
                eventDays={eventDays.slice(0, 3)} 
                onAdd={handleAddDay}
                onEdit={handleEditDay}
                onDelete={handleDeleteDay}
              />
            </div>
          </div>
        </>
      )}

      {activeView === 'registrations' && (
        <RegistrationsTable 
          registrations={registrations} 
          onDelete={handleDeleteRegistration}
          onStatusChange={handleStatusChange}
        />
      )}

      {activeView === 'days' && (
        <EventDaysGrid 
          eventDays={eventDays} 
          onAdd={handleAddDay}
          onEdit={handleEditDay}
          onDelete={handleDeleteDay}
        />
      )}

      <DayDialog 
        open={isDayDialogOpen} 
        onOpenChange={setDayDialogOpen}
        day={selectedDay}
        onSave={handleSaveDay}
      />
    </div>
  );
}



