import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, CartesianGrid } from 'recharts';
import { useKeyStore } from '../store/keyStore';
import { format, subDays } from 'date-fns';
import { Activity, ArrowUp, ArrowDown, Users, Key as KeyIcon, Shield } from 'lucide-react';

export const Dashboard = () => {
  const { keys, recentActivity } = useKeyStore();
  const activeKeys = keys.filter(k => k.status === 'active').length;
  const expiredKeys = keys.filter(k => k.status === 'expired').length;

  // Container animation for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  // Chart animations
  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: 0.2
      }
    }
  };

  // Generate activity data based on actual keys
  const activityData = Array.from({ length: 7 }).map((_, index) => {
    const date = subDays(new Date(), 6 - index);
    const dateStr = format(date, 'MMM dd');
    const keysCreated = keys.filter(key => 
      format(new Date(key.createdAt), 'MMM dd') === dateStr
    ).length;

    return {
      name: dateStr,
      Keys: keysCreated,
      Checkpoints: Math.max(0, Math.floor(keysCreated * 0.7)),
      Clicks: Math.max(0, Math.floor(keysCreated * 1.5))
    };
  });

  // Generate country data based on keys
  const countryData = Array.from({ length: 4 }).map((_, index) => {
    const date = subDays(new Date(), 6 - (index * 2));
    const dateStr = format(date, 'MMM dd');
    const totalKeys = keys.filter(key => 
      format(new Date(key.createdAt), 'MMM dd') === dateStr
    ).length;

    return {
      name: dateStr,
      USA: Math.floor(totalKeys * 0.4),
      Ukraine: Math.floor(totalKeys * 0.2),
      Vietnam: Math.floor(totalKeys * 0.15),
      Indonesia: Math.floor(totalKeys * 0.15),
      Netherlands: Math.floor(totalKeys * 0.1)
    };
  });

  // Custom tooltip styles for better UI
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-[#1a1925]/90 backdrop-blur-md border border-purple-500/20 rounded-lg shadow-lg">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -3 }}
          className="p-6 bg-gradient-to-br from-purple-900/20 via-[#1a1925]/60 to-purple-900/20 backdrop-blur-sm rounded-xl border border-white/5 shadow-lg shadow-purple-900/5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <KeyIcon className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Total Keys</h3>
              <div className="flex items-center gap-1 text-xs text-green-400">
                <ArrowUp className="w-3 h-3" />
                <span>+12% from last week</span>
              </div>
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-400">{keys.length}</p>
        </motion.div>
        
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -3 }}
          className="p-6 bg-gradient-to-br from-green-900/20 via-[#1a1925]/60 to-green-900/20 backdrop-blur-sm rounded-xl border border-white/5 shadow-lg shadow-green-900/5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Active Keys</h3>
              <div className="flex items-center gap-1 text-xs text-green-400">
                <ArrowUp className="w-3 h-3" />
                <span>+5% from last month</span>
              </div>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-400">{activeKeys}</p>
        </motion.div>
        
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -3 }}
          className="p-6 bg-gradient-to-br from-red-900/20 via-[#1a1925]/60 to-red-900/20 backdrop-blur-sm rounded-xl border border-white/5 shadow-lg shadow-red-900/5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Expired Keys</h3>
              <div className="flex items-center gap-1 text-xs text-red-400">
                <ArrowDown className="w-3 h-3" />
                <span>-3% from last month</span>
              </div>
            </div>
          </div>
          <p className="text-3xl font-bold text-red-400">{expiredKeys}</p>
        </motion.div>
      </div>
      
      {/* Activity Chart */}
      <motion.div
        variants={itemVariants}
        className="p-6 bg-[#1a1925]/50 backdrop-blur-sm rounded-xl border border-white/5"
      >
        <h3 className="text-lg font-medium text-white mb-4">Activity Overview</h3>
        <motion.div
          variants={chartVariants}
          className="h-72 w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="colorKeys" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCheckpoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#4B5563" />
              <YAxis stroke="#4B5563" />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="Keys" 
                stroke="#8B5CF6" 
                fillOpacity={1} 
                fill="url(#colorKeys)" 
                strokeWidth={2}
                animationDuration={1500}
              />
              <Area 
                type="monotone" 
                dataKey="Clicks" 
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorClicks)" 
                strokeWidth={2}
                animationDuration={1500}
                animationBegin={300}
              />
              <Area 
                type="monotone" 
                dataKey="Checkpoints" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorCheckpoints)" 
                strokeWidth={2}
                animationDuration={1500}
                animationBegin={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};