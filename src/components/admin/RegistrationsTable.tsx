import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Registration, Status, useAppStore } from "@/store/useAppStore";
import { memo, useCallback } from "react";
import { Download, FileText, Filter } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface RegistrationsTableProps {
  registrations: Registration[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Status) => void;
}

export const RegistrationsTable = memo(({ registrations, onDelete, onStatusChange }: RegistrationsTableProps) => {
  const { eventDays } = useAppStore();

  const handleExportCSV = useCallback(() => {
    const headers = ["ID", "Codigo", "Nome", "Categoria", "Dia", "Data Cadastro", "Status", "Celular", "Fixo", "Endereco"];
    const rows = registrations.map(reg => {
      const day = eventDays.find(d => d.id === reg.eventDayId)?.date || '-';
      const address = `${reg.address.street}, ${reg.address.number} - ${reg.address.neighborhood}, ${reg.address.city}/${reg.address.state}`;
      return [
        reg.id,
        reg.registrationCode || '-',
        reg.name,
        reg.category === 'idoso' ? 'Idoso' : reg.category === 'pcd' ? 'PCD / Neuro' : 'Ambos',
        day,
        new Date(reg.createdAt).toLocaleDateString('pt-BR'),
        reg.status,
        reg.mobile,
        reg.phone || '-',
        address
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
  }, [registrations, eventDays]);

  const handleExportPDF = useCallback(() => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const headers = [["ID", "Código", "Nome", "Categoria", "Dia", "Status", "Celular"]];
    const data = registrations.map(reg => [
      reg.id.substring(0, 8),
      reg.registrationCode || '-',
      reg.name,
      reg.category === 'idoso' ? 'Idoso' : reg.category === 'pcd' ? 'PCD' : 'Ambos',
      eventDays.find(d => d.id === reg.eventDayId)?.date || '-',
      reg.status,
      reg.mobile
    ]);

    doc.setFontSize(16);
    doc.text("Relatório de Inscritos - São João Arcoverde 2026", 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 28,
      theme: 'striped',
      headStyles: { fillColor: [13, 34, 53] },
      styles: { fontSize: 8 },
    });

    doc.save(`cadastros-sao-joao-${new Date().toISOString().split('T')[0]}.pdf`);
  }, [registrations, eventDays]);

  return (
    <Card className="shadow-lg border-none overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-6 bg-muted/10 gap-4">
        <CardTitle className="text-xl">Gestão de Cadastros</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleExportPDF}
          >
            <FileText className="w-4 h-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground">
                <th className="px-6 py-4 font-bold uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Cód. Inscrição</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Dia Solicitado</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Data Cadastro</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider whitespace-nowrap">Fone Celular</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider whitespace-nowrap">Fone Fixo</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
               {registrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-muted-foreground">
                    Nenhum cadastro encontrado.
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">#{reg.id.substring(0, 8)}</td>
                    <td className="px-6 py-4 font-mono font-bold text-primary">{reg.registrationCode || '-'}</td>
                    <td className="px-6 py-4 font-bold group-hover:text-primary transition-colors">{reg.name}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm",
                        reg.category === 'idoso' ? "bg-green-100 text-green-700" : 
                        reg.category === 'pcd' ? "bg-orange-100 text-orange-700" :
                        "bg-purple-100 text-purple-700"
                      )}>
                        {reg.category === 'idoso' ? 'Idoso' : reg.category === 'pcd' ? 'PCD / Neuro' : 'Ambos'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {reg.eventDayId ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-primary">
                            {eventDays.find((d: any) => d.id === reg.eventDayId)?.date || 'Dia não encontrado'}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                            {eventDays.find((d: any) => d.id === reg.eventDayId)?.weekday}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">Não selecionado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(reg.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => onStatusChange(reg.id, reg.status === 'Aprovado' ? 'Pendente' : 'Aprovado')}
                        className={cn(
                          "flex items-center gap-1.5 font-medium hover:opacity-80 transition-opacity",
                          reg.status === 'Aprovado' ? "text-green-600" : "text-amber-600"
                        )}
                      >
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", reg.status === 'Aprovado' ? "bg-green-600" : "bg-amber-600")} />
                        {reg.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {reg.mobile}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {reg.phone || "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">Ver</Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(reg.id)}
                      >
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
});

RegistrationsTable.displayName = "RegistrationsTable";
