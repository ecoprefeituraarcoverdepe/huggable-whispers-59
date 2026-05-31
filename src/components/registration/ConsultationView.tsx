import { useState, memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ArrowLeft, CheckCircle2, Clock, XCircle, User, Calendar, MapPin } from "lucide-react";
import { useAppStore, type Registration } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const consultSchema = z.object({
  idNumber: z.string().min(1, "Obrigatório"),
  birthDate: z.string().min(1, "Obrigatório"),
});

type ConsultValues = z.infer<typeof consultSchema>;

interface ConsultationViewProps {
  onBack: () => void;
}

export const ConsultationView = memo(({ onBack }: ConsultationViewProps) => {
  const [result, setResult] = useState<Registration | null | 'not_found'>(null);
  const [isSearching, setIsSearching] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsultValues>({
    resolver: zodResolver(consultSchema),
  });

  const onSubmit = async (data: ConsultValues) => {
    setIsSearching(true);
    setResult(null);
    try {
      const { data: foundData, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('id_number', data.idNumber)
        .eq('birth_date', data.birthDate)
        .maybeSingle();

      if (error) throw error;

      if (foundData) {
        const registration: Registration = {
          id: foundData.id,
          name: foundData.name,
          email: foundData.email,
          phone: foundData.phone,
          mobile: foundData.mobile,
          idNumber: foundData.id_number,
          birthDate: foundData.birth_date,
          category: foundData.category as any,
          hasCompanion: foundData.has_companion || false,
          address: {
            cep: foundData.address_cep,
            street: foundData.address_street,
            number: foundData.address_number,
            neighborhood: foundData.address_neighborhood,
            city: foundData.address_city,
            state: foundData.address_state,
          },
          status: foundData.status as any,
          createdAt: foundData.created_at || '',
          eventDayId: foundData.event_day_id,
        };
        setResult(registration);
      } else {
        setResult('not_found');
      }
    } catch (error) {
      console.error('Error searching registration:', error);
      setResult('not_found');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {!result || result === 'not_found' ? (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="shadow-xl border-t-8 border-t-primary overflow-hidden mx-auto max-w-3xl">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Search className="w-6 h-6 text-primary" />
                  </div>
                  Consultar Cadastro
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="idNumber" className="text-lg">RG ou CPF</Label>
                      <Input 
                        id="idNumber" 
                        {...register("idNumber")} 
                        placeholder="000.000.000-00" 
                        className="h-12 text-lg rounded-lg focus-visible:ring-primary" 
                      />
                      {errors.idNumber && <p className="text-destructive text-sm">{errors.idNumber.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate" className="text-lg">Data de Nascimento</Label>
                      <Input 
                        id="birthDate" 
                        type="date" 
                        {...register("birthDate")} 
                        className="h-12 text-lg rounded-lg focus-visible:ring-primary" 
                      />
                      {errors.birthDate && <p className="text-destructive text-sm">{errors.birthDate.message}</p>}
                    </div>
                  </div>

                  {result === 'not_found' && (
                    <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-3">
                      <XCircle className="w-5 h-5 shrink-0" />
                      <p className="font-medium">Cadastro não encontrado. Verifique os dados e tente novamente.</p>
                    </div>
                  )}

                  <Button type="submit" size="lg" disabled={isSearching} className="w-full h-14 text-lg font-bold">
                    {isSearching ? "Consultando..." : "Consultar Agora"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 mx-auto max-w-3xl"
          >
            {/* Status Card */}
            <Card className="shadow-xl overflow-hidden border-none bg-white">
              <div className={`h-2 w-full ${
                result.status === 'Aprovado' ? 'bg-green-500' : 'bg-amber-500'
              }`} />
              <CardContent className="pt-8 pb-8 text-center">
                <div className="flex justify-center mb-4">
                  {result.status === 'Aprovado' ? (
                    <div className="bg-green-100 p-4 rounded-full">
                      <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                  ) : (
                    <div className="bg-amber-100 p-4 rounded-full">
                      <Clock className="w-12 h-12 text-amber-600" />
                    </div>
                  )}
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  Status: <span className={result.status === 'Aprovado' ? 'text-green-600' : 'text-amber-600'}>
                    {result.status}
                  </span>
                </h2>
                <p className="text-muted-foreground text-lg">
                  {result.status === 'Aprovado' 
                    ? "Seu cadastro foi validado. Apresente um documento com foto na entrada do espaço."
                    : "Sua solicitação está sendo analisada pela equipe administrativa."}
                </p>
              </CardContent>
            </Card>

            {/* Registration Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg md:col-span-2 bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-xl text-primary">
                    <Calendar className="w-5 h-5" /> Dia do Evento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.eventDayId ? (
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold">
                          {useAppStore.getState().eventDays.find(d => d.id === result.eventDayId)?.weekday || 'Dia selecionado'}
                        </p>
                        <p className="text-muted-foreground">
                          {useAppStore.getState().eventDays.find(d => d.id === result.eventDayId)?.date || ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Localização</p>
                        <p className="font-bold text-primary">Espaço Acessibilidade</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic text-center py-2">Nenhum dia vinculado a este cadastro.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <User className="w-5 h-5 text-primary" /> Dados do Inscrito
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Nome</p>
                    <p className="text-lg font-semibold">{result.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">CPF/RG</p>
                      <p className="font-semibold">{result.idNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Categoria</p>
                      <p className="font-semibold capitalize">{result.category === 'pcd' ? 'PCD / Locomoção Reduzida' : 'Pessoa Idosa'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MapPin className="w-5 h-5 text-primary" /> Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Logradouro</p>
                    <p className="font-semibold">{result.address.street}, {result.address.number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Bairro / Cidade</p>
                    <p className="font-semibold">{result.address.neighborhood}, {result.address.city} - {result.address.state}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-12 text-lg" 
              onClick={() => setResult(null)}
            >
              Realizar nova consulta
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ConsultationView.displayName = "ConsultationView";
