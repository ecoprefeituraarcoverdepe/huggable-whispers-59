import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";

interface SuccessViewProps {
  onReset: () => void;
  registrationCode: string;
}

export function SuccessView({ onReset, registrationCode }: SuccessViewProps) {

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