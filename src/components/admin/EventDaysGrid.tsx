import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EventDay } from "@/store/useAppStore";
import { memo } from "react";

interface EventDaysGridProps {
  eventDays: EventDay[];
  onAdd: () => void;
  onEdit: (day: EventDay) => void;
  onDelete: (id: string) => void;
}

export const EventDaysGrid = memo(({ eventDays, onAdd, onEdit, onDelete }: EventDaysGridProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Gestão de Vagas por Dia</h2>
        <Button 
          onClick={onAdd}
          className="bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all"
        >
          + Cadastrar Vaga
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventDays.map((day) => (
          <Card key={day.id} className="overflow-hidden shadow-lg border-none group hover:translate-y-[-4px] transition-all duration-300">
            <div className="h-40 relative overflow-hidden">
              <img 
                src={day.image} 
                alt={day.weekday} 
                loading="lazy"
                decoding="async"
                width={400}
                height={160}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full font-bold text-primary shadow-sm">
                {day.date} - {day.weekday}
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="font-bold text-lg truncate">Atrações:</h3>
                  <p className="text-sm text-muted-foreground truncate" title={day.attractions.join(', ')}>
                    {day.attractions.join(', ')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-primary leading-none">
                    {day.approvedCount}<span className="text-sm text-muted-foreground font-normal">/{day.totalSpots}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Vagas</p>
                </div>
              </div>
              <div className="w-full bg-muted h-2 rounded-full mb-6 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${Math.min(100, (day.approvedCount / Math.max(1, day.totalSpots)) * 100)}%` }}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 hover:bg-muted/50"
                  onClick={() => onEdit(day)}
                >
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                  onClick={() => onDelete(day.id)}
                >
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
});

EventDaysGrid.displayName = "EventDaysGrid";
