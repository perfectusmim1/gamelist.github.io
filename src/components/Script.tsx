import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Copy, ExternalLink, ChevronLeft, ChevronRight, Check, Lock, Smartphone, DollarSign, Eye, FileSearch, Code } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import caganImage from '../cagan.png';

// rscripts.net API'sine uygun interface yapısı
interface Executor {
  _id: string;
  title: string;
  image: string;
  creator: string;
  discord_url: string;
  downloads: number;
  platforms: string[];
  download_url: string;
}

interface User {
  _id: string;
  username: string;
  image: string;
  verified: boolean;
  admin?: boolean;
  bio?: string;
  socials?: {
    discordServer?: string;
  };
}

interface Game {
  _id: string;
  title: string;
  placeId: string;
  imgurl: string;
  gameLink?: string;
}

interface Script {
  _id: string;
  title: string;
  description: string;
  rawScript: string;
  views: number;
  private: boolean;
  likes: number;
  dislikes: number;
  keySystem: boolean;
  mobileReady: boolean;
  paid: boolean;
  lastUpdated: string;
  createdAt: string;
  image: string;
  testedExecutors?: Executor[];
  user?: User;
  game?: Game;
}

interface ApiResponse {
  info: {
    currentPage: number;
    maxPages: number;
  };
  scripts: Script[];
}

interface TrendingApiResponse {
  success: {
    _id: string;
    views: number;
    script: Script;
    user: User;
  }[];
}

// Add these animation variants at the top of the component
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
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
      damping: 25
    }
  }
};

export const Script = () => {
  const [activeTab, setActiveTab] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [copySuccess, setCopySuccess] = useState('');

  // New states for advanced search
  const [mobileOnly, setMobileOnly] = useState(false);
  const [noKeySystem, setNoKeySystem] = useState(false);
  const [pageInput, setPageInput] = useState("");

  // Add this near the top of the component where other states are declared
  const [clickedScriptId, setClickedScriptId] = useState<string | null>(null);

  const tabTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  useEffect(() => {
    fetchScripts();
  }, [activeTab, currentPage]);

  const fetchScripts = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '';
      
      if (activeTab === 'trending') {
        url = 'https://rscripts.net/api/v2/trending';
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Network error: ${response.status}`);
        }
        
        const data = await response.json() as TrendingApiResponse;
        
        if (data.success && Array.isArray(data.success)) {
          // Trending API formatına göre dönüştürme
          const trendingScripts = data.success.map(item => ({
            ...item.script,
            _id: item._id,
            views: item.views,
            user: item.user
          }));
          
          setScripts(trendingScripts);
          setTotalPages(1); // Trending sayfasında pagination yok
        }
      } else if (activeTab === 'search') {
        url = `https://rscripts.net/api/v2/scripts?page=${currentPage}&orderBy=date&sort=desc` + (searchQuery.trim() ? `&q=${encodeURIComponent(searchQuery)}` : '');
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Network error: ${response.status}`);
        }
        
        const data = await response.json() as ApiResponse;
        
        if (data.scripts && Array.isArray(data.scripts)) {
          let filteredScripts = data.scripts;
          if (mobileOnly) {
            filteredScripts = filteredScripts.filter(script => script.mobileReady);
          }
          if (noKeySystem) {
            filteredScripts = filteredScripts.filter(script => !script.keySystem);
          }
          setScripts(filteredScripts);
          setTotalPages(data.info.maxPages || 1);
        }
      } else {
        // Default to all scripts
        url = `https://rscripts.net/api/v2/scripts?page=${currentPage}&orderBy=date&sort=desc`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Network error: ${response.status}`);
        }
        
        const data = await response.json() as ApiResponse;
        
        if (data.scripts && Array.isArray(data.scripts)) {
          setScripts(data.scripts);
          setTotalPages(data.info.maxPages || 1);
        }
      }
    } catch (err) {
      setError('Failed to fetch scripts. Please try again later.');
      console.error('Error fetching scripts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    setActiveTab('search');
    fetchScripts();
  };

  const loadScriptDetails = async (scriptId: string) => {
    try {
      setClickedScriptId(scriptId); // Set the clicked script ID for animation
      setLoading(true);
      const url = `https://rscripts.net/api/v2/script?id=${scriptId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.script && Array.isArray(data.script) && data.script.length > 0) {
        setSelectedScript(data.script[0]);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        // Fallback to local data if API call fails
        const script = scripts.find(s => s._id === scriptId);
        if (script) {
          setSelectedScript(script);
        } else {
          throw new Error('Script not found');
        }
      }
    } catch (error) {
      console.error('Error loading script details:', error);
      setError('Failed to load script details. Please try again.');
      setClickedScriptId(null); // Reset the clicked script ID on error
    } finally {
      setLoading(false);
      // Don't reset clickedScriptId here to allow animation to complete
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const downloadScript = (scriptText: string, scriptTitle: string) => {
    // Create a safe filename from the script title
    const safeFilename = scriptTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.lua';
    
    // Create a blob with the script content
    const blob = new Blob([scriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger a download
    const a = document.createElement('a');
    a.href = url;
    a.download = safeFilename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Yükleme rawScript URL'si
  const fetchRawScript = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch script content');
      return await response.text();
    } catch (error) {
      console.error('Error fetching raw script:', error);
      return 'Failed to load script content. Please try again later.';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
      <div className="space-y-6">
        <Tabs.Root value={activeTab} onValueChange={(val) => { setActiveTab(val); setSelectedScript(null); }}>
          <Tabs.List className="flex space-x-2 mb-6 border-b border-white/10 pb-2">
            <Tabs.Trigger
              value="popular"
              className={`px-4 py-2 rounded-t-lg transition-all duration-200 ${activeTab === 'popular' ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
            >
              Latest Scripts
            </Tabs.Trigger>
            <Tabs.Trigger
              value="trending"
              className={`px-4 py-2 rounded-t-lg transition-all duration-200 ${activeTab === 'trending' ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
            >
              Trending
            </Tabs.Trigger>
            <Tabs.Trigger
              value="search"
              className={`px-4 py-2 rounded-t-lg transition-all duration-200 ${activeTab === 'search' ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
            >
              Search
            </Tabs.Trigger>
          </Tabs.List>

          {/* Render search form with advanced filters only when in search tab, wrapped with animation */}
          {activeTab === 'search' && (
            <motion.div {...tabTransition} className="mb-6">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for scripts..."
                  className="flex-1 bg-[#1a1925]/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <Search size={18} />
                  Search
                </button>
              </form>
              <div className="flex gap-6 mt-4">
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    id="mobile-filter"
                    checked={mobileOnly}
                    onChange={(e) => setMobileOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <motion.div 
                    className={`w-5 h-5 rounded-md flex items-center justify-center mr-2 transition-all duration-200 ${
                      mobileOnly 
                        ? 'bg-purple-500 border border-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]' 
                        : 'bg-white/5 border border-white/10'
                    }`}
                    whileHover={!mobileOnly ? { scale: 1.05, borderColor: 'rgba(139, 92, 246, 0.5)' } : {}}
                    whileTap={{ scale: 0.95 }}
                  >
                    <AnimatePresence>
                      {mobileOnly && (
                        <motion.svg 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
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
                    </AnimatePresence>
                  </motion.div>
                  <motion.label 
                    htmlFor="mobile-filter" 
                    className="text-sm cursor-pointer select-none"
                    animate={{ 
                      color: mobileOnly ? '#a78bfa' : '#d1d5db',
                      fontWeight: mobileOnly ? 500 : 400
                    }}
                    whileHover={{ color: '#ffffff' }}
                  >
                    Mobile
                  </motion.label>
                </div>

                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    id="no-key-filter"
                    checked={noKeySystem}
                    onChange={(e) => setNoKeySystem(e.target.checked)}
                    className="sr-only"
                  />
                  <motion.div 
                    className={`w-5 h-5 rounded-md flex items-center justify-center mr-2 transition-all duration-200 ${
                      noKeySystem 
                        ? 'bg-purple-500 border border-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]' 
                        : 'bg-white/5 border border-white/10'
                    }`}
                    whileHover={!noKeySystem ? { scale: 1.05, borderColor: 'rgba(139, 92, 246, 0.5)' } : {}}
                    whileTap={{ scale: 0.95 }}
                  >
                    <AnimatePresence>
                      {noKeySystem && (
                        <motion.svg 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
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
                    </AnimatePresence>
                  </motion.div>
                  <motion.label 
                    htmlFor="no-key-filter" 
                    className="text-sm cursor-pointer select-none"
                    animate={{ 
                      color: noKeySystem ? '#a78bfa' : '#d1d5db',
                      fontWeight: noKeySystem ? 500 : 400
                    }}
                    whileHover={{ color: '#ffffff' }}
                  >
                    No Key
                  </motion.label>
                </div>
              </div>
            </motion.div>
          )}

          {/* Render script list/details only if not in obfuscator tab, wrapped with animation */}
          <motion.div {...tabTransition}>
            {loading && !selectedScript ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/20 text-red-400 p-4 rounded-lg">{error}</div>
            ) : (
              <AnimatePresence mode="wait">
                {selectedScript ? (
                  <motion.div
                    key="script-detail"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="bg-gradient-to-br from-[#1a1925]/60 to-[#1a1925]/50 backdrop-blur-sm rounded-xl border border-purple-500/10 p-6 shadow-lg shadow-purple-900/5"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                          <Code className="w-6 h-6 text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-white">{selectedScript.title}</h2>
                      </div>
                      <motion.button
                        onClick={() => {
                          setSelectedScript(null);
                          // Reset clicked script ID after animation
                          setTimeout(() => setClickedScriptId(null), 300);
                        }}
                        className="px-4 py-2 bg-white/5 text-gray-300 rounded-xl border border-white/10 flex items-center gap-2 hover:bg-white/10 hover:text-white transition-all duration-200"
                        whileHover={{ scale: 1.05, x: -3 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ChevronLeft size={18} />
                        <span>Back to scripts</span>
                      </motion.button>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                      <div className="md:w-1/3">
                        {selectedScript.game?.imgurl ? (
                          <img 
                            src={selectedScript.game.imgurl} 
                            alt={selectedScript.game?.title || 'Game'} 
                            className="w-full h-auto rounded-lg mb-4 object-cover"
                          />
                        ) : selectedScript.image ? (
                          <img 
                            src={selectedScript.image} 
                            alt={selectedScript.title} 
                            className="w-full h-auto rounded-lg mb-4 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                            <img src={caganImage} alt="Cagan" className="w-24 h-24" />
                          </div>
                        )}
                        
                        <div className="space-y-2 bg-[#1a1925]/70 p-4 rounded-lg">
                          <div className="text-gray-300">
                            <span className="text-gray-400 font-medium">Game: </span> 
                            {selectedScript.game?.title || 'Unknown'}
                          </div>
                          
                          <div className="text-gray-300">
                            <span className="text-gray-400 font-medium">Author: </span> 
                            <span className="flex items-center gap-2">
                              {selectedScript.user?.username || 'Unknown'}
                              {selectedScript.user?.verified && (
                                <span className="bg-green-500/20 p-1 rounded-full">
                                  <Check size={12} className="text-green-400" />
                                </span>
                              )}
                            </span>
                          </div>
                          
                          <div className="text-gray-300">
                            <span className="text-gray-400 font-medium">Views: </span> 
                            {selectedScript.views || 0}
                          </div>
                          
                          <div className="text-gray-300">
                            <span className="text-gray-400 font-medium">Created: </span> 
                            {new Date(selectedScript.createdAt).toLocaleDateString()}
                          </div>
                          
                          <div className="text-gray-300">
                            <span className="text-gray-400 font-medium">Last Updated: </span> 
                            {new Date(selectedScript.lastUpdated).toLocaleDateString()}
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedScript.keySystem && (
                              <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">
                                Key System
                              </span>
                            )}
                            
                            {selectedScript.mobileReady && (
                              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                                Mobile Ready
                              </span>
                            )}
                            
                            {selectedScript.paid && (
                              <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">
                                Paid
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {selectedScript.testedExecutors && selectedScript.testedExecutors.length > 0 && (
                          <div className="mt-4">
                            <h3 className="text-white font-medium mb-2">Tested Executors</h3>
                            <div className="grid grid-cols-2 gap-2">
                              {selectedScript.testedExecutors.map(executor => (
                                <div 
                                  key={executor._id} 
                                  className="bg-[#1a1925]/70 p-2 rounded-lg flex flex-col items-center text-center"
                                >
                                  <img 
                                    src={executor.image} 
                                    alt={executor.title} 
                                    className="w-10 h-10 rounded-full object-cover mb-1"
                                  />
                                  <span className="text-gray-300 text-xs">{executor.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="md:w-2/3">
                        <div className="mb-4">
                          <h3 className="text-lg font-medium text-white mb-2">Description</h3>
                          <div className="bg-purple-900/20 rounded-lg p-4 text-gray-300">
                            {selectedScript.description || 'No description available'}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-medium text-white">Script</h3>
                            <div className="flex gap-2">
                              <button
                                onClick={() => selectedScript.rawScript && copyToClipboard(selectedScript.rawScript)}
                                className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-3 py-1 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm"
                              >
                                <Copy size={14} />
                                {copySuccess || 'Copy'}
                              </button>
                              <button
                                onClick={() => selectedScript.rawScript && downloadScript(selectedScript.rawScript, selectedScript.title)}
                                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-3 py-1 rounded-lg transition-colors duration-200 flex items-center gap-1 text-sm"
                              >
                                <ExternalLink size={14} />
                                Download Script
                              </button>
                            </div>
                          </div>
                          <div className="bg-purple-900/20 rounded-lg p-4 overflow-x-auto max-h-[500px] overflow-y-auto">
                            <pre className="text-white whitespace-pre-wrap font-mono text-sm">
                              {selectedScript.rawScript || 'Script content not available. Try clicking on the download link.'}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="script-list"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                    >
                      {scripts.length > 0 ? (
                        scripts.map((script) => (
                          <motion.div
                            key={script._id}
                            layoutId={`script-card-${script._id}`}
                            initial={{ scale: 1, y: 0 }}
                            variants={cardVariants}
                            className={`
                              bg-gradient-to-br from-[#1a1925]/60 to-[#1a1925]/70 backdrop-blur-sm 
                              rounded-xl border ${clickedScriptId === script._id 
                                ? 'border-purple-500/70 shadow-[0_0_20px_rgba(139,92,246,0.2)]' 
                                : 'border-white/5'
                              } 
                              p-5 cursor-pointer will-change-transform relative overflow-hidden group
                            `}
                            style={{
                              willChange: 'transform',
                              transition: 'none'
                            }}
                            onClick={() => loadScriptDetails(script._id)}
                            whileHover={{ 
                              scale: 1.02, 
                              y: -3,
                              transition: { 
                                type: "spring", 
                                stiffness: 500, 
                                damping: 15, 
                                mass: 0.8,
                                duration: 0,
                                delay: 0
                              }
                            }}
                            whileTap={{ 
                              scale: 0.98,
                              transition: { duration: 0.05, delay: 0 } 
                            }}
                            animate={
                              clickedScriptId === script._id 
                                ? {
                                    scale: [1, 1.03, 1.01],
                                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
                                    transition: { duration: 0.3 }
                                  } 
                                : {
                                    backgroundColor: 'rgba(26, 25, 37, 0.5)',
                                    borderColor: 'rgba(255, 255, 255, 0.05)'
                                  }
                            }
                          >
                            {/* Purple glow effect on hover */}
                            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            
                            <div className="flex items-center gap-3 mb-3 relative">
                              <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-purple-500/10 flex items-center justify-center">
                                {script.game?.imgurl ? (
                                  <img 
                                    src={script.game.imgurl} 
                                    alt={script.game?.title || 'Game'} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : script.image ? (
                                  <img 
                                    src={script.image} 
                                    alt={script.title} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                                    <img src={caganImage} alt="Cagan" className="w-8 h-8" />
                                  </div>
                                )}
                                {/* Shimmering effect on image */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium line-clamp-1 group-hover:text-purple-300 transition-colors duration-200">{script.title}</h3>
                                <p className="text-gray-400 text-sm flex items-center gap-1 mt-0.5">
                                  <span className="truncate">{script.user?.username || 'Unknown author'}</span>
                                  {script.user?.verified && (
                                    <span className="bg-green-500/20 p-1 rounded-full flex-shrink-0 flex items-center justify-center">
                                      <Check size={10} className="text-green-400" />
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            
                            <div className="relative">
                              <p className="text-gray-300 text-sm line-clamp-2 mb-3 group-hover:text-white transition-colors duration-200">
                                {script.description || 'No description available'}
                              </p>
                              
                              <div className="flex flex-wrap gap-1.5">
                                {script.keySystem && (
                                  <span className="inline-block bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                                    <Lock className="w-3 h-3" />
                                    Key System
                                  </span>
                                )}
                                {script.mobileReady && (
                                  <span className="inline-block bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                                    <Smartphone className="w-3 h-3" />
                                    Mobile Ready
                                  </span>
                                )}
                                {script.paid && (
                                  <span className="inline-block bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    Paid
                                  </span>
                                )}
                              </div>
                              
                              <div className="absolute bottom-0 right-0 flex items-center text-xs text-gray-400 gap-2">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" /> 
                                  {script.views || 0}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <motion.div
                          variants={cardVariants}
                          className="col-span-full flex flex-col items-center justify-center py-16 bg-white/5 rounded-xl border border-white/5"
                        >
                          <FileSearch className="w-16 h-16 text-gray-500 mb-4" />
                          <p className="text-gray-300 font-medium">No scripts found</p>
                          <p className="text-gray-500 text-sm mt-1">Try different search terms or filters</p>
                        </motion.div>
                      )}
                    </motion.div>
                    
                    {/* Pagination controls for tabs other than trending */}
                    {scripts.length > 0 && activeTab !== 'trending' && (
                      <div>
                        <div className="flex justify-between items-center mt-6">
                          <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg ${currentPage === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                          >
                            <ChevronLeft size={16} />
                            Previous
                          </button>
                          <span className="text-gray-400">
                            Page {currentPage} of {totalPages}
                          </span>
                          <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-1 px-3 py-2 rounded-lg ${currentPage === totalPages ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                          >
                            Next
                            <ChevronRight size={16} />
                          </button>
                        </div>
                        {/* Direct page selection input */}
                        <div className="flex justify-center items-center mt-4">
                          <input 
                            type="number"
                            value={pageInput}
                            onChange={(e) => setPageInput(e.target.value)}
                            placeholder={`Enter page (1-${totalPages})`}
                            className="w-24 bg-[#1a1925]/50 border border-white/10 rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          />
                          <button
                            onClick={() => {
                              const pageNumber = parseInt(pageInput);
                              if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
                                setCurrentPage(pageNumber);
                              }
                            }}
                            className="ml-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded-lg transition-colors duration-200"
                          >
                            Go
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        </Tabs.Root>
      </div>
    </motion.div>
  );
};