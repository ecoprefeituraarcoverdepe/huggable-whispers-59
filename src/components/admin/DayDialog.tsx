import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { EventDay } from "@/store/useAppStore";

interface DayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day?: EventDay | null;
  onSave: (day: any, imageFile?: File) => void;
}

export function DayDialog({ open, onOpenChange, day, onSave }: DayDialogProps) {
  const [formData, setFormData] = useState<Partial<EventDay>>({
    date: "",
    weekday: "",
    totalSpots: 100,
    attractions: [],
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=400&auto=format&fit=crop",
  });

  const [imageFile, setImageFile] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attractionInput, setAttractionInput] = useState("");

  useEffect(() => {
    if (day) {
      setFormData(day);
      setImagePreview(day.image);
    } else {
      setFormData({
        date: "",
        weekday: "",
        totalSpots: 100,
        attractions: [],
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=400&auto=format&fit=crop",
      });
      setImagePreview(null);
      setImageFile(undefined);
    }
  }, [day, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAttraction = () => {
    if (attractionInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        attractions: [...(prev.attractions || []), attractionInput.trim()],
      }));
      setAttractionInput("");
    }
  };

  const handleRemoveAttraction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attractions: prev.attractions?.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{day ? "Editar Dia" : "Cadastrar Novo Dia"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Data</Label>
            <Input
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="col-span-3"
              placeholder="ex: 22/06"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weekday" className="text-right">Dia</Label>
            <Input
              id="weekday"
              value={formData.weekday}
              onChange={(e) => setFormData({ ...formData, weekday: e.target.value })}
              className="col-span-3"
              placeholder="ex: Sábado"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="spots" className="text-right">Vagas</Label>
            <Input
              id="spots"
              type="number"
              value={formData.totalSpots}
              onChange={(e) => setFormData({ ...formData, totalSpots: parseInt(e.target.value) })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Atrações</Label>
            <div className="col-span-3 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={attractionInput}
                  onChange={(e) => setAttractionInput(e.target.value)}
                  placeholder="Nome da atração"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAttraction()}
                />
                <Button type="button" size="sm" onClick={handleAddAttraction}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.attractions?.map((attr, i) => (
                  <span key={i} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    {attr}
                    <button onClick={() => handleRemoveAttraction(i)} className="hover:text-destructive">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">Imagem</Label>
            <div className="col-span-3 space-y-2">
              {imagePreview && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <Input
                id="image"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground">Recomendado: 400x300px (JPEG/PNG)</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(formData, imageFile)}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}