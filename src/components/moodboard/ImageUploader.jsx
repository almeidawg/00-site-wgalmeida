import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from '@/lib/motion-lite';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';

const ImageUploader = ({ onImagesAdd, maxImages = 6, currentCount = 0 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [error, setError] = useState('');

  const remainingSlots = maxImages - currentCount;

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = async (files) => {
    if (remainingSlots <= 0) {
      setError(`Limite de ${maxImages} imagens atingido`);
      return;
    }

    setIsLoading(true);
    setError('');

    const validFiles = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, remainingSlots);

    if (validFiles.length === 0) {
      setError('Por favor, selecione apenas arquivos de imagem');
      setIsLoading(false);
      return;
    }

    try {
      const imagePromises = validFiles.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              url: e.target.result,
              name: file.name,
              type: 'local',
            });
          };
          reader.readAsDataURL(file);
        });
      });

      const images = await Promise.all(imagePromises);
      onImagesAdd(images);
    } catch (err) {
      setError('Erro ao processar imagens');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [remainingSlots]
  );

  const handleFileSelect = (e) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) {
      setError('Por favor, insira uma URL válida');
      return;
    }

    if (remainingSlots <= 0) {
      setError(`Limite de ${maxImages} imagens atingido`);
      return;
    }

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const isImageUrl = imageExtensions.some((ext) =>
      urlInput.toLowerCase().includes(ext)
    ) || urlInput.includes('unsplash.com') || urlInput.includes('cloudinary.com');

    if (!isImageUrl && !urlInput.startsWith('data:image')) {
      setError('URL não parece ser uma imagem válida');
      return;
    }

    const newImage = {
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: urlInput,
      name: 'Imagem da URL',
      type: 'url',
    };

    onImagesAdd([newImage]);
    setUrlInput('');
    setShowUrlInput(false);
    setError('');
  };

  return (
    <div className="space-y-6 text-slate-200">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <ImageIcon className="w-3.5 h-3.5" />
          Biblioteca de Ativos
        </h3>
        <span className="text-[9px] font-mono text-slate-600">
          {currentCount}/{maxImages}
        </span>
      </div>

      {/* Drop Zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging ? '#F25C26' : 'rgba(242, 92, 38, 0.2)',
          backgroundColor: isDragging ? 'rgba(242, 92, 38, 0.05)' : 'rgba(0, 0, 0, 0.2)',
        }}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${
          remainingSlots <= 0 ? 'opacity-30 pointer-events-none' : 'cursor-pointer border-wg-orange/25 hover:border-wg-orange/60'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={remainingSlots <= 0 || isLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-wg-orange animate-spin" />
            <p className="text-[10px] uppercase font-bold text-slate-500">Processando...</p>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-wg-orange/70 mx-auto mb-3" />
            <p className="text-slate-400 text-xs font-medium">
              Arraste arquivos ou clique para selecionar
            </p>
            <p className="text-[9px] text-slate-600 uppercase font-bold mt-2">
              PNG, JPG, WEBP &bull; Max: {remainingSlots}
            </p>
          </>
        )}
      </motion.div>

      {/* URL Input Toggle */}
      <div>
        <button
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-wg-orange transition-colors"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          Importar por URL externa
        </button>
      </div>

      {/* URL Input */}
      <AnimatePresence>
        {showUrlInput && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-2"
          >
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 focus:ring-1 focus:ring-wg-orange outline-none transition-all placeholder:text-slate-800"
            />
            <button
              onClick={handleUrlAdd}
              className="px-4 py-2 bg-wg-orange text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-wg-orange/90 transition-colors"
            >
              Add
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[10px] font-bold uppercase text-red-500/80 tracking-tight"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUploader;
