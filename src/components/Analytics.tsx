import { useState, useCallback } from 'react';
import { motion, useMotionValue, animate, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, CartesianGrid } from 'recharts';
import { useKeyStore } from '../store/keyStore';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';
import { Activity, BarChart3, PieChartIcon, Users, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Globe, Shield, Database, Key } from 'lucide-react';

// Define key interface
interface Key {
  id: string;
  createdAt: string;
  status: 'active' | 'expired' | 'pending';
  username?: string;
}

// Animation variants
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

const cardVariants = {
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

const chartVariants = {
  hidden: { opacity: 0, scale: 0.98 },
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

// Enhanced tooltip component with better styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1925]/90 backdrop-blur-md border border-purple-500/20 rounded-lg shadow-lg p-3">
        <p className="text-white font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="text-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}:
            </span>
            <span className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const Analytics = () => {
  const { keys, recentActivity } = useKeyStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedChart, setSelectedChart] = useState<'area' | 'bar' | 'line'>('area');
  
  // Calculate stats
  const totalKeys = keys.length;
  const activeKeys = keys.filter(k => k.status === 'active').length;
  const expiredKeys = keys.filter(k => k.status === 'expired').length;
  const keysLastWeek = keys.filter(k => 
    differenceInDays(new Date(), new Date(k.createdAt)) <= 7
  ).length;
  const keysLastMonth = keys.filter(k => 
    differenceInDays(new Date(), new Date(k.createdAt)) <= 30
  ).length;
  
  const growthRate = keys.length > 0 
    ? Math.round((keysLastWeek / totalKeys) * 100) 
    : 0;
  
  // Generate activity data based on actual keys
  const activityData = Array.from({ length: timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 12 }).map((_, index) => {
    const date = timeRange === 'year' 
      ? new Date(new Date().getFullYear(), index, 1)
      : subDays(new Date(), (timeRange === 'week' ? 6 : 29) - index);
    
    const dateStr = timeRange === 'year'
      ? format(date, 'MMM')
      : format(date, 'MMM dd');
    
    const keysCreated = keys.filter(key => 
      timeRange === 'year'
        ? new Date(key.createdAt).getMonth() === index
        : format(new Date(key.createdAt), 'MMM dd') === dateStr
    ).length;

    return {
      name: dateStr,
      Keys: keysCreated,
      Activations: Math.max(0, Math.floor(keysCreated * 0.8)),
      Checkpoints: Math.max(0, Math.floor(keysCreated * 0.7)),
      Revenue: Math.round(keysCreated * 5.99)
    };
  });

  // Generate platform data
  const platformData = [
    { name: 'Windows', value: 65 },
    { name: 'macOS', value: 20 },
    { name: 'Linux', value: 15 }
  ];

  // Generate country data with colors
  const countryData = [
    { name: 'United States', value: 35, color: '#8B5CF6' },
    { name: 'Germany', value: 20, color: '#EC4899' },
    { name: 'United Kingdom', value: 18, color: '#10B981' },
    { name: 'Canada', value: 15, color: '#F59E0B' },
    { name: 'Other', value: 12, color: '#6B7280' },
  ];

  // Chart colors for consistent styling
  const chartColors = {
    Keys: '#8B5CF6',
    Activations: '#10B981',
    Checkpoints: '#3B82F6',
    Revenue: '#F59E0B'
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          variants={cardVariants}
          whileHover={{ scale: 1.02, y: -3 }}
          className="p-6 bg-gradient-to-br from-purple-900/20 via-[#1a1925]/60 to-purple-900/20 backdrop-blur-sm rounded-xl border border-white/5 shadow-lg shadow-purple-900/5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Total Keys</h3>
              <div className="flex items-center gap-1 text-xs text-green-400">
                <ArrowUpRight className="w-3 h-3" />
                <span>+{growthRate}% growth</span>
              </div>
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-400">{totalKeys}</p>
        </motion.div>
        
        <motion.div 
          variants={cardVariants}
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
                <ArrowUpRight className="w-3 h-3" />
                <span>{Math.round((activeKeys / totalKeys) * 100)}% of total</span>
              </div>
            </div>
          </div>
          <p className="text-3xl font-bold text-green-400">{activeKeys}</p>
        </motion.div>

        <motion.div 
          variants={cardVariants}
          whileHover={{ scale: 1.02, y: -3 }}
          className="p-6 bg-gradient-to-br from-amber-900/20 via-[#1a1925]/60 to-amber-900/20 backdrop-blur-sm rounded-xl border border-white/5 shadow-lg shadow-amber-900/5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Monthly Keys</h3>
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <TrendingUp className="w-3 h-3" />
                <span>+{keysLastMonth - keysLastWeek} from last week</span>
              </div>
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-400">{keysLastMonth}</p>
        </motion.div>

        <motion.div 
          variants={cardVariants}
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
                <ArrowDownRight className="w-3 h-3" />
                <span>{Math.round((expiredKeys / totalKeys) * 100)}% of total</span>
              </div>
            </div>
          </div>
          <p className="text-3xl font-bold text-red-400">{expiredKeys}</p>
        </motion.div>
      </div>

      {/* Time Range Selector */}
      <motion.div 
        variants={cardVariants}
        className="p-4 bg-[#1a1925]/50 backdrop-blur-sm rounded-xl border border-white/5 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-medium">Time Range</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className={`px-4 py-1.5 rounded-lg transition-colors duration-200 ${
              timeRange === 'week' 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button 
            className={`px-4 py-1.5 rounded-lg transition-colors duration-200 ${
              timeRange === 'month' 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button 
            className={`px-4 py-1.5 rounded-lg transition-colors duration-200 ${
              timeRange === 'year' 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className={`px-3 py-1.5 rounded-lg transition-colors duration-200 ${
              selectedChart === 'area' 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setSelectedChart('area')}
          >
            <AreaChart className="w-4 h-4" />
          </button>
          <button 
            className={`px-3 py-1.5 rounded-lg transition-colors duration-200 ${
              selectedChart === 'bar' 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setSelectedChart('bar')}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button 
            className={`px-3 py-1.5 rounded-lg transition-colors duration-200 ${
              selectedChart === 'line' 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setSelectedChart('line')}
          >
            <Activity className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Main Activity Chart */}
      <motion.div
        variants={cardVariants}
        className="p-6 bg-[#1a1925]/50 backdrop-blur-sm rounded-xl border border-white/5"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Activity Overview</h3>
              <p className="text-sm text-gray-400">Key activities over time</p>
            </div>
          </div>
        </div>

        <motion.div variants={chartVariants} className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AnimatePresence mode="wait">
              {selectedChart === 'area' && (
                <AreaChart data={activityData} key="area-chart">
                  <defs>
                    {Object.entries(chartColors).map(([key, color]) => (
                      <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={color} stopOpacity={0}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis dataKey="name" stroke="#4B5563" tickMargin={10} />
                  <YAxis stroke="#4B5563" tickMargin={10} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  <Area 
                    type="monotone" 
                    dataKey="Keys" 
                    stroke={chartColors.Keys} 
                    fillOpacity={1} 
                    fill={`url(#colorKeys)`} 
                    strokeWidth={2}
                    activeDot={{ stroke: chartColors.Keys, strokeWidth: 2, r: 6 }}
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Activations" 
                    stroke={chartColors.Activations} 
                    fillOpacity={1} 
                    fill={`url(#colorActivations)`} 
                    strokeWidth={2}
                    activeDot={{ stroke: chartColors.Activations, strokeWidth: 2, r: 6 }}
                    animationDuration={1500}
                    animationBegin={300}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Checkpoints" 
                    stroke={chartColors.Checkpoints} 
                    fillOpacity={1} 
                    fill={`url(#colorCheckpoints)`} 
                    strokeWidth={2}
                    activeDot={{ stroke: chartColors.Checkpoints, strokeWidth: 2, r: 6 }}
                    animationDuration={1500}
                    animationBegin={600}
                  />
                </AreaChart>
              )}
              {selectedChart === 'bar' && (
                <BarChart data={activityData} key="bar-chart">
                  <XAxis dataKey="name" stroke="#4B5563" />
                  <YAxis stroke="#4B5563" />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  <Bar dataKey="Keys" fill={chartColors.Keys} radius={[4, 4, 0, 0]} animationDuration={1500} />
                  <Bar dataKey="Activations" fill={chartColors.Activations} radius={[4, 4, 0, 0]} animationDuration={1500} animationBegin={300} />
                  <Bar dataKey="Checkpoints" fill={chartColors.Checkpoints} radius={[4, 4, 0, 0]} animationDuration={1500} animationBegin={600} />
                </BarChart>
              )}
              {selectedChart === 'line' && (
                <LineChart data={activityData} key="line-chart">
                  <XAxis dataKey="name" stroke="#4B5563" />
                  <YAxis stroke="#4B5563" />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  <Line 
                    type="monotone" 
                    dataKey="Keys" 
                    stroke={chartColors.Keys} 
                    strokeWidth={3}
                    dot={{ stroke: chartColors.Keys, strokeWidth: 2, r: 4, fill: '#1a1925' }}
                    activeDot={{ stroke: chartColors.Keys, strokeWidth: 2, r: 6, fill: chartColors.Keys }}
                    animationDuration={1500}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Activations" 
                    stroke={chartColors.Activations} 
                    strokeWidth={3}
                    dot={{ stroke: chartColors.Activations, strokeWidth: 2, r: 4, fill: '#1a1925' }}
                    activeDot={{ stroke: chartColors.Activations, strokeWidth: 2, r: 6, fill: chartColors.Activations }}
                    animationDuration={1500}
                    animationBegin={300}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Checkpoints" 
                    stroke={chartColors.Checkpoints} 
                    strokeWidth={3}
                    dot={{ stroke: chartColors.Checkpoints, strokeWidth: 2, r: 4, fill: '#1a1925' }}
                    activeDot={{ stroke: chartColors.Checkpoints, strokeWidth: 2, r: 6, fill: chartColors.Checkpoints }}
                    animationDuration={1500}
                    animationBegin={600}
                  />
                </LineChart>
              )}
            </AnimatePresence>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          variants={cardVariants}
          className="p-6 bg-[#1a1925]/50 backdrop-blur-sm rounded-xl border border-white/5 h-80"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-lg font-medium text-white">Geographic Distribution</h3>
          </div>
          
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={countryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1500}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {countryData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                    stroke={activeIndex === index ? '#fff' : 'none'}
                    strokeWidth={activeIndex === index ? 2 : 0}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="p-6 bg-[#1a1925]/50 backdrop-blur-sm rounded-xl border border-white/5 h-80"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-white">User Activity</h3>
          </div>
          
          <ResponsiveContainer width="100%" height="85%">
            <BarChart 
              layout="vertical" 
              data={[
                { name: 'New Users', value: 85 },
                { name: 'Returning', value: 65 },
                { name: 'Regular', value: 45 },
                { name: 'Premium', value: 30 },
                { name: 'Free', value: 15 },
              ]}
              margin={{ left: 20 }}
            >
              <XAxis type="number" stroke="#4B5563" />
              <YAxis dataKey="name" type="category" stroke="#4B5563" width={80} />
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" opacity={0.2} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="gradientBar" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <Bar 
                dataKey="value" 
                fill="url(#gradientBar)" 
                radius={[0, 4, 4, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
};