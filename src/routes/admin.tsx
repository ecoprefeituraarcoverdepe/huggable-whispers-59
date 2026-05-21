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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});


function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Vagas", icon: Users, path: "/admin" },
    { label: "Pendentes", icon: Clock, path: "/admin" },
    { label: "Presença", icon: CalendarDays, path: "/admin" },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className={cn(
        "bg-primary text-primary-foreground w-64 flex flex-col transition-all duration-300 fixed md:relative h-screen z-50",
        !isSidebarOpen && "-translate-x-full md:translate-x-0 md:w-20"
      )}>
        <div className="p-6 flex items-center justify-between">
          <h1 className={cn("font-bold text-xl truncate", !isSidebarOpen && "md:hidden")}>Admin São João</h1>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X />
          </Button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors",
                !isSidebarOpen && "md:justify-center"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className={cn(isSidebarOpen ? "block" : "md:hidden")}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link to="/" className={cn("flex items-center gap-3 px-4 py-3 text-sm opacity-70 hover:opacity-100", !isSidebarOpen && "md:justify-center")}>
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span className={cn(isSidebarOpen ? "block" : "md:hidden")}>Ver Portal</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">Gestor São João</p>
              <p className="text-xs text-muted-foreground">Prefeitura de Caruaru</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
              GS
            </div>
          </div>
        </header>

        <main className="p-6 overflow-auto">
          <AdminDashboardContent />
        </main>
      </div>
    </div>
  );
}

function AdminDashboardContent() {
  const { registrations, eventDays } = useAppStore((state) => ({
    registrations: state.registrations,
    eventDays: state.eventDays,
  }));

  const stats = [
    { label: "Total Inscritos", value: registrations.length, color: "bg-blue-500", icon: Users },
    { label: "Idosos", value: registrations.filter(r => r.category === 'idoso').length, color: "bg-green-500", icon: Users },
    { label: "PCD / Neuro", value: registrations.filter(r => r.category === 'pcd').length, color: "bg-orange-500", icon: Users },
    { label: "Acompanhantes", value: registrations.filter(r => r.hasCompanion).length, color: "bg-red-500", icon: Users },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-lg">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={cn("p-4 rounded-2xl text-white", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela de Gestão */}
      <Card className="shadow-lg border-none">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
          <CardTitle className="text-xl">Gestão de Cadastros</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Exportar CSV</Button>
            <Button variant="outline" size="sm">Filtros</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground">
                  <th className="px-6 py-4 font-bold uppercase">Código</th>
                  <th className="px-6 py-4 font-bold uppercase">Nome</th>
                  <th className="px-6 py-4 font-bold uppercase">Categoria</th>
                  <th className="px-6 py-4 font-bold uppercase">Data</th>
                  <th className="px-6 py-4 font-bold uppercase">Status</th>
                  <th className="px-6 py-4 font-bold uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">#{reg.id}</td>
                    <td className="px-6 py-4 font-bold">{reg.name}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-bold",
                        reg.category === 'idoso' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                      )}>
                        {reg.category === 'idoso' ? 'Idoso' : 'PCD'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(reg.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "flex items-center gap-1.5",
                        reg.status === 'Aprovado' ? "text-green-600" : "text-amber-600"
                      )}>
                        <div className={cn("w-2 h-2 rounded-full", reg.status === 'Aprovado' ? "bg-green-600" : "bg-amber-600")} />
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm">Ver</Button>
                      <Button variant="ghost" size="sm" className="text-primary">Editar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Gestão de Vagas por Dia */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Gestão de Vagas por Dia</h2>
          <Button className="bg-green-600 hover:bg-green-700">+ Cadastrar Vaga</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventDays.map((day) => (
            <Card key={day.id} className="overflow-hidden shadow-lg border-none group">
              <div className="h-40 relative overflow-hidden">
                <img 
                  src={day.image} 
                  alt={day.weekday} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full font-bold text-primary">
                  {day.date} - {day.weekday}
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Atrações:</h3>
                    <p className="text-sm text-muted-foreground">{day.attractions.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{day.approvedCount}/{day.totalSpots}</p>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Vagas Preenchidas</p>
                  </div>
                </div>
                <div className="w-full bg-muted h-2 rounded-full mb-6">
                  <div 
                    className="bg-primary h-full rounded-full transition-all" 
                    style={{ width: `${(day.approvedCount / day.totalSpots) * 100}%` }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">Editar</Button>
                  <Button variant="outline" className="flex-1 text-destructive hover:text-destructive">Excluir</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

