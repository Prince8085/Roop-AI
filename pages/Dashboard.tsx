
import React from 'react';
import { AppRoute } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Sparkles, ArrowRight, TrendingUp, Scissors, Shirt } from 'lucide-react';

interface DashboardProps {
  onNavigate: (route: AppRoute) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-primary text-white p-6 shadow-xl shadow-primary/20">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/30 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-secondary/30 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium mb-4 border border-white/10">
            <Sparkles size={12} className="text-yellow-300" />
            <span>New: AI Hairstyle Studio</span>
          </div>
          <h2 className="text-2xl font-heading font-bold mb-2 leading-tight">
            Your Personal AI Stylist is Here
          </h2>
          <p className="text-primary-100 text-sm mb-6 max-w-[80%]">
            Try on clothes and hairstyles instantly before you buy. Save money, look great.
          </p>
          <div className="flex gap-3">
            <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => onNavigate(AppRoute.TRY_CLOTHES)}
                icon={<Shirt size={16}/>}
            >
                Try Clothes
            </Button>
            <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10 hover:text-white dark:text-white dark:hover:bg-white/10"
                size="sm" 
                onClick={() => onNavigate(AppRoute.TRY_HAIR)}
                icon={<Scissors size={16}/>}
            >
                Try Hair
            </Button>
          </div>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-900/30 transition-colors">
           <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-2">
                <TrendingUp size={20} />
              </div>
              <span className="text-2xl font-bold text-neutral dark:text-white">₹2,450</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Saved on returns</span>
           </div>
        </Card>
        <Card className="bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-900/30 transition-colors">
           <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2">
                <Sparkles size={20} />
              </div>
              <span className="text-2xl font-bold text-neutral dark:text-white">14</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Styles generated</span>
           </div>
        </Card>
      </div>

      {/* Feature Carousel */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading font-semibold text-lg text-neutral dark:text-white">Quick Actions</h3>
        </div>
        <div className="grid gap-4">
            <Card className="group cursor-pointer active:scale-[0.99] transition-transform dark:bg-gray-800 dark:border-gray-700" onClick={() => onNavigate(AppRoute.TRY_HAIR)}>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-400 to-secondary flex items-center justify-center text-white shadow-md">
                        <Scissors size={28} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-neutral dark:text-white">Hairstyle Studio</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Analyze face shape & find cuts</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                        <ArrowRight size={16} />
                    </div>
                </div>
            </Card>

            <Card className="group cursor-pointer active:scale-[0.99] transition-transform dark:bg-gray-800 dark:border-gray-700" onClick={() => onNavigate(AppRoute.TRY_CLOTHES)}>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-400 to-primary flex items-center justify-center text-white shadow-md">
                        <Shirt size={28} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-neutral dark:text-white">Virtual Wardrobe</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Upload outfit & try it on</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                        <ArrowRight size={16} />
                    </div>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};
