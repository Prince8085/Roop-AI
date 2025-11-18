
import React, { useState } from 'react';
import { CameraCapture } from '../components/CameraCapture';
import { Button } from '../components/ui/Button';
import { generateTryOn } from '../services/geminiService';
import { Shirt, Wand2, Download, Heart, User, Sparkles, ArrowLeft } from 'lucide-react';
import { GeneratedImage } from '../types';
import toast from 'react-hot-toast';

interface ClothingTryOnProps {
  onSave?: (look: GeneratedImage) => Promise<void> | void;
}

export const ClothingTryOn: React.FC<ClothingTryOnProps> = ({ onSave }) => {
    const [personImage, setPersonImage] = useState<string | null>(null);
    const [clothingImage, setClothingImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'person' | 'cloth'>('person');
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleTryOn = async () => {
        if (!personImage || !clothingImage) return;
        setIsProcessing(true);
        const loadingToast = toast.loading('Weaving digital fabric...');
        try {
            const url = await generateTryOn(personImage, clothingImage);
            setResultImage(url);
            toast.dismiss(loadingToast);
            toast.success('Outfit generated!');
        } catch (e) {
            toast.dismiss(loadingToast);
            toast.error("Try-on failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = async () => {
        if (resultImage && onSave) {
            setIsSaving(true);
            const toastId = toast.loading("Saving to Wardrobe...");
            try {
                await onSave({
                    id: Date.now().toString(),
                    url: resultImage,
                    prompt: "Virtual Try-On",
                    type: 'cloth',
                    timestamp: Date.now()
                });
                toast.success("Saved to Wardrobe", { id: toastId, icon: '🧥' });
            } catch (e) {
                toast.error("Failed to save", { id: toastId });
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleDownload = () => {
        if (resultImage) {
            const link = document.createElement('a');
            link.href = resultImage;
            link.download = `roopai-outfit-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Downloading...');
        }
    };

    return (
        <div className="space-y-6 pb-20">
             <div className="flex items-center justify-between sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 py-2 transition-colors duration-200">
                <div className="flex items-center gap-2">
                    {resultImage && (
                        <button onClick={() => setResultImage(null)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-neutral dark:text-gray-200">
                             <ArrowLeft size={20} />
                        </button>
                    )}
                    <h2 className="text-2xl font-heading font-bold text-neutral dark:text-white">Virtual Wardrobe</h2>
                </div>
            </div>

            {/* Progress Tabs */}
            {!resultImage && (
                <div className="flex p-1.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm transition-colors">
                    <button 
                        className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'person' ? 'bg-primary text-white shadow-md' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        onClick={() => setActiveTab('person')}
                    >
                        <User size={16} /> 1. You
                    </button>
                    <button 
                        className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'cloth' ? 'bg-primary text-white shadow-md' : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        onClick={() => setActiveTab('cloth')}
                        disabled={!personImage}
                    >
                        <Shirt size={16} /> 2. Outfit
                    </button>
                </div>
            )}

            {!resultImage ? (
                <div className="space-y-4">
                    {activeTab === 'person' ? (
                        <div className="animate-fade-in space-y-4">
                             <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30">
                                💡 Tip: Upload a full-body photo for the best fit!
                            </div>
                            <CameraCapture onCapture={setPersonImage} label="Take Body Shot" guide="body" />
                            {personImage && (
                                <div className="mt-4">
                                    <p className="text-sm text-green-600 dark:text-green-400 font-bold mb-3 flex items-center gap-2">
                                        <span className="w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">✓</span> 
                                        Photo ready
                                    </p>
                                    <Button className="w-full h-12 text-lg" onClick={() => setActiveTab('cloth')}>Next: Add Clothes</Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-4">
                            <CameraCapture onCapture={setClothingImage} label="Upload Outfit" guide="cloth" />
                            
                            <Button 
                                className="w-full h-14 text-lg shadow-xl shadow-primary/20 mt-6" 
                                disabled={!personImage || !clothingImage} 
                                isLoading={isProcessing}
                                onClick={handleTryOn}
                                icon={<Wand2 size={20}/>}
                            >
                                {isProcessing ? 'Processing...' : 'Generate Try-On'}
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-fade-in space-y-5">
                    <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[3/4] bg-gray-100 border-4 border-white dark:border-gray-700">
                        <img src={resultImage} alt="Try On Result" className="w-full h-full object-cover" />
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-green-600 shadow-md flex items-center gap-1">
                            <Sparkles size={12} /> AI Generated
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" onClick={() => setResultImage(null)} className="h-12 border-gray-300 dark:border-gray-600">
                            Try Another
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
                            Download Result
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
