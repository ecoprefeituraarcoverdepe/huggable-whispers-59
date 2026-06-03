import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Registration, Status, useAppStore, Category } from "@/store/useAppStore";
import { memo, useCallback, useState, useMemo } from "react";
import { Download, FileText, Filter, X, FileDown, MapPin, Bus, User, Phone, CheckCircle2, Clock, XCircle } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface RegistrationsTableProps {
  registrations: Registration[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
}

export const RegistrationsTable = memo(({ registrations, onDelete, onStatusChange }: RegistrationsTableProps) => {
  const { eventDays } = useAppStore();
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<Status | 'Todos'>('Todos');
  const [filterCategory, setFilterCategory] = useState<Category | 'Todas'>('Todas');
  const [filterDate, setFilterDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected registration for modal
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      const matchStatus = filterStatus === 'Todos' || reg.status === filterStatus;
      const matchCategory = filterCategory === 'Todas' || reg.category === filterCategory;
      const regDate = new Date(reg.createdAt).toISOString().split('T')[0];
      const matchDate = !filterDate || regDate === filterDate;
      const matchSearch = !searchTerm || 
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        reg.idNumber.includes(searchTerm) || 
        (reg.registrationCode?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchStatus && matchCategory && matchDate && matchSearch;
    });
  }, [registrations, filterStatus, filterCategory, filterDate, searchTerm]);

  const handleExportCSV = useCallback(() => {
    const headers = [
      "ID", "Codigo", "Nome", "Email", "Celular", "Fixo", "Emergencia", 
      "Categoria", "CID", "Nome Deficiencia", "Dia", "Data Cadastro", "Status", 
      "Endereco", "Ponto de Referencia", "Transporte", "Acompanhante", "Nome Acompanhante"
    ];
    
    const rows = filteredRegistrations.map(reg => {
      const day = eventDays.find(d => d.id === reg.eventDayId)?.date || '-';
      const address = `${reg.address.street}, ${reg.address.number} - ${reg.address.neighborhood}, ${reg.address.city}/${reg.address.state}`;
      return [
        reg.id,
        reg.registrationCode || '-',
        reg.name,
        reg.email,
        reg.mobile,
        reg.phone || '-',
        reg.emergencyPhone || '-',
        reg.category,
        reg.disabilityCode || '-',
        reg.pcdName || '-',
        day,
        new Date(reg.createdAt).toLocaleDateString('pt-BR'),
        reg.status,
        address,
        reg.address.referencePoint || '-',
        reg.needsTransportation ? 'Sim' : 'Não',
        reg.hasCompanion ? 'Sim' : 'Não',
        reg.companionName || '-'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cadastros-sao-joao-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredRegistrations, eventDays]);

  const handleExportPDF = useCallback(() => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const headers = [["Código", "Nome", "Categoria", "Dia", "Status", "Celular", "Transporte"]];
    const data = filteredRegistrations.map(reg => [
      reg.registrationCode || '-',
      reg.name,
      reg.category === 'idoso' ? 'Idoso' : reg.category === 'pcd' ? 'PCD' : 'Ambos',
      eventDays.find(d => d.id === reg.eventDayId)?.date || '-',
      reg.status,
      reg.mobile,
      reg.needsTransportation ? 'SIM' : 'NÃO'
    ]);

    doc.setFontSize(16);
    doc.text("Relatório de Inscritos - São João Arcoverde 2026", 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')} | Total: ${filteredRegistrations.length}`, 14, 22);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 28,
      theme: 'striped',
      headStyles: { fillColor: [13, 34, 53] },
      styles: { fontSize: 8 },
    });

    doc.save(`cadastros-sao-joao-${new Date().toISOString().split('T')[0]}.pdf`);
  }, [filteredRegistrations, eventDays]);

  const resetFilters = () => {
    setFilterStatus('Todos');
    setFilterCategory('Todas');
    setFilterDate('');
    setSearchTerm('');
  };

  const hasActiveFilters = filterStatus !== 'Todos' || filterCategory !== 'Todas' || filterDate !== '' || searchTerm !== '';

  return (
    <Card className="shadow-lg border-none overflow-hidden">
      <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b pb-6 bg-muted/10 gap-4">
        <CardTitle className="text-xl">Gestão de Cadastros</CardTitle>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar nome, CPF ou código..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="text-xs flex items-center gap-1 h-8 text-muted-foreground hover:text-destructive"
            >
              <X className="w-3 h-3" />
              Limpar
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("flex items-center gap-2 h-9", (filterStatus !== 'Todos' || filterCategory !== 'Todas' || filterDate !== '') && "border-primary text-primary")}>
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={filterStatus === 'Todos'} onCheckedChange={() => setFilterStatus('Todos')}>Todos</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filterStatus === 'Pendente'} onCheckedChange={() => setFilterStatus('Pendente')}>Pendente</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filterStatus === 'Aprovado'} onCheckedChange={() => setFilterStatus('Aprovado')}>Aprovado</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filterStatus === 'Reprovado'} onCheckedChange={() => setFilterStatus('Reprovado')}>Reprovado</DropdownMenuCheckboxItem>
              
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuLabel>Categoria</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={filterCategory === 'Todas'} onCheckedChange={() => setFilterCategory('Todas')}>Todas</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filterCategory === 'idoso'} onCheckedChange={() => setFilterCategory('idoso')}>Idoso</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filterCategory === 'pcd'} onCheckedChange={() => setFilterCategory('pcd')}>PCD / Neuro</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filterCategory === 'ambos'} onCheckedChange={() => setFilterCategory('ambos')}>Ambos</DropdownMenuCheckboxItem>

              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuLabel>Data de Cadastro</DropdownMenuLabel>
              <div className="p-2">
                <Input 
                  type="date" 
                  value={filterDate} 
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 h-9"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 h-9"
            onClick={handleExportPDF}
          >
            <FileText className="w-4 h-4" />
            PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground">
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Cód. Inscrição</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-center">Transp.</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider whitespace-nowrap">Documento</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
               {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                    Nenhum cadastro encontrado.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-primary">{reg.registrationCode || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold group-hover:text-primary transition-colors">{reg.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{reg.idNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs whitespace-nowrap">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full font-bold shadow-sm",
                        reg.category === 'idoso' ? "bg-green-100 text-green-700" : 
                        reg.category === 'pcd' ? "bg-orange-100 text-orange-700" :
                        "bg-purple-100 text-purple-700"
                      )}>
                        {reg.category === 'idoso' ? 'Idoso' : reg.category === 'pcd' ? 'PCD' : 'Ambos'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {reg.needsTransportation ? (
                        <div className="bg-primary/10 p-1.5 rounded-full inline-block">
                          <Bus className="w-4 h-4 text-primary" />
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className={cn(
                              "flex items-center gap-1.5 font-bold hover:opacity-80 transition-opacity",
                              reg.status === 'Aprovado' ? "text-green-600" : 
                              reg.status === 'Reprovado' ? "text-red-600" : "text-amber-600"
                            )}
                          >
                            <div className={cn(
                              "w-2 h-2 rounded-full", 
                              reg.status === 'Aprovado' ? "bg-green-600 animate-pulse" : 
                              reg.status === 'Reprovado' ? "bg-red-600" : "bg-amber-600 animate-pulse"
                            )} />
                            {reg.status}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => onStatusChange(reg.id, 'Pendente')}>Pendente</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(reg.id, 'Aprovado')}>Aprovado</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(reg.id, 'Reprovado')}>Reprovado</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="px-6 py-4">
                      {reg.documentUrl ? (
                        <a 
                          href={reg.documentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold"
                        >
                          <FileDown className="w-4 h-4" />
                          Laudo PDF
                        </a>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">Não enviado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-primary/10 hover:text-primary h-8 w-8 p-0"
                          onClick={() => setSelectedRegistration(reg)}
                        >
                          <User className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                          onClick={() => onDelete(reg.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Details Modal */}
      <Dialog open={!!selectedRegistration} onOpenChange={(open) => !open && setSelectedRegistration(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              Detalhes da Inscrição
              {selectedRegistration && (
                <span className={cn(
                  "ml-2 text-xs px-2 py-0.5 rounded-full font-bold",
                  selectedRegistration.status === 'Aprovado' ? "bg-green-100 text-green-700" : 
                  selectedRegistration.status === 'Reprovado' ? "bg-red-100 text-red-700" : 
                  "bg-amber-100 text-amber-700"
                )}>
                  {selectedRegistration.status}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedRegistration && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" /> Dados Pessoais
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Nome Completo</p>
                      <p className="font-bold">{selectedRegistration.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">CPF / RG</p>
                      <p className="font-semibold">{selectedRegistration.idNumber}</p>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase">Nascimento</p>
                        <p className="font-semibold">{selectedRegistration.birthDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase">Categoria</p>
                        <p className="font-semibold capitalize">{selectedRegistration.category}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Código de Inscrição</p>
                      <p className="font-mono font-bold text-primary">{selectedRegistration.registrationCode}</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" /> Contato
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Celular</p>
                      <p className="font-semibold">{selectedRegistration.mobile}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Fixo</p>
                      <p className="font-semibold">{selectedRegistration.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">E-mail</p>
                      <p className="font-semibold">{selectedRegistration.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase text-red-600">Emergência</p>
                      <p className="font-bold text-red-600">{selectedRegistration.emergencyPhone || '-'}</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4 md:col-span-2">
                  <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" /> Endereço e Transporte
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Logradouro</p>
                      <p className="font-semibold">{selectedRegistration.address.street}, {selectedRegistration.address.number}</p>
                      <p className="text-sm">{selectedRegistration.address.neighborhood}, {selectedRegistration.address.city} - {selectedRegistration.address.state}</p>
                      <p className="text-xs text-muted-foreground mt-1">CEP: {selectedRegistration.address.cep}</p>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase">Ponto de Referência</p>
                        <p className="text-sm font-semibold italic">{selectedRegistration.address.referencePoint || 'Não informado'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bus className={cn("w-4 h-4", selectedRegistration.needsTransportation ? "text-primary" : "text-muted-foreground/30")} />
                        <span className={cn("text-sm font-bold", selectedRegistration.needsTransportation ? "text-primary" : "text-muted-foreground")}>
                          {selectedRegistration.needsTransportation ? "PRECISA DE TRANSPORTE" : "NÃO PRECISA DE TRANSPORTE"}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {selectedRegistration.hasCompanion && (
                  <section className="space-y-4 md:col-span-2 bg-secondary/5 p-4 rounded-xl border border-secondary/20">
                    <h3 className="font-bold text-lg border-b border-secondary/20 pb-2 flex items-center gap-2">
                      <User className="w-5 h-5 text-secondary" /> Acompanhante
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase">Nome do Acompanhante</p>
                        <p className="font-bold">{selectedRegistration.companionName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase">Telefone do Acompanhante</p>
                        <p className="font-semibold">{selectedRegistration.companionPhone || '-'}</p>
                      </div>
                    </div>
                  </section>
                )}

                <section className="space-y-4 md:col-span-2">
                   <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" /> PCD / Laudo
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase">Deficiência / CID</p>
                      <p className="font-semibold">{selectedRegistration.pcdName || 'Não informado'} - {selectedRegistration.disabilityCode || '-'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedRegistration.documentUrl ? (
                         <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
                           <a href={selectedRegistration.documentUrl} target="_blank" rel="noopener noreferrer">
                             <FileDown className="w-4 h-4 mr-2" />
                             Ver Laudo Médico PDF
                           </a>
                         </Button>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Documento não anexado</p>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setSelectedRegistration(null)}>Fechar</Button>
            {selectedRegistration && selectedRegistration.status === 'Pendente' && (
              <>
                <Button variant="destructive" onClick={() => { onStatusChange(selectedRegistration.id, 'Reprovado'); setSelectedRegistration(null); }}>Reprovar</Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => { onStatusChange(selectedRegistration.id, 'Aprovado'); setSelectedRegistration(null); }}>Aprovar</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
});

RegistrationsTable.displayName = "RegistrationsTable";