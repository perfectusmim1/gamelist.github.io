import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useUserStore } from '../store/userStore';

interface AuthProps {
  onSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { registerUser, loginUser } = useUserStore();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  // Check for saved credentials on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('auth_username');
    const savedPassword = localStorage.getItem('auth_password');
    const rememberSession = localStorage.getItem('auth_remember') === 'true';
    
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
      
      if (savedPassword) {
        setPassword(savedPassword);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!username || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    // Simulate network delay for better user feedback
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (isLogin) {
      const result = loginUser(username, password);
      if (result.success) {
        // Save credentials if remember me is checked
        if (rememberMe) {
          localStorage.setItem('auth_username', username);
          localStorage.setItem('auth_password', password);
          localStorage.setItem('auth_remember', 'true');
        } else {
          localStorage.removeItem('auth_username');
          localStorage.removeItem('auth_password');
          localStorage.removeItem('auth_remember');
        }
        
        setNotificationMessage('Login successful!');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        onSuccess();
      } else {
        setError(result.message);
        setIsLoading(false);
      }
    } else {
      const result = registerUser(username, password);
      if (result.success) {
        // Show auto-login confirmation notification
        setNotificationMessage('Registration successful! Auto-login enabled.');
        setShowNotification(true);
        
        // Always save credentials for new registrations to enable auto-login
        localStorage.setItem('auth_username', username);
        localStorage.setItem('auth_password', password);
        localStorage.setItem('auth_remember', 'true');
        setRememberMe(true);
        
        setTimeout(() => setShowNotification(false), 5000);
        onSuccess();
      } else {
        setError(result.message);
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0914] relative overflow-hidden">
      {/* Animated background with subtle hue shifts */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a1a] via-[#120d23] to-[#0d0719] animate-gradient-slow"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-900/20 rounded-full filter blur-3xl animate-blob"></div>
          <div className="absolute top-60 -right-20 w-80 h-80 bg-indigo-900/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-40 left-20 w-80 h-80 bg-violet-900/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>
    
      <motion.div 
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
        className="w-full max-w-md p-8 bg-gradient-to-b from-[#1a1925]/70 to-[#1a1925]/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl"
      >
        <div className="flex justify-center mb-8">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="bg-purple-500/10 p-4 rounded-2xl"
          >
            <Shield className="w-16 h-16 text-purple-400" />
          </motion.div>
        </div>
        
        <motion.h2 
          variants={inputVariants}
          className="text-2xl font-bold text-center text-white mb-8 relative"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
            {isLogin ? 'Login to KeySystem' : 'Create an Account'}
          </span>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full"></div>
        </motion.h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div variants={inputVariants}>
            <label className="block text-sm text-gray-300 mb-2 font-medium">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-purple-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:bg-purple-900/10 transition-colors duration-200"
                placeholder="Enter your username"
              />
            </div>
          </motion.div>
          
          <motion.div variants={inputVariants}>
            <label className="block text-sm text-gray-300 mb-2 font-medium">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-purple-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:bg-purple-900/10 transition-colors duration-200"
                placeholder="Enter your password"
              />
            </div>
          </motion.div>
          
          <motion.div 
            variants={inputVariants}
            className="flex items-center"
          >
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only"
              />
              <div 
                className={`w-5 h-5 rounded-md border ${rememberMe ? 'bg-purple-500/70 border-purple-500' : 'bg-white/5 border-white/10'} mr-2 flex items-center justify-center transition-all duration-200`}
                onClick={() => setRememberMe(!rememberMe)}
              >
                {rememberMe && (
                  <motion.svg 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    width="12" 
                    height="12" 
                    viewBox="0 0 12 12" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M10 3L4.5 8.5L2 6" 
                      stroke="white" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                )}
              </div>
              <label 
                htmlFor="remember-me" 
                onClick={() => setRememberMe(!rememberMe)}
                className="text-sm text-gray-300 cursor-pointer hover:text-white transition-colors duration-200"
              >
                Remember me
              </label>
            </div>
          </motion.div>
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button
            variants={inputVariants}
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(139, 92, 246, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 text-white rounded-xl border border-purple-500/20 transition-all duration-200 font-medium relative overflow-hidden"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              isLogin ? 'Login' : 'Register'
            )}
          </motion.button>
        </form>
        
        <motion.div 
          variants={inputVariants}
          className="mt-8 text-center"
        >
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 hover:text-purple-300 text-sm transition-colors duration-200 focus:outline-none focus-visible:underline"
          >
            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </motion.div>
      </motion.div>
      
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ 
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 px-5 py-4 bg-green-500/20 text-green-400 rounded-xl border border-green-500/20 shadow-lg shadow-green-500/10 backdrop-blur-md flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};