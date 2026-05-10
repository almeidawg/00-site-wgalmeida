import React, { useRef, useEffect, useState } from 'react';
import { motion } from '@/lib/motion-lite';
import { Pipette, X, MousePointer2 } from 'lucide-react';

const ColorEyedropper = ({ imageUrl, onColorPick, onClose }) => {
  const canvasRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [previewColor, setPreviewColor] = useState('#000000');
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const img = new Image();
    
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    
    img.onload = () => {
      // Ajusta o canvas para manter a proporção da imagem
      const maxWidth = 400;
      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }, [imageUrl]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCursorPos({ x: e.clientX, y: e.clientY });

    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
    
    setPreviewColor(hex);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pipette className="w-3.5 h-3.5 text-wg-orange" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Extrator de Cores</span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white">
          <X size={14} />
        </button>
      </div>

      <div className="relative group cursor-crosshair overflow-hidden rounded-xl border border-white/10 bg-black/40">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={() => onColorPick(previewColor)}
          className="w-full h-auto block"
        />
        
        {isHovering && (
          <div 
            className="fixed pointer-events-none z-[100] flex flex-col items-center gap-2"
            style={{ left: cursorPos.x + 20, top: cursorPos.y - 40 }}
          >
            <div 
              className="w-10 h-10 rounded-full border-2 border-white shadow-2xl"
              style={{ backgroundColor: previewColor }}
            />
            <span className="px-2 py-1 bg-black/80 text-[9px] font-mono text-white rounded-md border border-white/20">
              {previewColor}
            </span>
          </div>
        )}
      </div>

      <p className="text-[9px] text-slate-500 italic text-center uppercase tracking-tight">
        Clique na imagem para capturar a cor para sua paleta
      </p>
    </div>
  );
};

export default ColorEyedropper;
