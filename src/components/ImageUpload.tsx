import { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageUpload: (base64: string) => void;
  isLoading: boolean;
}

export const ImageUpload = ({ onImageUpload, isLoading }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback((file: File) => {
    if (!file.type.match('image/(jpeg|jpg|png)')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG or PNG image',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onImageUpload(base64);
    };
    reader.readAsDataURL(file);
  }, [onImageUpload, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          isDragging 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
        } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        
        {preview ? (
          <div className="space-y-4">
            <img 
              src={preview} 
              alt="Flowchart preview" 
              className="max-h-64 mx-auto rounded-lg shadow-medium"
            />
            <p className="text-sm text-muted-foreground">
              Click or drag to replace image
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-primary to-secondary">
              {isDragging ? (
                <ImageIcon className="h-12 w-12 text-white" />
              ) : (
                <Upload className="h-12 w-12 text-white" />
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">
                {isDragging ? 'Drop your flowchart here' : 'Upload Flowchart'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPG and PNG formats
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
