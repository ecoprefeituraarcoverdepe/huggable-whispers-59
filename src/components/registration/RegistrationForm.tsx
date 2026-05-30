import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Calendar, MapPin, Users } from "lucide-react";
import { memo, useEffect } from "react";
import { useAppStore, EventDay } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { maskCPF, maskPhone, maskCEP } from "@/lib/masks";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional().or(z.literal('')),
  mobile: z.string().min(11, "Celular inválido"),
  idNumber: z.string().min(7, "RG/CPF inválido"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  category: z.enum(["idoso", "pcd", "ambos"]),
  hasCompanion: z.boolean(),
  eventDayId: z.string().min(1, "Selecione um dia para comparecer"),
  address: z.object({
    cep: z.string().min(8, "CEP inválido"),
    street: z.string().min(3, "Rua inválida"),
    number: z.string().min(1, "Obrigatório"),
    neighborhood: z.string().min(3, "Bairro inválido"),
    city: z.string().min(3, "Cidade inválida"),
    state: z.string().length(2, "UF inválida").optional().or(z.literal('')),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface RegistrationFormProps {
  onSubmit: (data: FormValues) => void;
}

export const RegistrationForm = memo(({ onSubmit }: RegistrationFormProps) => {
  const { eventDays } = useAppStore();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "idoso",
      hasCompanion: false,
      eventDayId: "",
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

  const selectedDayId = watch("eventDayId");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-20">
      {/* Classificação */}
      <Card className="shadow-xl border-t-8 border-t-secondary overflow-hidden mx-auto max-w-3xl">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <User className="w-6 h-6 text-primary" />
            </div>
            Classificação
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <RadioGroup 
            defaultValue="idoso" 
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            onValueChange={(v) => setValue("category", v as "idoso" | "pcd" | "ambos")}
          >
            <div>
              <RadioGroupItem value="idoso" id="idoso" className="peer sr-only" />
              <Label
                htmlFor="idoso"
                className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all duration-200 h-full"
              >
                <div className="mb-2 text-2xl font-bold">Pessoa Idosa</div>
                <div className="text-sm text-muted-foreground">Acima de 60 anos</div>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="pcd" id="pcd" className="peer sr-only" />
              <Label
                htmlFor="pcd"
                className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all duration-200 h-full"
              >
                <div className="mb-2 text-2xl font-bold">PCD</div>
                <div className="text-sm text-muted-foreground text-center">PCD / Neurodiversidade / Locomoção</div>
              </Label>
            </div>
            <div>
              <RadioGroupItem value="ambos" id="ambos" className="peer sr-only" />
              <Label
                htmlFor="ambos"
                className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 [&:has([data-state=checked])]:border-primary cursor-pointer transition-all duration-200 h-full"
              >
                <div className="mb-2 text-2xl font-bold">Ambos</div>
                <div className="text-sm text-muted-foreground text-center">Pessoa Idosa e PCD</div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Programação e Vagas */}
      <Card className="shadow-xl border-t-8 border-t-primary overflow-hidden mx-auto max-w-3xl">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            Escolha o Dia
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eventDays.length === 0 ? (
              <p className="col-span-2 text-center py-8 text-muted-foreground">
                Nenhum dia de evento disponível no momento.
              </p>
            ) : (
              eventDays.map((day: EventDay) => {
                const isFull = day.approvedCount >= day.totalSpots;
                const isSelected = selectedDayId === day.id;
                
                return (
                  <div key={day.id}>
                    <input
                      type="radio"
                      id={`day-${day.id}`}
                      value={day.id}
                      className="peer sr-only"
                      disabled={isFull && !isSelected}
                      {...register("eventDayId")}
                    />
                    <Label
                      htmlFor={`day-${day.id}`}
                      className={cn(
                        "flex flex-col h-full rounded-xl border-2 border-muted bg-popover overflow-hidden hover:bg-red-50 hover:border-red-600 cursor-pointer transition-all duration-200 group",
                        isSelected && "border-primary border-4 bg-primary/10 ring-4 ring-primary/40 shadow-2xl scale-[1.03] -translate-y-1",
                        isFull && !isSelected && "opacity-50 cursor-not-allowed grayscale"
                      )}
                    >
                      <div className="h-32 relative overflow-hidden">
                        <img 
                          src={day.image} 
                          alt={day.weekday} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full text-xs font-bold text-primary">
                          {day.date}
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold uppercase px-2 py-1 rounded-full shadow-lg">
                            Selecionado
                          </div>
                        )}
                        {isFull && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="bg-destructive text-destructive-foreground text-[10px] font-bold uppercase px-2 py-1 rounded">Esgotado</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-lg">{day.weekday}</h4>
                          <span className="text-xs font-medium text-muted-foreground">
                            {day.totalSpots - day.approvedCount} vagas restantes
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          <span className="font-semibold text-primary/80">Atrações:</span> {day.attractions.join(', ')}
                        </p>
                      </div>
                    </Label>
                  </div>
                );
              })
            )}
          </div>
          {errors.eventDayId && (
            <p className="text-destructive text-sm font-medium mt-4 text-center">
              {errors.eventDayId.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Dados Pessoais */}
      <Card className="shadow-xl overflow-hidden mx-auto max-w-3xl">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="name" className="text-lg font-semibold">Nome Completo</Label>
            <Input 
              id="name" 
              {...register("name")} 
              placeholder="Digite seu nome completo" 
              className="h-12 text-lg rounded-lg focus-visible:ring-primary shadow-sm" 
            />
            {errors.name && <p className="text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="idNumber" className="text-lg font-semibold">CPF</Label>
            <Input 
              id="idNumber" 
              {...register("idNumber")} 
              onChange={(e) => setValue("idNumber", maskCPF(e.target.value))}
              placeholder="000.000.000-00" 
              className="h-12 text-lg rounded-lg focus-visible:ring-primary shadow-sm" 
            />
            {errors.idNumber && <p className="text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">{errors.idNumber.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-lg font-semibold">Data de Nascimento</Label>
            <Input id="birthDate" type="date" {...register("birthDate")} className="h-12 text-lg rounded-lg focus-visible:ring-primary shadow-sm" />
            {errors.birthDate && <p className="text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">{errors.birthDate.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-lg font-semibold">E-mail</Label>
            <Input id="email" type="email" {...register("email")} placeholder="exemplo@email.com" className="h-12 text-lg rounded-lg focus-visible:ring-primary shadow-sm" />
            {errors.email && <p className="text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-lg font-semibold">Celular (WhatsApp)</Label>
            <Input 
              id="mobile" 
              {...register("mobile")} 
              onChange={(e) => setValue("mobile", maskPhone(e.target.value))}
              placeholder="(00) 00000-0000" 
              className="h-12 text-lg rounded-lg focus-visible:ring-primary shadow-sm" 
            />
            {errors.mobile && <p className="text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">{errors.mobile.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card className="shadow-xl overflow-hidden mx-auto max-w-3xl">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="cep" className="text-lg font-semibold">CEP</Label>
            <Input 
              id="cep" 
              {...register("address.cep")} 
              onChange={(e) => setValue("address.cep", maskCEP(e.target.value))}
              placeholder="00000-000" 
              className="h-12 text-lg rounded-lg focus-visible:ring-primary shadow-sm" 
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="street" className="text-lg">Logradouro</Label>
            <Input id="street" {...register("address.street")} placeholder="Rua, Avenida, etc" className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number" className="text-lg">Número</Label>
            <Input id="number" {...register("address.number")} className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="neighborhood" className="text-lg">Bairro</Label>
            <Input id="neighborhood" {...register("address.neighborhood")} className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city" className="text-lg">Cidade</Label>
            <Input id="city" {...register("address.city")} className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Acompanhante */}
      <Card className="shadow-xl overflow-hidden mx-auto max-w-3xl">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Users className="w-6 h-6 text-primary" />
            </div>
            Acompanhante
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3 p-4 bg-muted/20 rounded-xl border border-muted">
            <Checkbox 
              id="hasCompanion" 
              className="w-6 h-6"
              onCheckedChange={(checked) => setValue("hasCompanion", !!checked)} 
            />
            <Label htmlFor="hasCompanion" className="text-lg cursor-pointer">
              Necessito de acompanhante no espaço
            </Label>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            * Cada beneficiário tem direito a apenas um (01) acompanhante.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-6">
        <Button 
          type="submit" 
          size="lg" 
          disabled={isSubmitting}
          className="w-full md:w-auto px-16 py-8 h-auto text-xl font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              Processando...
            </>
          ) : (
            "Finalizar Cadastro"
          )}
        </Button>
      </div>
    </form>
  );
});

RegistrationForm.displayName = "RegistrationForm";
