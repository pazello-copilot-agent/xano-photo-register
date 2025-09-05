import { useState } from "react";
import { useForm } from "react-hook-form";
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, Calendar, FileText, Link, Upload, ImagePlus } from "lucide-react";

interface PhotoData {
  description: string;
  photo_url: string;
  taken_at: string;
}

const Index = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PhotoData>();
  
  const watchedPhotoUrl = watch("photo_url");

  const takePicture = async () => {
    setIsTakingPhoto(true);
    
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      if (image.base64String) {
        const fileName = `photo-${Date.now()}.${image.format}`;
        const base64Data = image.base64String;
        
        // Convert base64 to blob
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: `image/${image.format}` });

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('photos')
          .upload(fileName, blob);

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName);

        setCapturedPhoto(publicUrl);
        setValue("photo_url", publicUrl);
        
        toast({
          title: "Foto capturada!",
          description: "Foto salva com sucesso.",
        });
      }
    } catch (error) {
      console.error("Erro ao capturar foto:", error);
      toast({
        title: "Erro",
        description: "Não foi possível capturar a foto. Verifique as permissões da câmera.",
        variant: "destructive",
      });
    } finally {
      setIsTakingPhoto(false);
    }
  };

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
      setCapturedPhoto(null);
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

              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Foto
                </Label>
                
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={takePicture}
                    disabled={isTakingPhoto}
                    className="flex items-center gap-2"
                  >
                    <ImagePlus className="h-4 w-4" />
                    {isTakingPhoto ? "Capturando..." : "Tirar Foto"}
                  </Button>
                </div>
                
                {capturedPhoto && (
                  <div className="space-y-2">
                    <div className="relative">
                      <img 
                        src={capturedPhoto} 
                        alt="Foto capturada" 
                        className="w-full max-w-sm rounded-lg border"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="photo_url" className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Ou cole a URL da Foto
                  </Label>
                  <Input
                    id="photo_url"
                    type="url"
                    placeholder="https://exemplo.com/foto.jpg"
                    {...register("photo_url", { 
                      required: "É necessário capturar uma foto ou inserir uma URL",
                      pattern: {
                        value: /^https?:\/\/.+/i,
                        message: "Digite uma URL válida"
                      }
                    })}
                  />
                  {errors.photo_url && (
                    <p className="text-sm text-destructive">{errors.photo_url.message}</p>
                  )}
                </div>
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
