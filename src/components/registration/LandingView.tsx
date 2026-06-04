import { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Search, 
  Settings, 
  Info, 
  Heart, 
  ShieldCheck, 
  Accessibility 
} from "lucide-react";
import logoArcoverde from "@/assets/logo-v2.png";
import landingBg from "@/assets/landing-bg.png";

interface LandingViewProps {
  onNavigate: (view: 'register' | 'consult') => void;
  onAdmin: () => void;
}

export const LandingView = memo(({ onNavigate, onAdmin }: LandingViewProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <section
        className="relative pt-12 pb-24 px-4 overflow-hidden text-primary-foreground bg-primary"
        style={{
          backgroundImage: `url(${landingBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-primary/40 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-10"
          >
            <div className="bg-white rounded-3xl p-6 shadow-2xl">
              <img
                src={logoArcoverde}
                alt="Logo Acessibilidade"
                className="h-24 md:h-32 w-auto object-contain"
              />
            </div>
          </motion.div>

          <div className="text-center max-w-3xl mx-auto space-y-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-7xl font-bold tracking-tight leading-tight"
            >
              São João de Arcoverde <br />
              <span className="text-secondary">Acessível para Todos</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl opacity-90 leading-relaxed"
            >
              Criamos um espaço exclusivo para que pessoas idosas e com deficiência 
              possam aproveitar as festividades com total conforto, segurança e dignidade.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
            >
              <Button 
                size="lg" 
                onClick={() => onNavigate('register')}
                className="h-20 px-10 text-xl font-bold rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-none text-white hover:opacity-90"
                style={{ backgroundColor: '#F5AA43' }}
              >
                <UserPlus className="w-7 h-7" /> Realizar Cadastro
              </Button>
              <Button 
                onClick={onAdmin}
                variant="destructive"
                size="lg"
                className="h-20 px-10 text-xl font-bold rounded-2xl shadow-xl hover:scale-105 transition-all gap-3"
              >
                <Settings className="w-7 h-7" /> Acesso Administrativo
              </Button>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => onNavigate('consult')}
                className="h-20 px-10 text-xl font-bold rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 bg-white text-primary hover:bg-white/90"
              >
                <Search className="w-7 h-7" /> Consultar Inscrição
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Exemplo de Eventos */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Principais Eventos</h2>
            <p className="text-xl text-muted-foreground">Confira alguns dos destaques da nossa programação</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl overflow-hidden shadow-xl border border-muted"
            >
              <div className="h-48 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=600&auto=format&fit=crop" alt="Evento 1" className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-primary">22 de Junho</span>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-bold">Destaque</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Abertura Oficial</h3>
                <p className="text-muted-foreground mb-4">Uma noite inesquecível com o melhor do forró tradicional para começar nossas festividades.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-muted px-2 py-1 rounded text-xs">Forró</span>
                  <span className="bg-muted px-2 py-1 rounded text-xs">Tradição</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl overflow-hidden shadow-xl border border-muted"
            >
              <div className="h-48 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1514525253361-bee048220791?q=80&w=600&auto=format&fit=crop" alt="Evento 2" className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-primary">23 de Junho</span>
                  <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded-full font-bold">Véspera</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Noite de São João</h3>
                <p className="text-muted-foreground mb-4">A grande celebração da véspera com fogos, quadrilhas e muita animação no Polo Multicultural.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-muted px-2 py-1 rounded text-xs">Quadrilha</span>
                  <span className="bg-muted px-2 py-1 rounded text-xs">Cultura</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl overflow-hidden shadow-xl border border-muted"
            >
              <div className="h-48 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop" alt="Evento 3" className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-primary">24 de Junho</span>
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-bold">Encerramento</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Grande Final</h3>
                <p className="text-muted-foreground mb-4">Fechando com chave de ouro as festividades do São João mais autêntico do Sertão Pernambucano.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-muted px-2 py-1 rounded text-xs">Sertão</span>
                  <span className="bg-muted px-2 py-1 rounded text-xs">Festa</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Info Sections */}
      <section className="py-24 px-4 -mt-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-3xl shadow-xl border border-muted"
            >
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Segurança Garantida</h3>
              <p className="text-muted-foreground text-lg">
                Área monitorada e com acesso controlado para garantir a tranquilidade de todos os usuários do espaço.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-3xl shadow-xl border border-muted"
            >
              <div className="bg-secondary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Conforto e Lazer</h3>
              <p className="text-muted-foreground text-lg">
                Estrutura completa com assentos, banheiros acessíveis e visão privilegiada das apresentações.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-3xl shadow-xl border border-muted"
            >
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Info className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Atendimento Especial</h3>
              <p className="text-muted-foreground text-lg">
                Equipe treinada para oferecer suporte e orientações durante todo o período dos eventos.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer / Admin Access */}
      <footer className="mt-auto py-12 px-4 border-t bg-muted/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <img src={logoArcoverde} alt="Logo" className="h-10 opacity-50" />
            <p className="text-muted-foreground">© 2026 Prefeitura de Arcoverde - Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
});

LandingView.displayName = "LandingView";
