
import React, { useRef, useState } from 'react';
import { Button } from './ui/Button';
import { Camera, Upload, X, RefreshCcw, Image as ImageIcon } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  label?: string;
  guide?: 'face' | 'body' | 'cloth';
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, label = "Take Photo", guide }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'user',
            aspectRatio: 0.75 // Portrait
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Could not access camera. Please use upload instead.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        // Return full data URL including mime type
        const dataUrl = canvas.toDataURL('image/png', 0.9);
        setPreview(dataUrl);
        onCapture(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        onCapture(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const reset = () => {
    setPreview(null);
    stopCamera();
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="relative aspect-[3/4] w-full bg-gray-50 dark:bg-gray-800 rounded-3xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center group transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:border-primary/40 shadow-inner">
        
        {error && (
           <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-red-500 bg-red-50/90 dark:bg-red-900/90 z-20">
             {error}
           </div>
        )}

        {!isStreaming && !preview && (
          <div className="flex flex-col items-center text-gray-400 dark:text-gray-500 p-6 text-center z-10">
            <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm mb-4 transition-colors">
                {guide === 'cloth' ? <ImageIcon className="w-8 h-8 text-primary" /> : <Camera className="w-8 h-8 text-primary" />}
            </div>
            <h3 className="text-neutral dark:text-gray-200 font-bold mb-1">{label}</h3>
            <p className="text-xs mb-6 text-gray-500 dark:text-gray-400 max-w-[200px]">
                {guide === 'cloth' ? "Upload a clear photo of the outfit" : "Use camera or upload from gallery"}
            </p>
            
            <div className="flex flex-col gap-3 w-full max-w-[200px]">
                {guide !== 'cloth' && (
                    <Button onClick={startCamera} icon={<Camera size={18}/>} className="w-full justify-center">Open Camera</Button>
                )}
                <label className="cursor-pointer w-full">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    <div className="w-full bg-white dark:bg-gray-700 text-neutral dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
                        <Upload size={16} /> {guide === 'cloth' ? "Upload Image" : "From Gallery"}
                    </div>
                </label>
            </div>
          </div>
        )}

        {isStreaming && (
          <div className="relative w-full h-full bg-black">
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover scale-x-[-1]" 
            />
            {/* Face Guide Overlay */}
            {guide === 'face' && (
                <div className="absolute inset-0 pointer-events-none border-4 border-white/30 rounded-[50%] m-12 border-dashed opacity-70">
                    <div className="absolute top-4 left-0 right-0 text-center text-white/80 text-xs font-bold bg-black/20 py-1">Align Face Here</div>
                </div>
            )}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 z-20 px-4">
               <Button variant="secondary" onClick={stopCamera} className="rounded-full w-12 h-12 p-0 flex items-center justify-center bg-white/20 backdrop-blur text-white border-none hover:bg-white/30" title="Cancel">
                  <X size={24} />
               </Button>
               <button 
                 onClick={capturePhoto}
                 className="w-16 h-16 rounded-full border-4 border-white bg-transparent flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
               >
                 <div className="w-12 h-12 bg-white rounded-full shadow-lg" />
               </button>
            </div>
          </div>
        )}

        {preview && (
            <div className="relative w-full h-full group">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                        onClick={reset}
                        className="bg-white text-neutral px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transform hover:scale-105 transition-transform"
                    >
                        <RefreshCcw size={16} /> Retake
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
