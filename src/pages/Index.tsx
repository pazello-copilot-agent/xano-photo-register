import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, Calendar, FileText, Link } from "lucide-react";

interface PhotoData {
  description: string;
  photo_url: string;
  taken_at: string;
}

const Index = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PhotoData>();

  const onSubmit = async (data: PhotoData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("photos")
        .insert([{
          description: data.description,
          photo_url: data.photo_url,
          taken_at: data.taken_at
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Foto cadastrada com sucesso.",
      });
      
      reset();
    } catch (error) {
      console.error("Erro ao cadastrar foto:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao cadastrar a foto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Cadastro de Fotos
          </h1>
          <p className="text-lg text-muted-foreground">
            Registre suas fotos com descrição e data
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Nova Foto
            </CardTitle>
            <CardDescription>
              Preencha os dados da foto para cadastrá-la no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  placeholder="Descreva a foto..."
                  {...register("description", { 
                    required: "A descrição é obrigatória",
                    minLength: { value: 5, message: "A descrição deve ter pelo menos 5 caracteres" }
                  })}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo_url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  URL da Foto
                </Label>
                <Input
                  id="photo_url"
                  type="url"
                  placeholder="https://exemplo.com/foto.jpg"
                  {...register("photo_url", { 
                    required: "A URL da foto é obrigatória",
                    pattern: {
                      value: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
                      message: "Digite uma URL válida de imagem"
                    }
                  })}
                />
                {errors.photo_url && (
                  <p className="text-sm text-destructive">{errors.photo_url.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="taken_at" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data e Hora
                </Label>
                <Input
                  id="taken_at"
                  type="datetime-local"
                  {...register("taken_at", { 
                    required: "A data e hora são obrigatórias" 
                  })}
                />
                {errors.taken_at && (
                  <p className="text-sm text-destructive">{errors.taken_at.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Cadastrando..." : "Cadastrar Foto"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
