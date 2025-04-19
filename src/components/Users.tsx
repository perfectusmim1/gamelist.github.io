import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../store/userStore';
import { User, UserPlus, UserX, Search, Globe, Shield, CheckCircle } from 'lucide-react';

// Container animation for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

// Item animations (for cards and sections)
const itemVariants = {
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

// Mock data for country mappings - in a real app, this would come from the backend
const userCountries: Record<string, string> = {
  'admin': 'US',
  'test': 'TR',
  'user1': 'DE',
  'user2': 'JP',
  'user3': 'BR',
  'demo': 'GB'
};

// Function to render country flag
const CountryFlag = ({ countryCode }: { countryCode: string }) => {
  const flagUrl = `https://flagcdn.com/16x12/${countryCode.toLowerCase()}.png`;
  const countryNames: Record<string, string> = {
    'US': 'United States',
    'TR': 'Turkey',
    'DE': 'Germany',
    'JP': 'Japan',
    'BR': 'Brazil',
    'GB': 'United Kingdom',
    // Add more as needed
  };
  
  return (
    <div className="flex items-center gap-2" title={countryNames[countryCode] || countryCode}>
      <img 
        src={flagUrl} 
        alt={`Flag of ${countryNames[countryCode] || countryCode}`} 
        className="w-4 h-3 rounded-sm"
      />
      <span>{countryNames[countryCode] || countryCode}</span>
    </div>
  );
};

export const Users = () => {
  const { users, currentUser, deleteUser } = useUserStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div
        variants={itemVariants}
        className="p-6 bg-gradient-to-br from-purple-900/10 via-[#1a1925]/60 to-purple-900/10 backdrop-blur-sm rounded-xl border border-white/5 shadow-lg shadow-purple-900/5"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">User Management</h3>
              <p className="text-gray-400 text-sm">Manage your system's users</p>
            </div>
          </div>
          
          <div className="relative w-full md:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:bg-purple-900/10 transition-colors duration-200"
              placeholder="Search users..."
            />
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredUsers.length > 0 ? (
            <AnimatePresence>
              {filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.01, 
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                  onHoverStart={() => setHoveredUserId(user.id)}
                  onHoverEnd={() => setHoveredUserId(null)}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1a1925]/50 to-[#1a1925]/70 backdrop-blur-sm rounded-xl border border-white/5 hover:border-purple-500/20 shadow-sm hover:shadow-md hover:shadow-purple-900/5 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">{user.username}</p>
                        {user.username === 'admin' && (
                          <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400 flex items-center gap-2">
                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        {user.country || userCountries[user.username] ? (
                          <span className="inline-flex items-center bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs">
                            <CountryFlag countryCode={user.country || userCountries[user.username] || 'US'} />
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-gray-500/10 text-gray-400 px-2 py-0.5 rounded text-xs">
                            <Globe className="w-3 h-3 mr-1" />
                            Unknown location
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <motion.button
                    initial={{ opacity: 0.7, scale: 0.9 }}
                    animate={{ 
                      opacity: hoveredUserId === user.id ? 1 : 0.7,
                      scale: hoveredUserId === user.id ? 1 : 0.9
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setUserToDelete(user.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200"
                  >
                    <UserX size={16} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <motion.div 
              variants={itemVariants}
              className="text-center py-12 bg-white/5 rounded-xl border border-white/5"
            >
              <UserX className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No users found</p>
              <p className="text-gray-500 text-sm mt-1">Try a different search term</p>
            </motion.div>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {userToDelete && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-purple-900/50 to-purple-950/90 p-6 rounded-xl border border-purple-500/20 shadow-lg shadow-purple-900/20 backdrop-blur-md max-w-sm w-full"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <UserX className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-xl font-medium text-white">Delete User</h3>
              </div>
              
              <p className="text-gray-300 mb-5 pb-4 border-b border-white/5">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-4">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(107, 114, 128, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2.5 bg-gray-500/10 text-gray-300 rounded-xl border border-white/5 transition-all duration-200 hover:text-white"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(239, 68, 68, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    deleteUser(userToDelete);
                    if (currentUser?.id === userToDelete) {
                      window.location.href = '/login';
                    }
                    setUserToDelete(null);
                  }}
                  className="px-4 py-2.5 bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all duration-200 hover:text-red-300"
                >
                  <span className="flex items-center gap-2">
                    <UserX className="w-4 h-4" />
                    Delete
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};