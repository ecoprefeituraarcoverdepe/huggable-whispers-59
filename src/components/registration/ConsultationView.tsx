import { useState, memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ArrowLeft, CheckCircle2, Clock, XCircle, User, Calendar, MapPin, Info } from "lucide-react";
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
  const [results, setResults] = useState<Registration[] | 'not_found' | null>(null);
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
    setResults(null);
    try {
      const { data: rpcData, error } = await supabase.rpc('lookup_registration', {
        _id_number: data.idNumber,
        _birth_date: data.birthDate,
      });

      if (error) throw error;

      if (Array.isArray(rpcData) && rpcData.length > 0) {
        const registrations: Registration[] = rpcData.map(foundData => ({
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
          registrationCode: foundData.registration_code,
        }));
        setResults(registrations);
      } else {
        setResults('not_found');
      }
    } catch (error) {
      console.error('Error searching registration:', error);
      setResults('not_found');
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
        {!results || results === 'not_found' ? (
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

                  {results === 'not_found' && (
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
            <div className="flex justify-between items-center mb-2">
               <h2 className="text-2xl font-bold text-primary">Seus Cadastros</h2>
               <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                 {results.length} inscrição(ões)
               </span>
            </div>
            
            {results.map((result) => (
              <Card key={result.id} className="shadow-xl overflow-hidden border-none bg-white mb-6">
                <div className={`h-2 w-full ${
                  result.status === 'Aprovado' ? 'bg-green-500' : 'bg-amber-500'
                }`} />
                <CardContent className="pt-8 pb-8">
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                    <div className="shrink-0">
                      {result.status === 'Aprovado' ? (
                        <div className="bg-green-100 p-4 rounded-full">
                          <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                      ) : (
                        <div className="bg-amber-100 p-4 rounded-full">
                          <Clock className="w-10 h-10 text-amber-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h2 className="text-2xl font-bold">
                        Status: <span className={result.status === 'Aprovado' ? 'text-green-600' : 'text-amber-600'}>
                          {result.status}
                        </span>
                      </h2>
                      <p className="text-muted-foreground">
                        {result.status === 'Aprovado' 
                          ? "Cadastro validado. Apresente documento com foto na entrada."
                          : "Sua solicitação está sendo analisada."}
                      </p>
                      
                      <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-lg font-bold">
                              {useAppStore.getState().eventDays.find(d => d.id === result.eventDayId)?.weekday || 'Dia selecionado'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {useAppStore.getState().eventDays.find(d => d.id === result.eventDayId)?.date || ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Código</p>
                            <p className="font-mono font-bold text-primary">{result.registrationCode}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <User className="w-5 h-5 text-primary" /> Dados do Inscrito
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Nome</p>
                    <p className="text-lg font-semibold">{results[0].name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">CPF/RG</p>
                      <p className="font-semibold">{results[0].idNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Categoria</p>
                      <p className="font-semibold capitalize">{results[0].category === 'pcd' ? 'PCD / Locomoção' : 'Pessoa Idosa'}</p>
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
                    <p className="font-semibold">{results[0].address.street}, {results[0].address.number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Bairro / Cidade</p>
                    <p className="font-semibold">{results[0].address.neighborhood}, {results[0].address.city}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-12 text-lg" 
              onClick={() => setResults(null)}
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
