import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, RefreshCw, Save, Zap, LogIn, Layout } from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';
import * as Tabs from '@radix-ui/react-tabs';
import { useUserStore } from '../store/userStore';

// Projenize @radix-ui/react-tabs modülünü kurun:
// npm install @radix-ui/react-tabs

export const Settings = () => {
  const { currentUser } = useUserStore();
  const [activeTab, setActiveTab] = useState('appearance');
  const [notifications, setNotifications] = useState(localStorage.getItem('keySystem_notifications') !== 'false');
  const [sidebarAlwaysOpen, setSidebarAlwaysOpen] = useState(localStorage.getItem('keySystem_sidebarAlwaysOpen') === 'true');
  const [autoLogin, setAutoLogin] = useState(localStorage.getItem('auth_username') !== null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('keySystem_settings');
    
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setNotifications(settings.notifications !== undefined ? settings.notifications : true);
      setSidebarAlwaysOpen(settings.sidebarAlwaysOpen !== undefined ? settings.sidebarAlwaysOpen : false);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    const settings = {
      notifications,
      sidebarAlwaysOpen
    };
    
    localStorage.setItem('keySystem_settings', JSON.stringify(settings));
    localStorage.setItem('keySystem_sidebarAlwaysOpen', sidebarAlwaysOpen ? 'true' : 'false');
  }, [notifications, sidebarAlwaysOpen]);

  const handleSaveSettings = () => {
    // Save settings to localStorage
    const settings = {
      notifications,
      sidebarAlwaysOpen
    };
    
    localStorage.setItem('keySystem_settings', JSON.stringify(settings));
    localStorage.setItem('keySystem_sidebarAlwaysOpen', sidebarAlwaysOpen ? 'true' : 'false');
    
    // Dispatch custom event for sidebar setting change
    window.dispatchEvent(new CustomEvent('sidebarSettingChange', { 
      detail: { sidebarAlwaysOpen } 
    }));
    
    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex space-x-2 mb-6 border-b border-white/10 pb-2">
          <Tabs.Trigger 
            value="appearance" 
            className={`px-4 py-2 rounded-t-lg transition-all duration-200 ${activeTab === 'appearance' ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
          >
            Appearance
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="appearance">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 bg-[#1a1925]/50 backdrop-blur-sm rounded-xl border border-white/5"
          >
            <h3 className="text-lg font-medium text-white mb-4">User Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Username</p>
                  <p className="text-sm text-gray-400">Your current username</p>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                  <p className="text-white">{currentUser ? currentUser.username : 'Not logged in'}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Notifications</p>
                  <p className="text-sm text-gray-400">Enable desktop notifications</p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                  <Bell className="text-gray-400 w-4 h-4" />
                  <Switch.Root
                    checked={notifications}
                    onCheckedChange={setNotifications}
                    className="w-[42px] h-[25px] bg-white/10 rounded-full relative data-[state=checked]:bg-purple-600 outline-none cursor-default"
                  >
                    <Switch.Thumb className="block w-[19px] h-[19px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
                  </Switch.Root>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Sidebar</p>
                  <p className="text-sm text-gray-400">Keep sidebar always expanded</p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                  <Layout className="text-gray-400 w-4 h-4" />
                  <Switch.Root
                    checked={sidebarAlwaysOpen}
                    onCheckedChange={setSidebarAlwaysOpen}
                    className="w-[42px] h-[25px] bg-white/10 rounded-full relative data-[state=checked]:bg-purple-600 outline-none cursor-default"
                  >
                    <Switch.Thumb className="block w-[19px] h-[19px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
                  </Switch.Root>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Auto Login</p>
                  <p className="text-sm text-gray-400">Remember your login credentials</p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                  <LogIn className="text-gray-400 w-4 h-4" />
                  <Switch.Root
                    checked={autoLogin}
                    onCheckedChange={(checked: boolean) => {
                      setAutoLogin(checked);
                      if (!checked) {
                        localStorage.removeItem('auth_username');
                        localStorage.removeItem('auth_password');
                      }
                    }}
                    className="w-[42px] h-[25px] bg-white/10 rounded-full relative data-[state=checked]:bg-purple-600 outline-none cursor-default"
                  >
                    <Switch.Thumb className="block w-[19px] h-[19px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
                  </Switch.Root>
                </div>
              </div>
              
              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(139, 92, 246, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveSettings}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/20 transition-all duration-200"
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </motion.button>
              </div>
            </div>
            
            <AnimatePresence>
              {showSuccessMessage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-3 bg-green-500/20 border border-green-500/30 text-green-400 rounded-md flex items-center gap-2"
                >
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  Settings saved successfully!
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};
