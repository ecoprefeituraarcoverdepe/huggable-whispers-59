import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Search, PartyPopper, UserPlus } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useState, useCallback, Suspense, lazy, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoArcoverde from "@/assets/logo-acessibilidade.jpeg";
import landingBg from "@/assets/landing-bg.png";

// Lazy load heavy components
const RegistrationForm = lazy(() => import("@/components/registration/RegistrationForm").then(m => ({ default: m.RegistrationForm })));
const SuccessView = lazy(() => import("@/components/registration/SuccessView").then(m => ({ default: m.SuccessView })));
const ConsultationView = lazy(() => import("@/components/registration/ConsultationView").then(m => ({ default: m.ConsultationView })));
const LandingView = lazy(() => import("@/components/registration/LandingView").then(m => ({ default: m.LandingView })));

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [view, setView] = useState<'landing' | 'register' | 'consult'>('landing');
  const { addRegistration, fetchData, setLastRegistration } = useAppStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReset = useCallback(() => {
    setSubmitted(false);
    setView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const onSubmit = useCallback(async (data: any) => {
    try {
      console.log("Iniciando submissão de cadastro:", data);
      
      // Generate registration code before submitting
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const code = Array.from({ length: 8 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
      
      setLastRegistration(code, data.eventDayId);
      await addRegistration({ ...data, registrationCode: code });
      console.log("Cadastro realizado com sucesso");
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error("Erro detalhado ao cadastrar:", error);
      alert(`Houve um erro ao realizar seu cadastro: ${error.message || 'Erro desconhecido'}. Por favor, tente novamente.`);
    }
  }, [addRegistration]);

  if (submitted) {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
        <SuccessView onReset={handleReset} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
        <AnimatePresence mode="wait">
          {view === 'landing' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LandingView 
                onNavigate={(v) => {
                  setView(v);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                onAdmin={() => navigate({ to: '/admin' })}
              />
            </motion.div>
          ) : (
            <div className="flex flex-col">
              {/* Internal Header */}
              <header
                className="relative bg-primary overflow-hidden text-primary-foreground pt-10 pb-16 px-4"
                style={{
                  backgroundImage: `url(${landingBg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                <div className="absolute inset-0 bg-primary/50 pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10 text-center">
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex justify-center mb-6"
                  >
                    <div className="bg-white rounded-2xl p-4 shadow-xl cursor-pointer" onClick={() => setView('landing')}>
                      <img
                        src={logoArcoverde}
                        alt="Prefeitura de Arcoverde"
                        width={200}
                        height={112}
                        className="h-20 md:h-28 w-auto object-contain"
                        loading="eager"
                      />
                    </div>
                  </motion.div>
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
                  >
                    {view === 'register' ? 'São João - Espaço da Acessibilidade' : 'Consulta de Cadastro'}
                  </motion.h1>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                  >
                    <Button 
                      size="lg" 
                      variant="secondary" 
                      onClick={() => setView(view === 'register' ? 'consult' : 'register')}
                      className="text-lg px-8 py-8 h-auto font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-3"
                    >
                      {view === 'register' ? (
                        <>
                          <Search className="w-6 h-6" /> Já tenho cadastro, consultar
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-6 h-6" /> Novo cadastro
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setView('landing')}
                      className="text-lg px-8 py-8 h-auto font-bold bg-white/10 hover:bg-white/20 border-white/30 text-white"
                    >
                      Voltar ao Início
                    </Button>
                  </motion.div>
                </div>
              </header>

              <main className="max-w-4xl mx-auto -mt-8 px-4 relative z-20 w-full">
                {view === 'register' ? (
                  <motion.div
                    key="register-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <RegistrationForm onSubmit={onSubmit} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="consult-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <ConsultationView onBack={() => setView('landing')} />
                  </motion.div>
                )}
              </main>
            </div>
          )}
        </AnimatePresence>
      </Suspense>
    </div>
  );
}

