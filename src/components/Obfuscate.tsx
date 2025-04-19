import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Download, Trash2, Shield, ChevronDown } from 'lucide-react';

export const Obfuscate = () => {
  const [luaCode, setLuaCode] = useState('');
  const [obfuscatedCode, setObfuscatedCode] = useState('');
  const [obfuscationLevel, setObfuscationLevel] = useState<1 | 2 | 3>(2);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on component mount
  useEffect(() => {
    const savedLuaCode = localStorage.getItem('keySystem_luaCode');
    const savedObfuscatedCode = localStorage.getItem('keySystem_obfuscatedCode');
    const savedLevel = localStorage.getItem('keySystem_obfuscationLevel');
    
    if (savedLuaCode) {
      setLuaCode(savedLuaCode);
    }
    
    if (savedObfuscatedCode) {
      setObfuscatedCode(savedObfuscatedCode);
    }

    if (savedLevel) {
      setObfuscationLevel(parseInt(savedLevel) as 1 | 2 | 3);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Save Lua code when it changes
  useEffect(() => {
    localStorage.setItem('keySystem_luaCode', luaCode);
  }, [luaCode]);

  // Save obfuscated code when it changes
  useEffect(() => {
    localStorage.setItem('keySystem_obfuscatedCode', obfuscatedCode);
  }, [obfuscatedCode]);

  // Save obfuscation level when it changes
  useEffect(() => {
    localStorage.setItem('keySystem_obfuscationLevel', obfuscationLevel.toString());
  }, [obfuscationLevel]);

  // Function to download text as a file
  const downloadTextAsFile = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Level 1: Minimal obfuscation
  const obfuscateLuaCodeLevel1 = (code: string): string => {
    // Implementation of Level 1 - Minimal and Light
    const generateVarName = () => {
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let name = "_";
      for (let i = 0; i < 6; i++) {
        const index = Math.floor(Math.random() * charset.length);
        name += charset.charAt(index);
      }
      return name;
    };

    let obf = code;
    
    // 1. Simple Variable Renaming (only local variables)
    const varMap: Record<string, string> = {};
    const localVarRegex = /local\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let match;
    
    while ((match = localVarRegex.exec(code)) !== null) {
      const varName = match[1];
      if (!varMap[varName]) {
        varMap[varName] = generateVarName();
      }
    }
    
    for (const [original, replacement] of Object.entries(varMap)) {
      const regex = new RegExp(`\\b${original}\\b`, 'g');
      obf = obf.replace(regex, replacement);
    }
    
    // 2. Simple XOR String Encryption (static key: 42)
    const simpleXOREncode = (str: string) => {
      const key = 42;
      const encoded = [];
      for (let i = 0; i < str.length; i++) {
        const byte = str.charCodeAt(i);
        encoded.push(byte ^ key);
      }
      const decodeVar = generateVarName();
      return `(function() local ${decodeVar} = ${key}; local t = {${encoded.join(",")}}; for i,v in ipairs(t) do t[i] = string.char(v ~ ${decodeVar}) end; return table.concat(t) end)()`;
    };
    
    // Find and encrypt all string literals
    const stringRegex = /(["'])(.*?)\1/g;
    obf = obf.replace(stringRegex, (match, quote, content) => {
      if (content.length <= 1) return match;
      return quote + simpleXOREncode(content) + quote;
    });
    
    return obf;
  };

  // Level 2: Medium obfuscation
  const obfuscateLuaCodeLevel2 = (code: string): string => {
    // Implementation of Level 2 - Medium
    const generateVarName = () => {
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let name = "_";
      for (let i = 0; i < 10; i++) {
        const index = Math.floor(Math.random() * charset.length);
        name += charset.charAt(index);
      }
      return name;
    };

    let obfuscated = code;
    
    // 1. Variable Renaming
    const varMap: Record<string, string> = {};
    const localVarRegex = /local\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    let match;
    
    while ((match = localVarRegex.exec(code)) !== null) {
      const varName = match[1];
      if (!varMap[varName]) {
        varMap[varName] = generateVarName();
      }
    }
    
    for (const [original, replacement] of Object.entries(varMap)) {
      const regex = new RegExp(`\\b${original}\\b`, 'g');
      obfuscated = obfuscated.replace(regex, replacement);
    }
    
    // 2. Control Flow Obfuscation (adding random fake if blocks)
    const lines = obfuscated.split('\n');
    const obfuscatedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      obfuscatedLines.push(lines[i]);
      if (Math.random() > 0.8) {
        const dummy = generateVarName();
        obfuscatedLines.push(`if ${dummy} then end`);
      }
    }
    
    obfuscated = obfuscatedLines.join('\n');
    
    // 3. XOR String Encryption
    const obfuscateString = (str: string) => {
      if (str.length <= 1) return str;
      
      const key = Math.floor(Math.random() * 255) + 1;
      const encoded = [];
      
      for (let i = 0; i < str.length; i++) {
        const byte = str.charCodeAt(i);
        encoded.push(byte ^ key);
      }
      
      const decodeVar = generateVarName();
      
      return `(function() local ${decodeVar} = ${key}; local t = {${encoded.join(",")}}; for i, v in ipairs(t) do t[i] = string.char(v ~ ${decodeVar}) end; return table.concat(t) end)()`;
    };
    
    // Find and encrypt all string literals
    const stringRegex = /(["'])(.*?)\1/g;
    obfuscated = obfuscated.replace(stringRegex, (match, quote, content) => {
      if (content.length <= 1) return match;
      return quote + obfuscateString(content) + quote;
    });
    
    return obfuscated;
  };

  // Level 3: Maximum obfuscation (current implementation)
  const obfuscateLuaCodeLevel3 = (code: string): string => {
    // Improved variable name generation with more randomness
    const generateVarName = () => {
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "_";
      for (let i = 0; i < 30; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      
      // Add a unique suffix with timestamp
      let suffix = "";
      for (let i = 0; i < 12; i++) {
        suffix += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      suffix += "_" + Date.now().toString().slice(-8);
      
      // Shuffle the suffix characters
      const chars = suffix.split('');
      for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]]; // Swap
      }
      
      return result + chars.join('');
    };
    
    const generateUniqueId = () => {
      const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let id = "";
      for (let i = 0; i < 20; i++) {
        id += charset.charAt(Math.floor(Math.random() * charset.length));
      }
      return id;
    };
    
    let obfuscated = code;
    
    // Değişken İsimlerini Değiştir (Variable Name Obfuscation)
    const localVarRegex = /local\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
    const varMap: Record<string, string> = {};
    let match;
    
    while ((match = localVarRegex.exec(code)) !== null) {
      const varName = match[1];
      if (!varMap[varName]) {
        varMap[varName] = generateVarName() + "_" + generateVarName().split('').reverse().join('') + "_" + generateUniqueId();
      }
    }
    
    for (const [original, replacement] of Object.entries(varMap)) {
      const regex = new RegExp(`\\b${original}\\b`, 'g');
      obfuscated = obfuscated.replace(regex, replacement);
    }
    
    // Kod Akışını Karıştır (Control Flow Obfuscation) with anti-tampering
    const addControlFlowObfuscation = (codeStr: string) => {
      const lines = codeStr.split('\n');
      const obfuscatedLines = [];
      
      for (let i = 0; i < lines.length; i++) {
        obfuscatedLines.push(lines[i]);
        if (Math.random() > 0.35) {
          const dummyVar = generateVarName();
          const condition = generateVarName();
          const loopVar = generateVarName();
          const dummyFuncName = generateVarName();
          
          obfuscatedLines.push(
            `local ${dummyVar} = ${Math.random() > 0.5 ? 'true' : 'false'}` +
            `\nfor ${loopVar} = 1, ${Math.floor(Math.random() * 15) + 5} do` +
            `\n  if ${condition} == ${dummyVar} then` +
            `\n    local ${dummyFuncName} = function(${generateVarName()}) return ${Math.random() * 1000} end` +
            `\n  else` +
            `\n    ${generateVarName()} = ${Math.random() * 2000}` +
            `\n  end` +
            `\nend` +
            `\nif ${dummyVar} ~= ${dummyVar} then error('Tampering detected') end`
          );
        }
      }
      
      return obfuscatedLines.join('\n');
    };
    
    obfuscated = addControlFlowObfuscation(obfuscated);
    
    // Junk Kod Ekleyerek Daha Karmaşık Hale Getir (Add Junk Code)
    const junkBlocks = [];
    const junkCount = Math.floor(Math.random() * 10) + 10; // 10-20 junk blocks
    
    for (let i = 0; i < junkCount; i++) {
      const dummyFunc = generateVarName();
      const dummyArg = generateVarName();
      const nestedFunc = generateVarName();
      const junkBlock = [
        `local ${dummyFunc} = function(${dummyArg})`,
        `  local ${generateVarName()} = ${Math.random() * 3000}`,
        `  local ${nestedFunc} = function(${generateVarName()}) return (${dummyArg} + ${generateVarName()}) * ${Math.random() * 500} end`,
        `  return ${nestedFunc}(${Math.random()}) + ${nestedFunc}(${Math.random() * 50}) + ${Math.random() * 75}`,
        `end`,
        `${dummyFunc}(${Math.random()}) -- Junk call`
      ];
      junkBlocks.push(junkBlock.join('\n'));
    }
    
    obfuscated = junkBlocks.join('\n') + '\n' + obfuscated;
    
    // Stringleri Dinamik XOR ve Rotasyon ile Şifrele (String Encryption with XOR and Rotation)
    const stringRegex = /(["'])(.*?)\1/g;
    obfuscated = obfuscated.replace(stringRegex, (match, quote, content) => {
      if (content.length <= 1) return match;
      
      // Generate keys for XOR encryption
      const keyCount = Math.floor(content.length / 2) + 1;
      const keys = [];
      for (let i = 0; i < keyCount; i++) {
        keys.push(Math.floor(Math.random() * 255) + 1);
      }
      
      // Encode characters with XOR and rotation
      const encoded = [];
      for (let i = 0; i < content.length; i++) {
        const charCode = content.charCodeAt(i);
        const key = keys[i % keyCount];
        const rot = ((i % 7) + 1);
        const enc = ((charCode + rot) ^ key) % 256;
        encoded.push(enc);
      }
      
      // Reverse encoded array for additional protection
      const revEncoded = [...encoded].reverse();
      
      // Generate variable names for the decoder
      const decodeFunc = generateVarName();
      const keyTableName = generateVarName();
      const rotFunc = generateVarName();
      
      // Create the decoder function
      return `\n(function()\n  local ${decodeFunc}, ${keyTableName} = nil, { ${keys.join(',')} }\n  local ${rotFunc} = function(v,i) return (v - (((i-1) % 7) + 1)) % 256 end\n  ${decodeFunc} = function(c,i) return string.char((${rotFunc}(c,i)) ^ ${keyTableName}[((i-1) % #${keyTableName}) + 1]) end\n  local res = {}\n  for i, v in ipairs({ ${revEncoded.join(',')} }) do res[#res+1] = ${decodeFunc}(v, i) end\n  return table.concat(res)\nend)()\n`;
    });
    
    // Add random comments and empty lines for additional obfuscation
    const addNoise = (codeStr: string) => {
      const lines = codeStr.split('\n');
      return lines.map(line => {
        if (Math.random() > 0.6) {
          return `--[[${generateUniqueId()}]]${Math.random() > 0.5 ? '\n' : ''}${line}`;
        }
        return line + (Math.random() > 0.7 ? '\n\n' : '');
      }).join('');
    };
    
    obfuscated = addNoise(obfuscated);
    
    return obfuscated;
  };

  // Choose which obfuscation function to use based on level
  const obfuscateLuaCode = (code: string): string => {
    switch(obfuscationLevel) {
      case 1:
        return obfuscateLuaCodeLevel1(code);
      case 2:
        return obfuscateLuaCodeLevel2(code);
      case 3:
        return obfuscateLuaCodeLevel3(code);
      default:
        return obfuscateLuaCodeLevel2(code);
    }
  };

  // Function to handle selection of obfuscation level
  const handleLevelSelect = (level: 1 | 2 | 3) => {
    setObfuscationLevel(level);
    setIsDropdownOpen(false);
  };

  const getLevelDescription = (level: number): string => {
    switch(level) {
      case 1:
        return "Minimal (Fastest, Basic Security)";
      case 2:
        return "Standard (Balanced)";
      case 3:
        return "Maximum (Slowest, Best Security)";
      default:
        return "";
    }
  };

  // Custom Dropdown Option Component
  const DropdownOption = ({ level, isSelected, onClick }: { level: 1 | 2 | 3, isSelected: boolean, onClick: () => void }) => (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15, delay: level * 0.05 }}
      className={`
        py-3 px-4 cursor-pointer flex items-center gap-2 transition-all duration-200
        ${isSelected 
          ? 'bg-gradient-to-r from-purple-700/40 to-purple-600/30 text-white'
          : 'hover:bg-purple-500/10 text-gray-300 hover:text-white'
        }
        ${level !== 3 ? 'border-b border-purple-500/10' : ''}
      `}
      onClick={onClick}
    >
      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-purple-500' : 'border border-purple-400/30'}`}>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 bg-white rounded-full"
          />
        )}
      </div>
      <div>
        <div className="font-medium text-sm">Level {level}: <span className="opacity-70">{level === 1 ? 'Minimal' : level === 2 ? 'Standard' : 'Maximum'}</span></div>
        <div className="text-xs opacity-80">{getLevelDescription(level)}</div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6 bg-[#1a1925]/50 backdrop-blur-sm rounded-xl border border-white/5">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Code className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-medium text-white">Lua Code Obfuscator</h3>
          </div>
          <div className="flex gap-2">
            <div className="relative" ref={dropdownRef}>
              <motion.div
                whileHover={{ scale: 1.01, backgroundColor: 'rgba(139, 92, 246, 0.2)' }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 cursor-pointer 
                  bg-purple-500/10 rounded-xl border 
                  ${isDropdownOpen ? 'border-purple-500/40 shadow-[0_0_15px_rgba(139,92,246,0.15)]' : 'border-purple-500/20'} 
                  transition-all duration-200
                `}
              >
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="font-medium text-white text-sm whitespace-nowrap">
                  Level {obfuscationLevel}: {obfuscationLevel === 1 ? 'Minimal' : obfuscationLevel === 2 ? 'Standard' : 'Maximum'}
                </span>
                <motion.div
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-purple-400" />
                </motion.div>
              </motion.div>
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#1e1a2e] rounded-xl border border-purple-500/20 shadow-lg shadow-purple-900/20 overflow-hidden"
                    style={{ 
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)'
                    }}
                  >
                    <DropdownOption 
                      level={1} 
                      isSelected={obfuscationLevel === 1} 
                      onClick={() => handleLevelSelect(1)} 
                    />
                    <DropdownOption 
                      level={2} 
                      isSelected={obfuscationLevel === 2} 
                      onClick={() => handleLevelSelect(2)} 
                    />
                    <DropdownOption 
                      level={3} 
                      isSelected={obfuscationLevel === 3} 
                      onClick={() => handleLevelSelect(3)} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(139, 92, 246, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!luaCode.trim()) return;
                setObfuscatedCode(obfuscateLuaCode(luaCode));
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/20 transition-all duration-200"
            >
              <Code className="w-4 h-4" />
              Obfuscate
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(139, 92, 246, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!obfuscatedCode.trim()) return;
                downloadTextAsFile(obfuscatedCode, 'obfuscated_lua_code.lua');
              }}
              disabled={!obfuscatedCode.trim()}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Download
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(220, 38, 38, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setLuaCode('');
                setObfuscatedCode('');
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </motion.button>
          </div>
        </div>
        
        <div className="mb-6 p-4 bg-purple-500/5 backdrop-blur-sm border border-purple-500/20 rounded-xl shadow-lg shadow-purple-900/5">
          <div className="flex gap-2 items-center mb-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <h4 className="text-white font-medium">Current Obfuscation: Level {obfuscationLevel}</h4>
          </div>
          <p className="text-gray-300 text-sm">{getLevelDescription(obfuscationLevel)}</p>
          {obfuscationLevel === 3 && (
            <p className="text-yellow-400 text-sm mt-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Note: Level 3 produces the most secure obfuscation but may significantly increase script size and execution time.
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-400 mb-2">Input Lua Code</p>
            <textarea
              value={luaCode}
              onChange={(e) => setLuaCode(e.target.value)}
              placeholder="Enter your Lua code here..."
              className="w-full h-[400px] p-4 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-purple-500/50 transition-colors duration-200"
            />
          </div>
          
          <div>
            <p className="text-sm text-gray-400 mb-2">Obfuscated Output</p>
            <textarea
              value={obfuscatedCode}
              readOnly
              placeholder="Obfuscated code will appear here..."
              className="w-full h-[400px] p-4 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-purple-500/50 transition-colors duration-200"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
