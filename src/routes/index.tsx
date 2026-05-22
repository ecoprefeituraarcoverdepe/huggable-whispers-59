import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Search, PartyPopper, UserPlus } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useState, useCallback, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoArcoverde from "@/assets/logo-acessibilidade.jpeg";

// Lazy load heavy components
const RegistrationForm = lazy(() => import("@/components/registration/RegistrationForm").then(m => ({ default: m.RegistrationForm })));
const SuccessView = lazy(() => import("@/components/registration/SuccessView").then(m => ({ default: m.SuccessView })));
const ConsultationView = lazy(() => import("@/components/registration/ConsultationView").then(m => ({ default: m.ConsultationView })));

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [submitted, setSubmitted] = useState(false);
  const [view, setView] = useState<'register' | 'consult'>('register');
  const addRegistration = useAppStore((state) => state.addRegistration);

  const handleReset = useCallback(() => {
    setSubmitted(false);
    setView('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const onSubmit = useCallback((data: any) => {
    addRegistration(data);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      {/* Hero Section */}
      <header className="relative bg-primary overflow-hidden text-primary-foreground pt-10 pb-16 px-4">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="flex justify-around">
            {[...Array(10)].map((_, i) => (
              <PartyPopper key={i} className="w-12 h-12 rotate-12" />
            ))}
          </div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-white rounded-2xl p-4 shadow-xl">
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
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            {view === 'register' 
              ? 'Garanta seu lugar reservado com conforto e segurança para curtir a maior festa do ano.'
              : 'Verifique o status da sua solicitação e os detalhes do seu agendamento.'}
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={() => setView(view === 'register' ? 'consult' : 'register')}
              className="text-lg px-8 py-8 h-auto font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-3"
            >
              {view === 'register' ? (
                <>
                  <Search className="w-6 h-6" /> Já fiz meu cadastro, quero consultar
                </>
              ) : (
                <>
                  <UserPlus className="w-6 h-6" /> Quero fazer um novo cadastro
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto -mt-8 px-4 relative z-20">
        <Suspense fallback={<div className="p-8 text-center bg-white rounded-xl shadow-lg">Carregando...</div>}>
          <AnimatePresence mode="wait">
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
                <ConsultationView onBack={() => setView('register')} />
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      </main>
    </div>
  );
}

