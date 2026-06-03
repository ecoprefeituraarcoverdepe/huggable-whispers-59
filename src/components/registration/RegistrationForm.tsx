import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Calendar, MapPin, Users, FileUp, Loader2, FileCheck, Phone, Bus } from "lucide-react";
import { memo } from "react";
import { useAppStore, EventDay } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  email: z.string().email("E-mail inválido").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  mobile: z.string().min(11, "Celular inválido"),
  idNumber: z.string().min(7, "RG/CPF inválido"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  category: z.enum(["idoso", "pcd", "ambos"]),
  hasCompanion: z.boolean(),
  companionName: z.string().optional().or(z.literal('')),
  companionPhone: z.string().optional().or(z.literal('')),
  emergencyPhone: z.string().min(10, "Telefone de emergência inválido"),
  needsTransportation: z.boolean(),
  eventDayId: z.string().min(1, "Selecione um dia para comparecer"),
  address: z.object({
    cep: z.string().optional().or(z.literal('')),
    street: z.string().optional().or(z.literal('')),
    number: z.string().optional().or(z.literal('')),
    neighborhood: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().length(2, "UF inválida").optional().or(z.literal('')),
    referencePoint: z.string().optional().or(z.literal('')),
  }),
  documentUrl: z.string().optional().refine((val) => {
    // This is handled in a more complex way below or via schema transformation
    return true;
  }),
  disabilityCode: z.string().optional().or(z.literal('')),
  pcdName: z.string().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.category !== "idoso" && (!data.documentUrl || data.documentUrl.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "O laudo médico em PDF é obrigatório para esta categoria",
      path: ["documentUrl"],
    });
  }
  if (data.needsTransportation) {
    const requiredAddress: Array<["cep" | "street" | "number" | "neighborhood" | "city", string]> = [
      ["cep", "CEP inválido"],
      ["street", "Rua inválida"],
      ["number", "Obrigatório"],
      ["neighborhood", "Bairro inválido"],
      ["city", "Cidade inválida"],
    ];
    requiredAddress.forEach(([key, msg]) => {
      const val = (data.address as any)[key];
      if (!val || String(val).trim().length < (key === "number" ? 1 : 3)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: msg, path: ["address", key] });
      }
    });
  }
  if (data.hasCompanion) {
    if (!data.companionName || data.companionName.trim().length < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Nome do acompanhante é obrigatório", path: ["companionName"] });
    }
    if (!data.companionPhone || data.companionPhone.trim().length < 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Telefone do acompanhante inválido", path: ["companionPhone"] });
    }
  }
});

type FormValues = z.infer<typeof formSchema>;

interface RegistrationFormProps {
  onSubmit: (data: FormValues) => void;
}

export const RegistrationForm = memo(({ onSubmit }: RegistrationFormProps) => {
  const { eventDays } = useAppStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

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
      needsTransportation: false,
      companionName: "",
      companionPhone: "",
      emergencyPhone: "",
      eventDayId: "",
      address: {
        state: "",
        cep: "",
        street: "",
        number: "",
        neighborhood: "",
        city: "",
        referencePoint: "",
      },
      documentUrl: "",
      disabilityCode: "",
      pcdName: "",
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Por favor, envie apenas arquivos no formato PDF.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("O arquivo deve ter no máximo 5MB.");
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { data, error } = await supabase.storage
        .from("registration-documents")
        .upload(filePath, file, {
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("registration-documents")
        .getPublicUrl(filePath);

      setUploadedFileUrl(publicUrl);
      setFileName(file.name);
      setValue("documentUrl", publicUrl);
      toast.success("Documento enviado com sucesso!");
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao enviar o documento. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };


  const selectedDayId = watch("eventDayId");
  const needsTransportation = watch("needsTransportation");
  const hasCompanion = watch("hasCompanion");

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
            <Label htmlFor="name" className="text-lg">Nome Completo</Label>
            <Input id="name" {...register("name")} placeholder="Digite seu nome completo" className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
            {errors.name && <p className="text-destructive text-sm font-medium">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="idNumber" className="text-lg">RG ou CPF</Label>
            <Input id="idNumber" {...register("idNumber")} placeholder="000.000.000-00" className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
            {errors.idNumber && <p className="text-destructive text-sm font-medium">{errors.idNumber.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-lg">Data de Nascimento</Label>
            <Input id="birthDate" type="date" {...register("birthDate")} className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
            {errors.birthDate && <p className="text-destructive text-sm font-medium">{errors.birthDate.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-lg">
              E-mail <span className="text-sm text-muted-foreground font-normal">(não obrigatório)</span>
            </Label>
            <Input id="email" type="email" {...register("email")} placeholder="exemplo@email.com" className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
            {errors.email && <p className="text-destructive text-sm font-medium">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-lg">Celular</Label>
            <Input id="mobile" {...register("mobile")} placeholder="(00) 00000-0000" className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
            {errors.mobile && <p className="text-destructive text-sm font-medium">{errors.mobile.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="disabilityCode" className="text-lg">Código de Deficiência (CID)</Label>
            <Input id="disabilityCode" {...register("disabilityCode")} placeholder="Ex: G80" className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pcdName" className="text-lg">Nome da Deficiência</Label>
            <Input id="pcdName" {...register("pcdName")} placeholder="Ex: Paralisia Cerebral, Autismo, etc" className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card className="shadow-xl overflow-hidden mx-auto max-w-3xl">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Bus className="w-6 h-6 text-primary" />
            </div>
            Necessidade de Transporte
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center space-x-3 p-4 bg-muted/20 rounded-xl border border-muted">
            <Checkbox
              id="needsTransportation"
              className="w-6 h-6"
              checked={needsTransportation}
              onCheckedChange={(checked) => setValue("needsTransportation", !!checked)}
            />
            <Label htmlFor="needsTransportation" className="text-lg cursor-pointer">
              Preciso de transporte
            </Label>
          </div>
          <p className="text-sm font-medium text-primary bg-primary/5 p-3 rounded-lg border border-primary/10 italic">
            <strong>Observação:</strong> O transporte será direcionado apenas para cadeirantes e pessoas com dificuldade de locomoção.
          </p>

          {needsTransportation && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t">
              <div className="md:col-span-3 flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Endereço para retirada</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cep" className="text-lg">CEP</Label>
                <Input id="cep" {...register("address.cep")} placeholder="00000-000" className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
                {errors.address?.cep && <p className="text-destructive text-sm font-medium">{errors.address.cep.message}</p>}
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="street" className="text-lg">Logradouro</Label>
                <Input id="street" {...register("address.street")} placeholder="Rua, Avenida, etc" className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
                {errors.address?.street && <p className="text-destructive text-sm font-medium">{errors.address.street.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="number" className="text-lg">Número</Label>
                <Input id="number" {...register("address.number")} className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
                {errors.address?.number && <p className="text-destructive text-sm font-medium">{errors.address.number.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="neighborhood" className="text-lg">Bairro</Label>
                <Input id="neighborhood" {...register("address.neighborhood")} className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
                {errors.address?.neighborhood && <p className="text-destructive text-sm font-medium">{errors.address.neighborhood.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-lg">Cidade</Label>
                <Input id="city" {...register("address.city")} className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
                {errors.address?.city && <p className="text-destructive text-sm font-medium">{errors.address.city.message}</p>}
              </div>
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="referencePoint" className="text-lg">Ponto de Referência</Label>
                <Input id="referencePoint" {...register("address.referencePoint")} placeholder="Próximo a..." className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 pt-2 border-t">
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone" className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5" /> Telefone de Emergência
              </Label>
              <Input id="emergencyPhone" {...register("emergencyPhone")} placeholder="(00) 00000-0000" className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
              {errors.emergencyPhone && <p className="text-destructive text-sm font-medium">{errors.emergencyPhone.message}</p>}
            </div>
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
          {hasCompanion && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="companionName" className="text-lg">Nome do Acompanhante</Label>
                <Input id="companionName" {...register("companionName")} placeholder="Nome completo" className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
                {errors.companionName && <p className="text-destructive text-sm font-medium">{errors.companionName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="companionPhone" className="text-lg">Telefone do Acompanhante</Label>
                <Input id="companionPhone" {...register("companionPhone")} placeholder="(00) 00000-0000" className="h-12 text-lg rounded-lg focus-visible:ring-primary" />
                {errors.companionPhone && <p className="text-destructive text-sm font-medium">{errors.companionPhone.message}</p>}
              </div>
            </div>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            * Cada beneficiário tem direito a apenas um (01) acompanhante.
          </p>
          <p className="mt-2 text-sm font-medium text-primary bg-primary/5 p-3 rounded-lg border border-primary/10 italic">
            <strong>Observações:</strong> * O direito para incluir o acompanhante na inscrição se dá apenas para as pessoas 60+/PCD que tenha dificuldade de locomoção, baixa visão, cadeirante, autista, ou que tenha algum tipo de transtorno comprovado por laudo médico.
          </p>
        </CardContent>
      </Card>

      {/* Upload de Laudo */}
      <Card className="shadow-xl overflow-hidden mx-auto max-w-3xl border-t-8 border-t-blue-500">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-full">
              <FileUp className="w-6 h-6 text-blue-500" />
            </div>
            Anexar Laudo Médico (Obrigatório)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div 
            className={cn(
              "relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-muted/30",
              uploadedFileUrl ? "border-green-500 bg-green-50/50" : "border-muted-foreground/20",
              watch("category") === "idoso" && "opacity-50 cursor-not-allowed pointer-events-none"
            )}
            onClick={() => {
              if (watch("category") !== "idoso") {
                document.getElementById('laudo-upload')?.click();
              } else {
                toast.info("Pessoas idosas não precisam anexar laudo.");
              }
            }}
          >
            <input 
              id="laudo-upload" 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={watch("category") === "idoso" || isUploading}
            />
            
            {isUploading ? (
              <>
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-lg font-medium">Enviando documento...</p>
              </>
            ) : uploadedFileUrl ? (
              <>
                <FileCheck className="w-12 h-12 text-green-500 mb-4" />
                <p className="text-lg font-bold text-green-600">Arquivo enviado: {fileName}</p>
                <p className="text-sm text-muted-foreground mt-2">Clique para substituir o arquivo</p>
              </>
            ) : (
              <>
                <FileUp className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                  {watch("category") === "idoso" 
                    ? "Upload não necessário para Idosos" 
                    : "Clique para selecionar seu laudo médico"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {watch("category") === "idoso" 
                    ? "Esta categoria está isenta de laudo" 
                    : "Apenas formato PDF (máx. 5MB)"}
                </p>
              </>
            )}
          </div>
          {errors.documentUrl && (
            <p className="text-destructive text-sm font-medium text-center">{errors.documentUrl.message}</p>
          )}
          <p className="text-sm text-muted-foreground">
            * O envio do laudo médico é indispensável para a validação do cadastro.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-6">
        <Button 
          type="submit" 
          size="lg" 
          disabled={isSubmitting}
          className="w-full md:w-auto px-16 py-8 h-auto text-xl font-bold shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50"
        >
          {isSubmitting ? "Enviando..." : "Finalizar Cadastro"}
        </Button>
      </div>
    </form>
  );
});

RegistrationForm.displayName = "RegistrationForm";
