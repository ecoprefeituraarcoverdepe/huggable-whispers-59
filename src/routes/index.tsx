import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, User, Calendar, CheckCircle, Search, PartyPopper } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  mobile: z.string().min(11, "Celular inválido"),
  idNumber: z.string().min(7, "RG/CPF inválido"),
  birthDate: z.string(),
  category: z.enum(["idoso", "pcd"]),
  hasCompanion: z.boolean(),
  address: z.object({
    cep: z.string().min(8, "CEP inválido"),
    street: z.string().min(3, "Rua inválida"),
    number: z.string().min(1, "Obrigatório"),
    neighborhood: z.string().min(3, "Bairro inválido"),
    city: z.string().min(3, "Cidade inválida"),
    state: z.string().length(2, "UF inválida"),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [submitted, setSubmitted] = useState(false);
  const addRegistration = useAppStore((state) => state.addRegistration);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "idoso" as const,
      hasCompanion: false,
      address: {
        state: "PE",
        cep: "",
        street: "",
        number: "",
        neighborhood: "",
        city: "",
      },
    },
  });

  const onSubmit = (data: FormValues) => {
    addRegistration(data);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-2 border-primary overflow-hidden">
            <div className="bg-primary p-8 text-center text-primary-foreground">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Inscrição Realizada!</h1>
              <p className="text-lg opacity-90">Seu código de inscrição será enviado por e-mail e SMS.</p>
            </div>
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="bg-secondary/20 p-6 rounded-lg border border-secondary">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-primary mb-4">
                    <MapPin className="w-6 h-6" /> Localização do Polo Acessível
                  </h3>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop" 
                      alt="Mapa Ilustrativo" 
                      className="object-cover w-full h-full opacity-50"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <div className="bg-white p-2 rounded-full shadow-lg mb-2">
                        <MapPin className="w-8 h-8 text-destructive fill-destructive/20" />
                      </div>
                      <p className="font-bold text-foreground bg-white/80 px-3 py-1 rounded-full text-sm">Pátio do Forró - Área Norte</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground text-center">
                    Apresente seu documento original com foto na entrada reservada para validação.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="flex-1 text-lg py-6" onClick={() => setSubmitted(false)}>
                    Fazer novo cadastro
                  </Button>
                  <Button variant="outline" className="flex-1 text-lg py-6" onClick={() => navigate({ to: '/admin' })}>
                    Ir para o Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <header className="relative bg-primary overflow-hidden text-primary-foreground py-16 px-4">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="flex justify-around">
            {[...Array(10)].map((_, i) => (
              <PartyPopper key={i} className="w-12 h-12 rotate-12" />
            ))}
          </div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
          >
            São João - Espaço da Acessibilidade
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Garanta seu lugar reservado com conforto e segurança para curtir a maior festa do ano.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button size="lg" variant="secondary" className="text-lg px-8 py-8 h-auto font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-3">
              <Search className="w-6 h-6" /> Já fiz meu cadastro, quero consultar
            </Button>
          </motion.div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto -mt-10 px-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Classificação */}
          <Card className="shadow-xl border-t-8 border-t-secondary">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="w-6 h-6 text-primary" />
                </div>
                Classificação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                defaultValue="idoso" 
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                onValueChange={(v) => setValue("category", v as "idoso" | "pcd")}
              >
                <div>
                  <RadioGroupItem value="idoso" id="idoso" className="peer sr-only" />
                  <Label
                    htmlFor="idoso"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <div className="mb-2 text-2xl font-bold">Pessoa Idosa</div>
                    <div className="text-sm text-muted-foreground">Acima de 60 anos</div>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="pcd" id="pcd" className="peer sr-only" />
                  <Label
                    htmlFor="pcd"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                  >
                    <div className="mb-2 text-2xl font-bold">PCD</div>
                    <div className="text-sm text-muted-foreground">Dificuldade de Locomoção</div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Dados Pessoais */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="name" className="text-lg">Nome Completo</Label>
                <Input id="name" {...register("name")} placeholder="Digite seu nome completo" className="h-12 text-lg" />
                {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="idNumber" className="text-lg">RG ou CPF</Label>
                <Input id="idNumber" {...register("idNumber")} placeholder="000.000.000-00" className="h-12 text-lg" />
                {errors.idNumber && <p className="text-destructive text-sm">{errors.idNumber.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-lg">Data de Nascimento</Label>
                <Input id="birthDate" type="date" {...register("birthDate")} className="h-12 text-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg">E-mail</Label>
                <Input id="email" type="email" {...register("email")} placeholder="exemplo@email.com" className="h-12 text-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-lg">Celular</Label>
                <Input id="mobile" {...register("mobile")} placeholder="(00) 00000-0000" className="h-12 text-lg" />
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cep" className="text-lg">CEP</Label>
                <Input id="cep" {...register("address.cep")} placeholder="00000-000" className="h-12 text-lg" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="street" className="text-lg">Logradouro</Label>
                <Input id="street" {...register("address.street")} placeholder="Rua, Avenida, etc" className="h-12 text-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number" className="text-lg">Número</Label>
                <Input id="number" {...register("address.number")} className="h-12 text-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood" className="text-lg">Bairro</Label>
                <Input id="neighborhood" {...register("address.neighborhood")} className="h-12 text-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-lg">Cidade</Label>
                <Input id="city" {...register("address.city")} className="h-12 text-lg" />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-6">
            <Button type="submit" size="lg" className="w-full md:w-auto px-16 py-8 h-auto text-xl font-bold shadow-2xl">
              Finalizar Cadastro
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
