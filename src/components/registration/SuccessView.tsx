import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, Calendar, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";

interface SuccessViewProps {
  onReset: () => void;
}

export function SuccessView({ onReset }: SuccessViewProps) {
  const { lastRegistrationCode, lastEventDayId, eventDays } = useAppStore();
  const [registrationCode, setRegistrationCode] = useState("");
  const [selectedDays, setSelectedDays] = useState<any[]>([]);

  useEffect(() => {
    if (lastRegistrationCode) {
      setRegistrationCode(lastRegistrationCode);
    }
    if (lastEventDayId && eventDays.length > 0) {
      const dayIds = lastEventDayId.split(',');
      const days = eventDays.filter(d => dayIds.includes(d.id));
      setSelectedDays(days);
    }
  }, [lastRegistrationCode, lastEventDayId, eventDays]);

  const copyToClipboard = () => {
    if (!registrationCode) return;
    navigator.clipboard.writeText(registrationCode);
    toast.success("Código copiado para a área de transferência!");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl w-full"
      >
        <Card className="border-2 border-primary overflow-hidden shadow-2xl">
          <div className="bg-primary p-8 text-center text-primary-foreground">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Cadastro concluído</h1>
            <p className="text-lg opacity-90">Por favor, salve o código abaixo como seu comprovante de inscrição.</p>
          </div>
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="bg-muted p-6 rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-4">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Código de Inscrição</span>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-mono font-bold tracking-widest text-primary">{registrationCode || "------"}</span>
                  <Button variant="ghost" size="icon" onClick={copyToClipboard} title="Copiar código" disabled={!registrationCode}>
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {selectedDays.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-primary flex items-center gap-2 px-2">
                    <Calendar className="w-5 h-5" /> {selectedDays.length === 1 ? 'Evento Selecionado' : 'Eventos Selecionados'}
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedDays.map((day) => (
                      <div key={day.id} className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-foreground">{day.weekday}</p>
                          <p className="text-sm text-muted-foreground">{day.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-medium text-muted-foreground uppercase">Localização</p>
                          <p className="text-sm font-semibold text-primary">Espaço Acessibilidade</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic px-2">
                    * Apresente seu documento com foto e este código na entrada para cada dia selecionado.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="flex-1 text-lg py-6 shadow-md hover:shadow-lg transition-all" 
                  onClick={onReset}
                >
                  Fazer novo cadastro
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 text-lg py-6 shadow-sm hover:shadow-md transition-all" 
                  onClick={() => window.location.href = '/'}
                >
                  Voltar ao início
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}