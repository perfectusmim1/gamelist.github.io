import React, { useState, useEffect } from 'react';
// Add type declaration for lucide-react
declare module 'lucide-react';
import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Key, Users as UsersIcon, Activity as ActivityIcon, Settings as SettingsIcon, Layout, LogOut, Code, FileCode } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { KeyGeneration } from './components/KeyGeneration';
import { Dashboard } from './components/Dashboard';
import { Settings as SettingsComponent } from './components/Settings';
import { Users } from './components/Users';
import { Analytics } from './components/Analytics';
import { Auth } from './components/Auth';
import { Script } from './components/Script';
import { Obfuscate } from './components/Obfuscate';
import { useUserStore } from './store/userStore';

interface AnimationConfig {
  duration: number;
  ease: string;
  exit: {
    duration: number;
    ease: string;
  };
}

function App() {
  const [sidebarAlwaysOpen, setSidebarAlwaysOpen] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = React.useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const { isAuthenticated, logoutUser } = useUserStore();

  // Load sidebar setting from localStorage
  useEffect(() => {
    const sidebarSetting = localStorage.getItem('keySystem_sidebarAlwaysOpen');
    setSidebarAlwaysOpen(sidebarSetting === 'true');
    
    // Listen for storage events to update the sidebar when the setting changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'keySystem_sidebarAlwaysOpen') {
        setSidebarAlwaysOpen(e.newValue === 'true');
      }
    };
    
    // Listen for custom event for changes within the same tab
    const handleCustomEvent = (e: CustomEvent<{ sidebarAlwaysOpen: boolean }>) => {
      setSidebarAlwaysOpen(e.detail.sidebarAlwaysOpen);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sidebarSettingChange', handleCustomEvent as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sidebarSettingChange', handleCustomEvent as EventListener);
    };
  }, []);

  // Update isMenuExpanded when sidebarAlwaysOpen changes
  useEffect(() => {
    if (sidebarAlwaysOpen) {
      setIsMenuExpanded(true);
    }
  }, [sidebarAlwaysOpen]);

  // Animation configuration - smoother transitions with better exit animation
  const animationConfig: AnimationConfig = {
    duration: 0.15, // Slightly increased for smoother animation
    ease: "easeOut",
    exit: {
      duration: 0.2, // Slightly reduced for snappier transitions
      ease: "easeInOut"
    }
  };

  const handleLogout = () => {
    logoutUser();
  };

  const handleAuthSuccess = () => {
    // This function will be called when authentication is successful
  };

  if (!isAuthenticated) {
    return <Auth onSuccess={handleAuthSuccess} />;
  }

  // Add this near the nav items or where appropriate
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3, 
        ease: "easeOut",
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { 
        duration: 0.2, 
        ease: "easeInOut" 
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0914] relative overflow-hidden">
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
        initial={false}
        animate={{ width: isMenuExpanded ? 220 : 70 }}
        transition={{ 
          duration: isMenuExpanded ? animationConfig.duration : animationConfig.exit.duration,
          ease: isMenuExpanded ? animationConfig.ease : animationConfig.exit.ease
        }}
        onMouseEnter={() => !sidebarAlwaysOpen && setIsMenuExpanded(true)}
        onMouseLeave={() => !sidebarAlwaysOpen && setIsMenuExpanded(false)}
        className="fixed left-4 top-4 h-[calc(100vh-32px)] bg-gradient-to-b from-purple-900/10 via-[#12111a]/80 to-purple-900/10 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.3)] z-50"
      >
        <div className="p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: animationConfig.duration }}
            className="flex items-center gap-3 mb-8 pl-3"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.3 }} // Faster rotation
            >
              <Shield className="w-8 h-8 text-purple-400" />
            </motion.div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: isMenuExpanded ? 1 : 0 }}
              transition={{ duration: animationConfig.duration }}
              className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent whitespace-nowrap"
            >
              KeySystem
            </motion.span>
          </motion.div>
          
          <nav className="space-y-2">
            <NavItem 
              icon={Layout} 
              text="Dashboard" 
              active={activeSection === 'dashboard'}
              onClick={() => setActiveSection('dashboard')}
              isMenuExpanded={isMenuExpanded}
              animationConfig={animationConfig}
            />
            <NavItem 
              icon={Key} 
              text="Keys" 
              active={activeSection === 'keys'}
              onClick={() => setActiveSection('keys')}
              isMenuExpanded={isMenuExpanded}
              animationConfig={animationConfig}
            />
            <NavItem 
              icon={UsersIcon} 
              text="Users" 
              active={activeSection === 'users'}
              onClick={() => setActiveSection('users')}
              isMenuExpanded={isMenuExpanded}
              animationConfig={animationConfig}
            />
            <NavItem 
              icon={ActivityIcon} 
              text="Analytics" 
              active={activeSection === 'analytics'}
              onClick={() => setActiveSection('analytics')}
              isMenuExpanded={isMenuExpanded}
              animationConfig={animationConfig}
            />
            <NavItem 
              icon={Code} 
              text="Scripts" 
              active={activeSection === 'scripts'}
              onClick={() => setActiveSection('scripts')}
              isMenuExpanded={isMenuExpanded}
              animationConfig={animationConfig}
            />
            <NavItem 
              icon={FileCode} 
              text="Obfuscator" 
              active={activeSection === 'obfuscator'}
              onClick={() => setActiveSection('obfuscator')}
              isMenuExpanded={isMenuExpanded}
              animationConfig={animationConfig}
            />
            <NavItem 
              icon={SettingsIcon} 
              text="Settings" 
              active={activeSection === 'settings'}
              onClick={() => setActiveSection('settings')}
              isMenuExpanded={isMenuExpanded}
              animationConfig={animationConfig}
            />
          </nav>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="absolute bottom-4 left-4 right-4 flex items-center gap-3 p-3 text-gray-400 hover:text-white rounded-lg transition-all duration-300"
        >
          <div className="flex items-center justify-start pl-1">
            <LogOut className="w-5 h-5" />
          </div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: isMenuExpanded ? 1 : 0 }}
            transition={{ duration: animationConfig.duration }}
            className="whitespace-nowrap"
          >
            Logout
          </motion.span>
        </motion.button>
      </motion.div>

      <main 
        className={`flex-1 ${isMenuExpanded ? 'ml-[232px]' : 'ml-[82px]'} p-8 pt-4 transition-all duration-300 ease-out rounded-xl`}
        style={{ 
          height: 'calc(100vh - 32px)', 
          overflowY: 'auto',
          position: 'relative',
          overflowX: 'hidden'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={pageVariants}
            className="section-wrapper w-full"
          >
            {/* Dashboard Tab - Always render but toggle visibility */}
            <div className="section-tab" style={{ 
              display: activeSection === 'dashboard' ? 'block' : 'none',
              width: '100%',
              height: 'auto',
            }}>
              <div className="mb-8">
                <h1 className="text-3xl font-semibold text-white mb-1">
                  Dashboard
                </h1>
                <p className="text-gray-400">Overview of your key system</p>
              </div>
              <Dashboard />
            </div>

            {/* Keys Tab - Always render but toggle visibility */}
            <div className="section-tab" style={{ 
              display: activeSection === 'keys' ? 'block' : 'none',
              width: '100%',
              height: 'auto',
            }}>
              <div className="mb-8">
                <h1 className="text-3xl font-semibold text-white mb-1">
                  Key Management
                </h1>
                <p className="text-gray-400">Generate and manage your keys</p>
              </div>
              <KeyGeneration />
            </div>

            {/* Settings Tab - Always render but toggle visibility */}
            <div className="section-tab" style={{ 
              display: activeSection === 'settings' ? 'block' : 'none',
              width: '100%',
              height: 'auto',
            }}>
              <div className="mb-8">
                <h1 className="text-3xl font-semibold text-white mb-1">
                  Settings
                </h1>
                <p className="text-gray-400">Customize your experience</p>
              </div>
              <SettingsComponent />
            </div>

            {/* Users Tab - Always render but toggle visibility */}
            <div className="section-tab" style={{ 
              display: activeSection === 'users' ? 'block' : 'none',
              width: '100%',
              height: 'auto',
            }}>
              <div className="mb-8">
                <h1 className="text-3xl font-semibold text-white mb-1">
                  User Management
                </h1>
                <p className="text-gray-400">Manage your system users</p>
              </div>
              <Users />
            </div>

            {/* Analytics Tab - Always render but toggle visibility */}
            <div className="section-tab" style={{ 
              display: activeSection === 'analytics' ? 'block' : 'none',
              width: '100%',
              height: 'auto',
            }}>
              <div className="mb-8">
                <h1 className="text-3xl font-semibold text-white mb-1">
                  Analytics
                </h1>
                <p className="text-gray-400">View system analytics and statistics</p>
              </div>
              <Analytics />
            </div>

            {/* Scripts Tab - Always render but toggle visibility */}
            <div className="section-tab" style={{ 
              display: activeSection === 'scripts' ? 'block' : 'none',
              width: '100%',
              height: 'auto',
            }}>
              <div className="mb-8">
                <h1 className="text-3xl font-semibold text-white mb-1">
                  Scripts
                </h1>
                <p className="text-gray-400">Browse and search for scripts</p>
              </div>
              <Script />
            </div>

            {/* Obfuscator Tab - Always render but toggle visibility */}
            <div className="section-tab" style={{ 
              display: activeSection === 'obfuscator' ? 'block' : 'none',
              width: '100%',
              height: 'auto',
            }}>
              <div className="mb-8">
                <h1 className="text-3xl font-semibold text-white mb-1">
                  Lua Obfuscator
                </h1>
                <p className="text-gray-400">Obfuscate your Lua scripts</p>
              </div>
              <Obfuscate />
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

interface NavItemProps {
  icon: LucideIcon;
  text: string;
  active?: boolean;
  onClick: () => void;
  isMenuExpanded: boolean;
  animationConfig: AnimationConfig;
}

const NavItem = ({ icon: Icon, text, active = false, onClick, isMenuExpanded, animationConfig }: NavItemProps) => {
  return (
    <motion.button
      onClick={onClick}
      className={`
        relative w-full flex items-center gap-3 p-3 rounded-lg text-gray-400
        focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50
        ${active 
          ? 'text-white bg-purple-500/20 shadow-md shadow-purple-500/10' 
          : 'hover:text-white hover:bg-white/5'
        }
        transition-all duration-200
      `}
      whileHover={{ 
        scale: 1.02, 
        transition: { 
          type: "spring", 
          stiffness: 400, 
          damping: 10, 
          duration: 0,
          delay: 0
        } 
      }}
      whileTap={{ scale: 0.98 }}
    >
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <div className={`flex items-center justify-center ${active ? 'text-purple-400' : ''}`}>
        <Icon 
          size={active ? 18 : 16} 
          className={`transition-all duration-200 ${active ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} 
        />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: isMenuExpanded ? 1 : 0 }}
        transition={{ duration: animationConfig.duration }}
        className="whitespace-nowrap font-medium text-sm"
      >
        {text}
      </motion.span>
    </motion.button>
  );
};

export default App;