
import React, { useState } from 'react';
import { CameraCapture } from '../components/CameraCapture';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { analyzeFace, generateStylePreview } from '../services/geminiService';
import { AnalysisResponse, HairstyleRecommendation, GeneratedImage } from '../types';
import { Sparkles, Scissors, Heart, Download, ArrowLeft, Info, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface HairstyleStudioProps {
    onSave?: (look: GeneratedImage) => Promise<void> | void;
}

export const HairstyleStudio: React.FC<HairstyleStudioProps> = ({ onSave }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<HairstyleRecommendation | null>(null);
  
  // Before/After Slider State
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleCapture = (dataUrl: string) => {
    setUserImage(dataUrl);
  };

  const handleAnalyze = async () => {
    if (!userImage) return;
    setIsAnalyzing(true);
    const loadingToast = toast.loading('Scanning face features...');
    try {
      const result = await analyzeFace(userImage);
      setAnalysis(result);
      setStep(2);
      toast.dismiss(loadingToast);
      toast.success('Face analyzed successfully!');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Analysis failed. Please try a clearer photo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async (style: HairstyleRecommendation) => {
    if (!userImage) return;
    setSelectedStyle(style);
    setIsGenerating(true);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const loadingToast = toast.loading('Styling your hair...');
    try {
        const prompt = `${style.style_name} hairstyle. ${style.description}. High quality, photorealistic, indian aesthetics.`;
        const imgUrl = await generateStylePreview(userImage, prompt);
        setGeneratedImage(imgUrl);
        setStep(3);
        setSliderPosition(50);
        toast.dismiss(loadingToast);
        toast.success('Look generated!');
    } catch (e) {
        toast.dismiss(loadingToast);
        toast.error("Failed to generate style. Try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSave = async () => {
      if (generatedImage && selectedStyle && onSave) {
          setIsSaving(true);
          const toastId = toast.loading("Saving to cloud gallery...");
          try {
              await onSave({
                  id: Date.now().toString(),
                  url: generatedImage,
                  prompt: selectedStyle.style_name,
                  type: 'hair',
                  timestamp: Date.now()
              });
              toast.success("Saved to My Looks", { id: toastId, icon: '✨' });
          } catch (e) {
              toast.error("Save failed", { id: toastId });
          } finally {
              setIsSaving(false);
          }
      }
  };

  const handleDownload = () => {
    if (generatedImage) {
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `roopai-hair-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Downloading...');
    }
  };

  const copyInstructions = () => {
      if(selectedStyle) {
          navigator.clipboard.writeText(`I want a ${selectedStyle.style_name}. ${selectedStyle.description}`);
          toast.success('Instructions copied for your barber!');
      }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur py-3 border-b border-gray-200 dark:border-gray-800 -mx-4 px-4 transition-colors duration-200">
        {step > 1 ? (
            <button onClick={() => setStep(step - 1 as any)} className="p-2 -ml-2 text-neutral dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
                <ArrowLeft size={20} />
            </button>
        ) : (
            <div className="w-9"></div> // Spacer
        )}
        <h2 className="text-lg font-heading font-bold text-neutral dark:text-white">
            {step === 1 ? 'Face Scan' : step === 2 ? 'Select Style' : 'Result'}
        </h2>
        <div className="text-xs font-mono bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">
            {step}/3
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
            <Card className="bg-blue-50 border-blue-100 shadow-none dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-200">
                <div className="flex gap-3 text-blue-800 dark:text-blue-300 text-sm">
                    <Info className="shrink-0 mt-0.5" size={18} />
                    <p>For best results, remove glasses and pull hair back slightly. Ensure good lighting.</p>
                </div>
            </Card>
            
            <CameraCapture onCapture={handleCapture} guide="face" label="Take Selfie" />
            
            {userImage && (
                <Button 
                    onClick={handleAnalyze} 
                    isLoading={isAnalyzing} 
                    className="w-full h-12 text-lg shadow-xl shadow-primary/20"
                    icon={<Sparkles size={20} />}
                >
                    {isAnalyzing ? "Analyzing..." : "Analyze Face Shape"}
                </Button>
            )}
        </div>
      )}

      {step === 2 && analysis && (
        <div className="space-y-6 animate-fade-in">
            {/* Face Analysis Card */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 overflow-hidden transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-bl-full -mr-4 -mt-4"></div>
                <div className="relative z-10">
                    <h3 className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide font-bold mb-1">Analysis Complete</h3>
                    <div className="flex items-end gap-2 mb-4">
                        <span className="text-3xl font-bold text-primary capitalize">{analysis.face_analysis.face_shape}</span>
                        <span className="text-lg font-medium text-neutral dark:text-white pb-1">Face Shape</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 capitalize">
                            {analysis.face_analysis.skin_undertone} Skin
                        </span>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 capitalize">
                            {analysis.face_analysis.hair_type} Hair
                        </span>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="font-heading font-semibold mb-4 flex items-center gap-2 px-1 text-neutral dark:text-white">
                    <Scissors size={18} className="text-primary" />
                    Recommended for You
                </h3>
                <div className="grid gap-4">
                    {analysis.recommended_styles.map((style, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-neutral dark:text-white text-lg">{style.style_name}</h4>
                                    <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded font-bold ${
                                        style.maintenance_level === 'low' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 
                                        style.maintenance_level === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                    }`}>
                                        {style.maintenance_level} Maint
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{style.description}</p>
                                <div className="flex gap-2 text-xs text-gray-400 mb-4">
                                    <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                        Difficulty: {style.salon_difficulty}
                                    </span>
                                </div>
                                <Button 
                                    size="sm" 
                                    className="w-full"
                                    onClick={() => handleGenerate(style)}
                                    disabled={isGenerating}
                                    isLoading={isGenerating && selectedStyle?.style_name === style.style_name}
                                >
                                    Generate Preview
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {step === 3 && generatedImage && selectedStyle && userImage && (
        <div className="space-y-5 animate-fade-in">
            {/* Before / After Slider */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700 bg-gray-100 dark:bg-gray-800 aspect-[3/4] select-none">
                <img 
                    src={generatedImage} 
                    alt="After" 
                    className="absolute top-0 left-0 w-full h-full object-cover"
                />
                <div 
                    className="absolute top-0 left-0 w-full h-full overflow-hidden border-r-2 border-white"
                    style={{ width: `${sliderPosition}%` }}
                >
                    {/* Standard image tag since userImage is now a full Data URL */}
                    <img 
                        src={userImage} 
                        alt="Before" 
                        className="absolute top-0 left-0 max-w-none h-full object-cover aspect-[3/4]"
                        style={{ width: `calc(100vw - 32px - 8px)` }} // rough calc to match container width
                    />
                </div>
                
                {/* Slider Handle */}
                <div 
                    className="absolute top-0 bottom-0 w-8 -ml-4 cursor-ew-resize flex items-center justify-center z-20"
                    style={{ left: `${sliderPosition}%` }}
                    onTouchMove={(e) => {
                        const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                        if(rect) {
                            const x = e.touches[0].clientX - rect.left;
                            setSliderPosition(Math.min(100, Math.max(0, (x / rect.width) * 100)));
                        }
                    }}
                >
                    <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-primary">
                        <div className="flex gap-0.5">
                             <div className="w-0.5 h-3 bg-primary/50"></div>
                             <div className="w-0.5 h-3 bg-primary/50"></div>
                        </div>
                    </div>
                </div>

                {/* Labels */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-2 py-1 rounded text-white text-xs font-bold pointer-events-none">Original</div>
                <div className="absolute top-4 right-4 bg-primary/80 backdrop-blur px-2 py-1 rounded text-white text-xs font-bold pointer-events-none">RoopAI Result</div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-20 text-white pointer-events-none">
                    <h3 className="font-bold text-2xl mb-1">{selectedStyle.style_name}</h3>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="h-12 border-gray-300 dark:border-gray-600">
                    Back
                </Button>
                <Button 
                    className="h-12 bg-primary hover:bg-primary/90"
                    onClick={handleSave}
                    disabled={isSaving}
                    isLoading={isSaving}
                    icon={<Heart size={18} fill="currentColor" />}
                >
                    Save
                </Button>
                <Button 
                    variant="secondary"
                    className="col-span-2 h-12"
                    onClick={handleDownload}
                    icon={<Download size={18} />}
                >
                    Download High-Res
                </Button>
            </div>

            {/* Instructions Box */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 cursor-pointer active:scale-95 transition-transform" onClick={copyInstructions}>
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                        <Scissors size={14} />
                        Salon Instructions
                    </h4>
                    <Copy size={14} className="text-purple-400" />
                </div>
                <p className="text-xs text-purple-800 dark:text-purple-200 leading-relaxed">
                    "{selectedStyle.description}"
                </p>
                <div className="mt-2 text-[10px] text-purple-500 dark:text-purple-400 font-medium uppercase tracking-wide">Tap to copy for your barber</div>
            </div>
        </div>
      )}
    </div>
  );
};
