
import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, ArrowRight, Sparkles, WifiOff } from 'lucide-react';

interface AuthPageProps {
    onGuestLogin: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onGuestLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            if (isLogin) {
                // Login Logic
                await signInWithEmailAndPassword(auth, email, password);
                toast.success(`Welcome back!`);
            } else {
                // Signup Logic
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                toast.success(`Account created! Welcome, ${name}`);
            }
        } catch (error: any) {
            console.error(error);
            let msg = "Authentication failed";
            if (error.code === 'auth/invalid-credential') msg = "Invalid email or password";
            if (error.code === 'auth/email-already-in-use') msg = "Email already in use";
            if (error.code === 'auth/weak-password') msg = "Password should be at least 6 chars";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGuest = async () => {
        setLoading(true);
        try {
            await signInAnonymously(auth);
            toast.success("Logged in as Guest");
        } catch (error: any) {
            // If admin restricted, App.tsx handles the fallback, 
            // but here we explicitly trigger the callback for UI state
            if (error.code === 'auth/admin-restricted-operation') {
                onGuestLogin(); 
            } else {
                toast.error("Could not start guest session");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden transition-colors">
                {/* Header */}
                <div className="bg-primary p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary to-accent opacity-50"></div>
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <h1 className="text-3xl font-heading font-bold text-white mb-2">RoopAI</h1>
                        <p className="text-primary-100 text-sm">Your Personal AI Stylist</p>
                    </div>
                </div>

                {/* Form */}
                <div className="p-8">
                    <h2 className="text-xl font-bold text-neutral dark:text-white mb-6 text-center">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {!isLogin && (
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Full Name"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-neutral dark:text-white placeholder-gray-400"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={!isLogin}
                                />
                            </div>
                        )}
                        
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input 
                                type="email" 
                                placeholder="Email Address"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-neutral dark:text-white placeholder-gray-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input 
                                type="password" 
                                placeholder="Password"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-neutral dark:text-white placeholder-gray-400"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full h-12 text-lg shadow-lg shadow-primary/25 mt-2"
                            isLoading={loading}
                            icon={isLogin ? <ArrowRight size={20}/> : <Sparkles size={20}/>}
                        >
                            {isLogin ? 'Sign In' : 'Create Account'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                            <button 
                                onClick={() => setIsLogin(!isLogin)} 
                                className="text-primary font-bold ml-1 hover:underline"
                            >
                                {isLogin ? 'Sign Up' : 'Log In'}
                            </button>
                        </p>
                    </div>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-gray-800 px-2 text-gray-400 font-medium transition-colors">Or continue with</span>
                        </div>
                    </div>

                    <Button 
                        variant="ghost" 
                        className="w-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                        onClick={handleGuest}
                        isLoading={loading}
                        icon={<WifiOff size={18} />}
                    >
                        Continue as Guest (Offline)
                    </Button>
                    
                    {/* Test Credentials Hint */}
                    <div className="mt-8 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs text-gray-500 dark:text-gray-400 text-center border border-gray-200 dark:border-gray-600">
                        <span className="font-bold block mb-1">Test Credentials:</span>
                        User: kachhwahaprince@gmail.com <br/>
                        Pass: 1234567
                    </div>
                </div>
            </div>
        </div>
    );
};
