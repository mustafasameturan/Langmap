import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import ConfirmModal from './ConfirmModal'

function JsonModal({ open, setOpen, darkMode }) {
  const [jsonInput, setJsonInput] = useState('')
  const [initialJsonInput, setInitialJsonInput] = useState('') // Başlangıç değerini saklayacağız
  const [extractedData, setExtractedData] = useState({ keys: '', values: '' })
  const [copied, setCopied] = useState(false)
  const [keyAreaCopied, setKeyAreaCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('keys') // 'keys' veya 'values'
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState('')
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [confirmModalAction, setConfirmModalAction] = useState(null)

  // Modal açıldığında başlangıç durumunu kaydet
  useEffect(() => {
    if (open) {
      setInitialJsonInput('');
      setHasChanges(false);
    }
  }, [open]);

  // Gerçek değişiklikleri kontrol et
  useEffect(() => {
    // Gerçekten değişiklik oldu mu kontrolü
    const hasRealChanges = jsonInput.trim() !== initialJsonInput.trim();
    setHasChanges(hasRealChanges);
  }, [jsonInput, initialJsonInput]);

  // JSON string'i düzenle (dış parantezleri yoksa ekle, formatı düzeltme)
  const prepareJsonString = (input) => {
    if (!input || !input.trim()) return '';
    
    let trimmedInput = input.trim();
    
    // Tek bir anahtar-değer ismi ile başlıyorsa (checkout: { ... } gibi)
    if (/^[a-zA-Z0-9_]+\s*:/.test(trimmedInput) && !trimmedInput.startsWith('{')) {
      trimmedInput = `{${trimmedInput}}`;
    } else {
      // İlk ve son karakter kontrol et
      const hasStartBrace = trimmedInput.startsWith('{');
      const hasEndBrace = trimmedInput.endsWith('}');
      
      // Eğer dış parantezler yoksa ekle
      if (!hasStartBrace && !hasEndBrace) {
        // Girdi zaten bir nesne içeriği gibi görünüyorsa (key: value)
        return `{${trimmedInput}}`;
      } else if (!hasStartBrace) {
        return `{${trimmedInput}`;
      } else if (!hasEndBrace) {
        return `${trimmedInput}}`;
      }
    }
    
    return trimmedInput;
  }

  // Key-value çiftlerini çıkarmak için daha güçlü bir yaklaşım
  const extractKeysAndValues = () => {
    try {
      setError('');
      if (!jsonInput.trim()) {
        setError('Lütfen JSON verisi girin.');
        setExtractedData({ keys: '', values: '' });
        return;
      }

      let jsonObj;
      const preparedJsonString = prepareJsonString(jsonInput);
      
      // Farklı yöntemlerle JSON'ı çözümlemeyi dene
      try {
        // 1. Önce standart JSON.parse ile deneyelim
        jsonObj = JSON.parse(preparedJsonString);
      } catch (parseError) {
        try {
          // 2. JavaScript obje notasyonu formatını düzeltme
          const normalizedJson = preparedJsonString
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // tırnaksız keyleri tırnaklı hale getir
            .replace(/'/g, '"'); // single quote'ları double quote'a çevir
          
          jsonObj = JSON.parse(normalizedJson);
        } catch (e) {
          try {
            // 3. JSON5 benzeri daha esnek bir yaklaşım
            // Tek string içindeki çift tırnaklı metin alanlarını korumak için:
            let safeEvalString = preparedJsonString
              .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // keyleri düzeltme
              .replace(/'/g, '"') // tek tırnakları çift tırnaklara çevir
              // eğer HTML içeriği varsa, daha karmaşık bir approach gerekebilir
              .replace(/:\s*"(.+?)"/g, function(match) {
                // HTML içeriğini koruyalım
                return match.replace(/\\"/g, "'");
              });
              
            jsonObj = JSON.parse(safeEvalString);
          } catch (evalError) {
            // 4. Son çare olarak eval - sadece kendi bilgisayarınızda çalıştırdığınız için
            try {
              // Dikkat: eval güvenli değil, sadece kendi local ortamınızda kullanın
              let formattedStr = preparedJsonString;
              if (!formattedStr.match(/^\s*\{/)) formattedStr = `{${formattedStr}}`;
              jsonObj = eval(`(${formattedStr})`);
            } catch (finalError) {
              throw new Error(`JSON formatı geçersiz: ${finalError.message}`);
            }
          }
        }
      }

      const keyList = [];
      const valueList = [];
      
      // Recursive olarak tüm key ve değerleri çıkar
      const extractFromObject = (obj, prefix = '') => {
        if (!obj || typeof obj !== 'object') return;
        
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              extractFromObject(value, prefix ? `${prefix}:${key}` : key);
            } else {
              // Prefix'i (en dış başlık) çıkar
              let cleanKey;
              if (prefix) {
                const parts = `${prefix}:${key}`.split(':');
                if (parts.length > 1) {
                  // İlk bölümü (dış başlık) atla, geri kalanları birleştir
                  cleanKey = parts.slice(1).join(':');
                } else {
                  cleanKey = key;
                }
              } else {
                cleanKey = key;
              }
              
              keyList.push(cleanKey);
              valueList.push(String(value));
            }
          }
        }
      };
      
      extractFromObject(jsonObj);
      
      if (keyList.length === 0) {
        setError('Çıkarılacak key-value çifti bulunamadı.');
        setExtractedData({ keys: '', values: '' });
      } else {
        setExtractedData({ 
          keys: keyList.join('\n'), 
          values: valueList.join('\n') 
        });

        // Çıkarma işlemi başarılı olduğunda, mevcut JSON verisini yeni "başlangıç durumu" olarak ayarla
        setInitialJsonInput(jsonInput);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('JSON işleme hatası:', error);
      setError(`JSON işleme hatası: ${error.message || 'Geçerli bir JSON formatı değil.'}`);
      setExtractedData({ keys: '', values: '' });
    }
  };

  const copyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Key Alanına kopyalama fonksiyonu - KeyValueGenerator için
  const copyToKeyArea = () => {
    if (!extractedData.keys) return;
    
    try {
      // Önce clipboard'a kopyalayalım
      navigator.clipboard.writeText(extractedData.keys);
      
      // KeyValueGenerator'daki Anahtarlar alanını tespit etmek için localStorage kullanacağız
      localStorage.setItem('langmap_copied_keys', extractedData.keys);
      
      // UI feedback
      setKeyAreaCopied(true);
      setTimeout(() => setKeyAreaCopied(false), 2000);
    } catch (error) {
      console.error('Anahtarlar alanına kopyalama hatası:', error);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      setConfirmModalAction('close');
      setConfirmModalOpen(true);
    } else {
      closeModal();
    }
  };

  const closeModal = () => {
    setOpen(false);
    setJsonInput('');
    setInitialJsonInput('');
    setExtractedData({ keys: '', values: '' });
    setHasChanges(false);
    setError('');
  };

  const handleClear = () => {
    if (jsonInput) {
      setConfirmModalAction('clear');
      setConfirmModalOpen(true);
    }
  };

  const handleConfirmAction = () => {
    if (confirmModalAction === 'clear') {
      setJsonInput('');
      setExtractedData({ keys: '', values: '' });
      setError('');
      // Temizleme sonrası başlangıç durumunu da güncelle
      setInitialJsonInput('');
    } else if (confirmModalAction === 'close') {
      closeModal();
    }
  };

  const textColor = darkMode ? 'text-gray-300' : 'text-gray-700';
  const inputBgColor = darkMode ? 'bg-gray-700' : 'bg-white';
  const inputBorderColor = darkMode ? 'border-gray-600' : 'border-gray-300';
  const preBgColor = darkMode ? 'bg-gray-800' : 'bg-gray-100';
  const preTextColor = darkMode ? 'text-gray-300' : 'text-gray-800';
  const preBorderColor = darkMode ? 'border-gray-600' : 'border-gray-300';
  const errorColor = 'text-red-500';
  const activeTabBg = darkMode ? 'bg-gray-700 border-indigo-400' : 'bg-white border-indigo-500';
  const inactiveTabBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300';

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setJsonInput(clipboardText);
    } catch (err) {
      console.error('Clipboard erişim hatası:', err);
    }
  };

  return (
    <>
      <Modal 
        open={open} 
        setOpen={setOpen} 
        title="JSON Çıkarıcı" 
        onClose={handleClose}
        darkMode={darkMode}
        customClass="w-[60%]"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className={`block text-sm font-medium ${textColor} mb-2`}>
                JSON Verisi
              </label>
              <div className="flex space-x-2">
                <button 
                  onClick={handlePaste}
                  className={`px-3 py-1 rounded text-sm bg-gray-500 hover:bg-gray-600 text-white transition-colors flex items-center`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  Yapıştır
                </button>
                <button 
                  onClick={handleClear}
                  className={`px-3 py-1 rounded text-sm bg-gray-500 hover:bg-gray-600 text-white transition-colors flex items-center`}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Temizle
                </button>
              </div>
            </div>
            <textarea
              className={`w-full h-96 p-3 border ${inputBorderColor} ${inputBgColor} ${darkMode ? 'text-white' : 'text-gray-900'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-mono custom-scrollbar`}
              placeholder="JSON verisini buraya yapıştırın... Dış parantezler ({ }) opsiyoneldir. Checkout: { ... } formatında veriler de desteklenir."
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            ></textarea>
            {error && (
              <div className={`mt-2 ${errorColor} text-sm p-2 border border-red-300 rounded bg-red-50 dark:bg-red-900/20 dark:border-red-800`}>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {error}
                </div>
              </div>
            )}
            <div className="mt-3 flex justify-center">
              <button
                onClick={extractKeysAndValues}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-sm transition-colors flex items-center text-sm"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
                </svg>
                Çıkar
              </button>
            </div>
          </div>
          <div>
            {/* Tab Seçenekleri */}
            <div className="flex border-b mb-2">
              <button
                onClick={() => setActiveTab('keys')}
                className={`flex-1 py-2 px-4 border-b-2 text-center font-medium transition-colors
                  ${activeTab === 'keys' ? activeTabBg + ' border-b-2 -mb-[2px]' : inactiveTabBg}`}
              >
                Key'ler
              </button>
              <button
                onClick={() => setActiveTab('values')}
                className={`flex-1 py-2 px-4 border-b-2 text-center font-medium transition-colors
                  ${activeTab === 'values' ? activeTabBg + ' border-b-2 -mb-[2px]' : inactiveTabBg}`}
              >
                Değerler
              </button>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <label className={`block text-sm font-medium ${textColor}`}>
                {activeTab === 'keys' ? 'Çıkarılan Key\'ler' : 'Çıkarılan Değerler'}
              </label>
              <div className="flex space-x-2">
                {activeTab === 'keys' && (
                  <button
                    onClick={copyToKeyArea}
                    disabled={!extractedData.keys}
                    className={`px-3 py-1 rounded text-sm ${keyAreaCopied ? 'bg-green-500' : 'bg-purple-500 hover:bg-purple-600'} text-white transition-colors ${!extractedData.keys ? 'opacity-50 cursor-not-allowed' : ''} flex items-center`}
                  >
                    {keyAreaCopied ? (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Anahtarlar Alanına Aktarıldı!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                        </svg>
                        Anahtarlar Alanına Aktar
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => copyToClipboard(activeTab === 'keys' ? extractedData.keys : extractedData.values)}
                  disabled={!extractedData[activeTab]}
                  className={`px-3 py-1 rounded text-sm ${copied ? 'bg-green-500' : 'bg-indigo-500 hover:bg-indigo-600'} text-white transition-colors ${!extractedData[activeTab] ? 'opacity-50 cursor-not-allowed' : ''} flex items-center`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Kopyalandı!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                      </svg>
                      Kopyala
                    </>
                  )}
                </button>
              </div>
            </div>
            <pre className={`w-full h-96 p-3 ${preBgColor} ${preTextColor} border ${preBorderColor} rounded-lg overflow-auto transition-colors font-mono custom-scrollbar`}>
              {activeTab === 'keys' 
                ? (extractedData.keys || 'Key\'ler çıkarıldığında burada görünecektir...') 
                : (extractedData.values || 'Değerler çıkarıldığında burada görünecektir...')}
            </pre>
            <div className="mt-2 text-xs text-right">
              {extractedData[activeTab] && `${extractedData[activeTab].split('\n').length} adet ${activeTab === 'keys' ? 'key' : 'değer'} çıkarıldı`}
            </div>
          </div>
        </div>
      </Modal>

      {/* Onay Modalı */}
      <ConfirmModal
        open={confirmModalOpen}
        setOpen={setConfirmModalOpen}
        darkMode={darkMode}
        title={confirmModalAction === 'clear' ? "Temizleme Onayı" : "Çıkış Onayı"}
        message={
          confirmModalAction === 'clear' 
            ? "Tüm JSON verisini silmek istediğinize emin misiniz?" 
            : "Değişiklikleriniz kaydedilmedi. Çıkmak istediğinize emin misiniz?"
        }
        onConfirm={handleConfirmAction}
        confirmText={confirmModalAction === 'clear' ? "Temizle" : "Çık"}
        cancelText="İptal"
      />
    </>
  )
}

export default JsonModal 