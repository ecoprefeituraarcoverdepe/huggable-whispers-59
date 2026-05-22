import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface SuccessViewProps {
  onReset: () => void;
}

export function SuccessView({ onReset }: SuccessViewProps) {
  const navigate = useNavigate();

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
            <p className="text-lg opacity-90">Seu código de inscrição será enviado por e-mail e SMS.</p>
          </div>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="bg-secondary/10 p-6 rounded-xl border border-secondary/20">
                <h3 className="text-xl font-bold flex items-center gap-2 text-primary mb-4">
                  <MapPin className="w-6 h-6" /> Localização do Polo Acessível
                </h3>
                <div className="aspect-video bg-muted rounded-lg relative overflow-hidden shadow-inner">
                  <img 
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop" 
                    alt="Mapa Ilustrativo" 
                    loading="lazy"
                    decoding="async"
                    width={800}
                    height={450}
                    className="object-cover w-full h-full opacity-50"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <div className="bg-white p-2 rounded-full shadow-lg mb-2">
                      <MapPin className="w-8 h-8 text-destructive fill-destructive/20" />
                    </div>
                    <p className="font-bold text-foreground bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm">Pátio do Forró - Área Norte</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground text-center italic">
                  Apresente seu documento original com foto na entrada reservada para validação.
                </p>
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
                  onClick={() => navigate({ to: '/' })}
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
