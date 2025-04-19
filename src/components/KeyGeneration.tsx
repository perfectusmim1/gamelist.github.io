import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Check, Trash2, Plus, Copy, ChevronLeft, ChevronRight, CalendarClock, CheckSquare, AlertCircle } from 'lucide-react';
import { useKeyStore } from '../store/keyStore';
import { format } from 'date-fns';

// Button animation configs for different button types with color transitions
const primaryButtonConfig = {
  whileHover: { 
    scale: 1.02, 
    backgroundColor: "rgba(139, 92, 246, 0.25)", // Purple glow for primary actions
    boxShadow: "0 0 10px rgba(139, 92, 246, 0.2), inset 0 0 0 1px rgba(139, 92, 246, 0.4)",
    transition: { duration: 0.06, ease: "easeOut" } 
  },
  whileTap: { 
    scale: 0.98, 
    transition: { duration: 0.03, ease: "easeIn" } 
  }
};

const dangerButtonConfig = {
  whileHover: { 
    scale: 1.02, 
    backgroundColor: "rgba(239, 68, 68, 0.25)", // Red glow for destructive actions
    boxShadow: "0 0 10px rgba(239, 68, 68, 0.2), inset 0 0 0 1px rgba(239, 68, 68, 0.4)",
    transition: { duration: 0.06, ease: "easeOut" } 
  },
  whileTap: { 
    scale: 0.98, 
    transition: { duration: 0.03, ease: "easeIn" } 
  }
};

const navButtonConfig = {
  whileHover: { 
    scale: 1.05, 
    backgroundColor: "rgba(255, 255, 255, 0.1)", // White glow for navigation
    boxShadow: "0 0 8px rgba(255, 255, 255, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.2)",
    transition: { duration: 0.06, ease: "easeOut" } 
  },
  whileTap: { 
    scale: 0.95, 
    transition: { duration: 0.03, ease: "easeIn" } 
  }
};

// Special config for Cancel buttons with rounded corners
const cancelButtonConfig = {
  whileHover: { 
    scale: 1.02, 
    backgroundColor: "rgba(255, 255, 255, 0.08)", 
    borderRadius: "0.5rem", // Ensure rounded corners
    transition: { duration: 0.06, ease: "easeOut" } 
  },
  whileTap: { 
    scale: 0.98, 
    transition: { duration: 0.03, ease: "easeIn" } 
  }
};

// Add these animation variants at the appropriate place in the component
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

export const KeyGeneration = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hwid, setHwid] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [keyCount, setKeyCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedKeyForManage, setSelectedKeyForManage] = useState<string | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState<Date | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [isBulkGenerate, setIsBulkGenerate] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Estado para forzar una recarga de paginación
  const keysPerPage = 10;
  const MAX_KEYS = 5000;
  const CHUNK_SIZE = 500; // Generate keys in chunks to avoid UI freezing
  
  const { 
    keys, 
    selectedKeys, 
    addKey, 
    addMultipleKeys, 
    deleteKeys, 
    toggleKeySelection, 
    selectAllKeys,
    extendKeyExpiration,
    setSelectedKeys
  } = useKeyStore();

  // Efecto para manejar la recarga suave
  useEffect(() => {
    if (refreshTrigger > 0) {
      // Aquí solo se utiliza para actualizar los elementos de paginación
      // y no afecta a la visibilidad de otras pestañas
    }
  }, [refreshTrigger]);

  // Hide success notification after 5 seconds
  useEffect(() => {
    let timer: number;
    if (showSuccessNotification) {
      timer = setTimeout(() => {
        setShowSuccessNotification(false);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccessNotification]);

  // Calculate pagination values
  const totalPages = Math.ceil(keys.length / keysPerPage);
  const startIndex = (currentPage - 1) * keysPerPage;
  const paginatedKeys = keys.slice(startIndex, startIndex + keysPerPage);
  const currentPageKeys = paginatedKeys.map(key => key.id);
  const allPageKeysSelected = currentPageKeys.length > 0 && currentPageKeys.every(id => selectedKeys.includes(id));

  // Pagination handling
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      window.scrollTo(0, 0); // Sayfa başına dön
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      window.scrollTo(0, 0); // Sayfa başına dön
      setCurrentPage(currentPage - 1);
    }
  };

  const handleGenerateKey = async () => {
    if (!expiryDate) return;
    
    if (keyCount === 1) {
      setIsGenerating(true);
      setGenerationProgress(0);
      
      // Simular progreso para una mejor experiencia de usuario
      for (let i = 0; i < 5; i++) {
        setGenerationProgress((i + 1) * 20);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      addKey(hwid || undefined, expiryDate);
      setHwid('');
      setExpiryDate(null);
      setKeyCount(1);
      setIsGenerating(false);
      setGenerationProgress(100);
      setShowSuccessNotification(true);
      // No necesitamos cerrar el diálogo aquí porque ya se cerró
      
      // Ocultar la notificación después de 3 segundos
      setTimeout(() => setShowSuccessNotification(false), 3000);
      return;
    }
    
    // Handle generating multiple keys with progress bar
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      if (keyCount <= CHUNK_SIZE) {
        // Para números pequeños, generar todos a la vez
        // Simulamos progreso para mejor feedback
        for (let i = 0; i < 5; i++) {
          setGenerationProgress((i + 1) * 20);
          await new Promise(resolve => setTimeout(resolve, 80));
        }
        addMultipleKeys(keyCount, hwid || undefined, expiryDate);
        setGenerationProgress(100);
      } else {
        // Para números grandes, generar en chunks para mostrar progreso
        const totalChunks = Math.ceil(keyCount / CHUNK_SIZE);
        let remainingKeys = keyCount;
        
        for (let i = 0; i < totalChunks; i++) {
          const chunkSize = Math.min(CHUNK_SIZE, remainingKeys);
          addMultipleKeys(chunkSize, hwid || undefined, expiryDate);
          
          remainingKeys -= chunkSize;
          const progress = Math.round(((i + 1) * CHUNK_SIZE / keyCount) * 100);
          setGenerationProgress(Math.min(progress, 100));
          
          // Pequeña pausa para actualizar la UI y evitar bloqueos
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Mostrar notificación de éxito
      setShowSuccessNotification(true);
      
      // Ocultar la notificación después de 3 segundos
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } finally {
      setIsGenerating(false);
      setHwid('');
      setExpiryDate(null);
      setKeyCount(1);
      // No necesitamos cerrar el diálogo aquí porque ya se cerró
    }
  };

  const handleDelete = () => {
    // Basit ve güvenli silme işlemi
    deleteKeys(selectedKeys);
    setShowDeleteConfirm(false);
    
    // Sıfırlama olmadan basitçe ilk sayfaya dön
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  };

  const handleManageKey = (keyId: string) => {
    const key = keys.find(k => k.id === keyId);
    if (key) {
      setSelectedKeyForManage(keyId);
      setNewExpiryDate(new Date(key.expiryDate));
      setShowManageModal(true);
    }
  };

  const handleExtendExpiry = () => {
    if (selectedKeyForManage && newExpiryDate) {
      extendKeyExpiration(selectedKeyForManage, newExpiryDate);
      setShowManageModal(false);
      setSelectedKeyForManage(null);
      setNewExpiryDate(null);
    }
  };

  // Función para manejar la selección/deselección de una clave sin recarga
  const handleKeySelection = (keyId: string) => {
    // Prevent default scroll behavior
    const scrollPosition = window.scrollY;
    
    // Usar la función de tienda directamente sin depender de toggleKeySelection
    const isSelected = selectedKeys.includes(keyId);
    const newSelection = isSelected
      ? selectedKeys.filter(id => id !== keyId)
      : [...selectedKeys, keyId];
    
    // Actualizar la selección sin activar recarga (como solicitado)
    // Wrap in requestAnimationFrame to avoid layout shifts
    setSelectedKeys(newSelection);
    
    // Restore scroll position
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPosition);
    });
  };

  const handleToggleSelectAll = () => {
    // Prevent default scroll behavior
    const scrollPosition = window.scrollY;
    
    // Comprobar si todas las claves están seleccionadas, no solo la página actual
    const allKeysSelected = keys.length > 0 && keys.every(key => selectedKeys.includes(key.id));
    
    if (allKeysSelected) {
      // Deseleccionar todas las claves
      setSelectedKeys([]);
    } else {
      // Seleccionar todas las claves de todas las páginas
      const allKeyIds = keys.map(key => key.id);
      setSelectedKeys(allKeyIds);
    }
    
    // Restore scroll position
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPosition);
    });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <div className="p-6 bg-[#1a1925]/40 backdrop-blur-xl rounded-xl border border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Key Management</h2>
          <div className="flex gap-2">
            <motion.button
              {...dangerButtonConfig}
              onClick={() => setShowDeleteConfirm(true)}
              disabled={selectedKeys.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </motion.button>
            <motion.button
              key={`select-all-${refreshTrigger}`}
              {...primaryButtonConfig}
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/20 transition-all duration-150"
            >
              <CheckSquare className="w-4 h-4" />
              {keys.length > 0 && keys.every(key => selectedKeys.includes(key.id)) ? 'Deselect All' : 'Select All'}
            </motion.button>
            <motion.button
              {...primaryButtonConfig}
              onClick={() => {
                setIsBulkGenerate(false);
                setKeyCount(1);
                setIsOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/20 transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              Generate Key
            </motion.button>
            <motion.button
              {...primaryButtonConfig}
              onClick={() => {
                setIsBulkGenerate(true);
                setKeyCount(5); // Default to 5 keys
                setIsOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/20 transition-all duration-150"
            >
              <Copy className="w-4 h-4" />
              Bulk Generate
            </motion.button>
          </div>
        </div>

        {/* Progress bar for key generation */}
        {isGenerating && (
          <div className="mb-6 overflow-hidden">
            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-purple-300 font-medium">Generating keys...</span>
                <span className="text-purple-400">{generationProgress}%</span>
              </div>
              <div className="h-2 bg-purple-900/50 rounded-full overflow-hidden">
                <div
                  style={{ width: `${generationProgress}%`, transition: 'width 0.5s ease' }}
                  className="h-full bg-purple-500 rounded-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Success notification */}
        {showSuccessNotification && (
          <div className="mb-6 overflow-hidden">
            <div className="bg-green-900/30 rounded-lg p-4 border border-green-500/20 flex items-center gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-black" />
              </div>
              <div>
                <span className="text-green-300 font-medium">Success!</span>
                <p className="text-green-400 text-sm">Keys generated successfully.</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4" style={{ minHeight: keys.length ? `${Math.min(keys.length, keysPerPage) * 90}px` : '90px', position: 'relative' }}>
          {paginatedKeys.map((key, index) => (
            <motion.div
              key={`${key.id}`}
              onClick={() => handleKeySelection(key.id)}
              className={`relative flex items-center gap-4 p-4 rounded-lg border cursor-pointer backdrop-blur-sm overflow-hidden bg-white/5 hover:bg-purple-400/10 transition-colors duration-100 ${
                selectedKeys.includes(key.id) 
                  ? 'border-purple-600/40 bg-purple-700/20' 
                  : 'border-white/10'
              }`}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02, 
                y: -3,
                boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.15)',
                transition: { duration: 0.2 }
              }}
            >
              {/* Seçili arkaplan */}
              {selectedKeys.includes(key.id) && (
                <div 
                  className="absolute inset-0 bg-purple-700/20 backdrop-blur-sm -z-10"
                />
              )}
              <Checkbox.Root
                checked={selectedKeys.includes(key.id)}
                onCheckedChange={() => handleKeySelection(key.id)}
                className="w-5 h-5 rounded bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
              >
                <Checkbox.Indicator>
                  <Check className="w-4 h-4 text-purple-400" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              
              <div className="flex-1">
                <p className={`font-mono transition-colors duration-200 ${selectedKeys.includes(key.id) ? 'text-white' : 'text-white'}`}>{key.key}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className={`text-purple-400 ${selectedKeys.includes(key.id) ? 'opacity-90' : 'opacity-80'}`}>
                    Expires: {format(key.expiryDate, 'MMM dd, yyyy')}
                  </span>
                  <span className={`text-gray-400 ${selectedKeys.includes(key.id) ? 'text-purple-300/70' : ''}`}>
                    HWID: {key.hwid || 'N/A'}
                  </span>
                  <span className={`px-2 py-0.5 rounded transition-colors duration-200 ${
                    key.status === 'active' 
                      ? selectedKeys.includes(key.id) 
                        ? 'bg-green-500/30 text-green-300' 
                        : 'bg-green-500/20 text-green-400'
                      : selectedKeys.includes(key.id)
                        ? 'bg-red-500/30 text-red-300'
                        : 'bg-red-500/20 text-red-400'
                  }`}>
                    {key.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10">
              <button
                onClick={(e) => {
                  e.preventDefault(); 
                  goToPrevPage();
                }}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
                  currentPage === 1 
                    ? 'text-gray-600 cursor-not-allowed' 
                    : 'text-gray-400 hover:text-white hover:bg-purple-500/20'
                }`}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Create a window of page numbers around the current page
                  let pageNum = i + 1;
                  if (currentPage > 3 && totalPages > 5) {
                    pageNum = Math.min(totalPages - 4, currentPage - 2) + i;
                  }
                  if (currentPage > totalPages - 2 && totalPages > 5) {
                    pageNum = totalPages - 4 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNum);
                      }}
                      className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-purple-500/30 text-purple-300 font-medium'
                          : 'text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-gray-500">...</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(totalPages);
                      }}
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  goToNextPage();
                }}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
                  currentPage === totalPages
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 hover:text-white hover:bg-purple-500/20'
                }`}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Generate Key Dialog */}
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md p-6 bg-[#1a1925] rounded-xl border border-white/10 shadow-lg z-50">
            <Dialog.Title className="text-xl font-semibold text-white mb-6">
              {isBulkGenerate ? 'Bulk Generate Keys' : 'Generate New Key'}
            </Dialog.Title>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  HWID (Optional)
                </label>
                <motion.div 
                  variants={itemVariants}
                  className="relative"
                >
                  <input
                    type="text"
                    value={hwid}
                    onChange={(e) => setHwid(e.target.value)}
                    placeholder="Enter hardware ID"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 focus:bg-purple-900/10 transition-colors duration-200"
                  />
                </motion.div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expiry Date
                </label>
                <div className="relative">
                  <DatePicker
                    selected={expiryDate}
                    onChange={date => setExpiryDate(date)}
                    minDate={new Date()}
                    className="w-full p-2 bg-purple-900 rounded border border-purple-500/30 text-white focus:border-purple-500 focus:outline-none"
                    dateFormat="MMMM d, yyyy"
                  />
                  <CalendarClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
              
              {isBulkGenerate && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Keys
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={keyCount}
                    onChange={(e) => setKeyCount(parseInt(e.target.value) || 2)}
                    className="w-full p-2 bg-purple-900/20 rounded border border-purple-500/30 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Dialog.Close asChild>
                <button className="px-4 py-2 bg-gray-700/50 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              
              <button
                onClick={() => {
                  if (isBulkGenerate) {
                    // Modo de generación masiva
                    if (keyCount > 1 && expiryDate) {
                      // Cerrar el diálogo inmediatamente
                      setIsOpen(false);
                      // Iniciar la generación en segundo plano
                      setTimeout(() => handleGenerateKey(), 100);
                    }
                  } else {
                    // Modo de generación de una sola clave
                    if (expiryDate) {
                      // Cerrar el diálogo inmediatamente
                      setIsOpen(false);
                      // Iniciar la generación en segundo plano
                      setTimeout(() => handleGenerateKey(), 100);
                    }
                  }
                }}
                disabled={!expiryDate || (isBulkGenerate && keyCount < 2)}
                className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {isBulkGenerate ? `Generate ${keyCount} Keys` : 'Generate Key'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md p-6 bg-[#1a1925] border border-white/10 rounded-xl shadow-lg z-50">
            <AlertDialog.Title className="text-xl font-semibold text-white mb-2">
              Confirm Deletion
            </AlertDialog.Title>
            <AlertDialog.Description className="text-gray-300 mb-6">
              Are you sure you want to delete {selectedKeys.length} selected {selectedKeys.length === 1 ? 'key' : 'keys'}? This action cannot be undone.
            </AlertDialog.Description>
            <div className="flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <button className="px-4 py-2 bg-transparent text-gray-300 hover:text-white rounded-lg transition-colors">
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </motion.div>
  );
};