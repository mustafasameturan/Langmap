import React, { useState, useEffect, useCallback } from 'react'
import ConfirmModal from './ConfirmModal'

function KeyValueGenerator({ darkMode, onKeysChange }) {
  const [keyPrefix, setKeyPrefix] = useState('')
  const [keys, setKeys] = useState('')
  const [languages, setLanguages] = useState([
    { id: 1, code: 'tr', translations: '' }
  ])
  const [output, setOutput] = useState({})
  const [copied, setCopied] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [languageToDelete, setLanguageToDelete] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // 'saved', 'saving', 'error'
  const [showClearConfirm, setShowClearConfirm] = useState(false) // Temizleme onayı için modal
  const [hasStoredData, setHasStoredData] = useState(false) // LocalStorage'da veri var mı?
  
  // Başlangıç değerlerini sakla
  const [initialState, setInitialState] = useState({
    keyPrefix: '',
    keys: '',
    languages: [{ id: 1, code: 'tr', translations: '' }]
  });

  // localStorage'dan verileri yükle
  useEffect(() => {
    try {
      const savedPrefix = localStorage.getItem('langmap_keyPrefix');
      const savedKeys = localStorage.getItem('langmap_keys');
      const savedLanguages = localStorage.getItem('langmap_languages');
      
      // LocalStorage'da gerçekten anlamlı veri var mı kontrolü
      const hasPrefix = savedPrefix && savedPrefix.trim() !== '';
      const hasKeys = savedKeys && savedKeys.trim() !== '';
      
      let hasLanguageData = false;
      let parsedLanguages = [{ id: 1, code: 'tr', translations: '' }];
      
      // Dil verilerini kontrol et
      if (savedLanguages) {
        try {
          parsedLanguages = JSON.parse(savedLanguages);
          
          // Dil verilerinin gerçekten anlamlı olup olmadığını kontrol et
          hasLanguageData = parsedLanguages.some(lang => 
            lang.code !== 'tr' || (lang.translations && lang.translations.trim() !== '')
          );
        } catch (e) {
          console.error('Dil verisi ayrıştırma hatası:', e);
        }
      }
      
      // Gerçekten veri var mı?
      const hasData = hasPrefix || hasKeys || hasLanguageData;
      setHasStoredData(hasData);
      
      // Değerleri yükle
      if (hasPrefix) setKeyPrefix(savedPrefix);
      if (hasKeys) setKeys(savedKeys);
      if (savedLanguages) {
        setLanguages(parsedLanguages);
      }
      
      // Yüklenen verileri başlangıç durumu olarak ayarla
      setInitialState({
        keyPrefix: hasPrefix ? savedPrefix : '',
        keys: hasKeys ? savedKeys : '',
        languages: savedLanguages ? parsedLanguages : [{ id: 1, code: 'tr', translations: '' }]
      });
    } catch (error) {
      console.error('Verileri yüklerken hata:', error);
      
      // Hata durumunda localStorage'ı temizle
      localStorage.removeItem('langmap_keyPrefix');
      localStorage.removeItem('langmap_keys');
      localStorage.removeItem('langmap_languages');
      
      setHasStoredData(false);
    }
  }, []);

  // Bileşen ilk yüklendiğinde başlangıç durumunu kaydet
  useEffect(() => {
    // localStorage'dan data gelirse başlangıç durumunu güncelle
    const savedKeys = localStorage.getItem('langmap_copied_keys');
    if (savedKeys) {
      setInitialState(prev => ({
        ...prev,
        keys: savedKeys
      }));
    }
  }, []);

  // Değişiklikleri izle
  useEffect(() => {
    // Kayıtlı değerler
    const savedKeyPrefix = initialState.keyPrefix;
    const savedKeys = initialState.keys;
    const savedLanguages = initialState.languages;
    
    // Mevcut durum
    const currentKeys = keys.trim();
    const currentKeyPrefix = keyPrefix.trim();
    const currentLanguagesChanged = languages.length !== savedLanguages.length || 
      languages.some((lang, index) => {
        if (index >= savedLanguages.length) return true;
        return lang.code !== savedLanguages[index].code || 
               lang.translations.trim() !== savedLanguages[index].translations.trim();
      });
    
    // Gerçek değişiklik kontrolü
    const changesExist = 
      currentKeys !== savedKeys.trim() || 
      currentKeyPrefix !== savedKeyPrefix ||
      currentLanguagesChanged;
    
    setHasChanges(changesExist);
    
    // Değişiklikleri App bileşenine bildir (varsa)
    if (onKeysChange) {
      onKeysChange(changesExist);
    }
  }, [keys, languages, keyPrefix, initialState, onKeysChange]);

  // localStorage'dan JSON Key Extractor tarafından aktarılan keyleri kontrol et
  useEffect(() => {
    const checkForCopiedKeys = () => {
      const copiedKeys = localStorage.getItem('langmap_copied_keys');
      if (copiedKeys) {
        setKeys(copiedKeys);
        // Başlangıç durumunu da güncelle
        setInitialState(prev => ({
          ...prev,
          keys: copiedKeys
        }));
        localStorage.removeItem('langmap_copied_keys'); // Kullanıldıktan sonra temizle
      }
    };

    // LocalStorage durumunu kontrol et
    const checkStorageState = () => {
      // Değerleri al
      const savedPrefix = localStorage.getItem('langmap_keyPrefix');
      const savedKeys = localStorage.getItem('langmap_keys');
      const savedLanguages = localStorage.getItem('langmap_languages');
      
      // Anlamlı veri var mı kontrol et
      const hasPrefix = savedPrefix && savedPrefix.trim() !== '';
      const hasKeys = savedKeys && savedKeys.trim() !== '';
      
      let hasLanguageData = false;
      
      // Dil verilerini kontrol et
      if (savedLanguages) {
        try {
          const parsedLanguages = JSON.parse(savedLanguages);
          // Dil verilerinin gerçekten anlamlı olup olmadığını kontrol et
          hasLanguageData = parsedLanguages.some(lang => 
            lang.code !== 'tr' || (lang.translations && lang.translations.trim() !== '')
          );
        } catch (e) {
          // JSON ayrıştırma hatası
        }
      }
      
      // Durumu güncelle
      const hasData = hasPrefix || hasKeys || hasLanguageData;
      setHasStoredData(hasData);
    };

    // İlk render'da kontrol et
    checkForCopiedKeys();
    checkStorageState();

    // localStorage değişikliklerini dinle
    const handleStorageChange = (e) => {
      if (e.key === 'langmap_copied_keys') {
        checkForCopiedKeys();
      }
      
      // localStorage'daki veri değişikliklerini izle
      if (e.key && e.key.startsWith('langmap_')) {
        checkStorageState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Ayrıca periyodik olarak kontrol et (aynı pencerede olunca storage event tetiklenmiyor)
    const interval = setInterval(() => {
      checkForCopiedKeys();
      checkStorageState();
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Değişiklikleri kaydetme ve başlangıç durumunu güncelleme
  const saveChanges = useCallback(() => {
    try {
      setSaveStatus('saving');
      
      // Girilen değerlerin boş olup olmadığını kontrol et
      const isKeyPrefixEmpty = !keyPrefix.trim();
      const isKeysEmpty = !keys.trim();
      const isLanguagesEmpty = languages.length === 1 && 
                               languages[0].code === 'tr' && 
                               !languages[0].translations.trim();
      
      // Eğer her şey boşsa, temizleme işlemi yap
      if (isKeyPrefixEmpty && isKeysEmpty && isLanguagesEmpty) {
        // LocalStorage'ı temizle
        localStorage.removeItem('langmap_keyPrefix');
        localStorage.removeItem('langmap_keys');
        localStorage.removeItem('langmap_languages');
        
        // Durumu güncelle
        setHasStoredData(false);
      } else {
        // Değerler doluysa kaydet
        if (!isKeyPrefixEmpty) {
          localStorage.setItem('langmap_keyPrefix', keyPrefix);
        } else {
          localStorage.removeItem('langmap_keyPrefix');
        }
        
        if (!isKeysEmpty) {
          localStorage.setItem('langmap_keys', keys);
        } else {
          localStorage.removeItem('langmap_keys');
        }
        
        if (!isLanguagesEmpty) {
          localStorage.setItem('langmap_languages', JSON.stringify(languages));
        } else {
          localStorage.removeItem('langmap_languages');
        }
        
        // En az bir veri varsa hasStoredData'yı true yap
        setHasStoredData(!isKeyPrefixEmpty || !isKeysEmpty || !isLanguagesEmpty);
      }
      
      // Başlangıç durumunu güncelle
      setInitialState({
        keyPrefix: keyPrefix.trim(),
        keys: keys.trim(),
        languages: JSON.parse(JSON.stringify(languages)) // Derin kopya
      });
      
      setHasChanges(false);
      if (onKeysChange) {
        onKeysChange(false);
      }
      
      setSaveStatus('saved');
      
      // 2 saniye sonra kayıt durumunu sıfırla
      setTimeout(() => {
        setSaveStatus(null);
      }, 2000);
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      setSaveStatus('error');
      
      // 2 saniye sonra hata durumunu sıfırla
      setTimeout(() => {
        setSaveStatus(null);
      }, 2000);
    }
  }, [keyPrefix, keys, languages, onKeysChange]);

  // Temizle fonksiyonu
  const clearAll = useCallback(() => {
    // Tüm alanları temizle
    setKeyPrefix('');
    setKeys('');
    setLanguages([{ id: 1, code: 'tr', translations: '' }]);
    
    // LocalStorage'ı tamamen temizle
    localStorage.removeItem('langmap_keyPrefix');
    localStorage.removeItem('langmap_keys');
    localStorage.removeItem('langmap_languages');
    
    // LocalStorage durumunu güncelle
    setHasStoredData(false);
    
    // Başlangıç durumunu sıfırla
    setInitialState({
      keyPrefix: '',
      keys: '',
      languages: [{ id: 1, code: 'tr', translations: '' }]
    });
    
    // Değişiklik durumunu güncelle
    setHasChanges(false);
    if (onKeysChange) {
      onKeysChange(false);
    }
    
    // Temizlendi mesajı
    setSaveStatus('cleared');
    setTimeout(() => {
      setSaveStatus(null);
    }, 2000);
  }, [onKeysChange]);
  
  // Temizleme işlemini başlat
  const confirmClear = () => {
    setShowClearConfirm(true);
  };

  // Ctrl+S / Cmd+S kısayolu
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S veya Cmd+S 
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // Tarayıcının "Sayfayı Kaydet" davranışını engelle
        if (hasChanges) {
          saveChanges();
        }
      }
      
      // Ctrl+Backspace veya Cmd+Backspace temizleme kısayolu
      if ((e.ctrlKey || e.metaKey) && e.key === 'Backspace') {
        e.preventDefault();
        // LocalStorage'da kayıtlı veri varsa ve değişiklik yoksa temizleme onayı göster
        if (hasStoredData && !hasChanges) {
          confirmClear();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [saveChanges, hasChanges, clearAll, hasStoredData]);

  // Dil ekleme fonksiyonu
  const addLanguage = () => {
    const newId = languages.length > 0 ? Math.max(...languages.map(lang => lang.id)) + 1 : 1
    setLanguages([...languages, { id: newId, code: `lang${newId}`, translations: '' }])
  }

  // Dil silme onayı
  const confirmRemoveLanguage = (id) => {
    if (languages.length <= 1) return // En az bir dil olmalı
    
    // Dil nesnesini bul
    const languageToRemove = languages.find(lang => lang.id === id)
    
    // Eğer çeviri alanı boşsa, direkt sil (onay istemeden)
    if (languageToRemove && !languageToRemove.translations.trim()) {
    setLanguages(languages.filter(lang => lang.id !== id))
      return
    }
    
    // Çeviri alanı doluysa, onay modalını göster
    setLanguageToDelete(id)
    setConfirmModalOpen(true)
  }

  // Onaylanan dil silme işlemi
  const handleConfirmRemoveLanguage = () => {
    if (languageToDelete !== null) {
      setLanguages(languages.filter(lang => lang.id !== languageToDelete))
      setLanguageToDelete(null)
    }
  }

  // Dil güncelleme fonksiyonu
  const updateLanguage = (id, field, value) => {
    setLanguages(languages.map(lang => 
      lang.id === id ? { ...lang, [field]: value } : lang
    ))
  }

  // JSON çıktısını oluştur
  useEffect(() => {
    try {
      const keyLines = keys.split('\n').filter(line => line.trim() !== '')
      
      // Her dil için ayrı bir nesne oluştur
      const languageObjects = {}
      
      languages.forEach(language => {
        if (!language.code) return
        
        const translationLines = language.translations.split('\n').filter(line => line.trim() !== '')
        let result = {}
        
        keyLines.forEach((key, index) => {
          const translation = index < translationLines.length ? translationLines[index] : ''
          
          if (key.includes(':')) {
            // Gruplu key (button:exit gibi)
            const [group, subKey] = key.split(':')
            if (!result[group]) {
              result[group] = {}
            }
            result[group][subKey] = translation
          } else {
            // Düz key
            result[key] = translation
          }
        })
        
        // Eğer prefix varsa, tüm sonucu onun altına yerleştir
        if (keyPrefix.trim()) {
          const finalResult = {}
          finalResult[keyPrefix.trim()] = result
          languageObjects[language.code] = finalResult
        } else {
          languageObjects[language.code] = result
        }
      })
      
      setOutput(languageObjects)
    } catch (error) {
      console.error('JSON oluşturma hatası:', error)
    }
  }, [keys, languages, keyPrefix])

  // Özel JSON formatı oluşturma (dış parantezler olmadan ve key'ler tırnak içinde olmadan)
  const formatOutput = (languageCode) => {
    if (!output[languageCode]) return ''
    
    // Normal JSON string'i al
    const jsonString = JSON.stringify(output[languageCode], null, 2)
    
    // Dış parantezleri kaldır
    let formatted = jsonString.substring(1, jsonString.length - 1).trim()
    
    // Key'lerdeki tırnakları kaldır
    formatted = formatted.replace(/"([^"]+)":/g, '$1:')
    
    return formatted
  }

  // Kopyalama fonksiyonu
  const copyToClipboard = (languageCode) => {
    navigator.clipboard.writeText(formatOutput(languageCode))
    setCopied(languageCode)
    setTimeout(() => setCopied(false), 2000)
  }

  const textColor = darkMode ? 'text-gray-300' : 'text-gray-700';
  const inputBgColor = darkMode ? 'bg-gray-700' : 'bg-white';
  const inputBorderColor = darkMode ? 'border-gray-600' : 'border-gray-300';
  const inputFocusRing = 'focus:ring-2 focus:ring-indigo-500';
  const inputTextColor = darkMode ? 'text-white' : 'text-gray-900';
  const keyAreaBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const keyAreaHeaderBg = 'bg-blue-600';

  return (
    <>
      <div className="px-6 py-4">
        <div className="mb-6">
          <label className={`block mb-2 font-medium ${textColor}`}>Ana Anahtar Başlığı</label>
        <input 
          type="text" 
          value={keyPrefix} 
          onChange={(e) => setKeyPrefix(e.target.value)}
          placeholder="Örn: menu, modal, vb."
            className={`w-full p-3 rounded-lg ${inputBgColor} ${inputBorderColor} ${inputTextColor} border ${inputFocusRing} focus:border-indigo-500 transition-colors key-prefix-input`}
        />
          {keyPrefix.trim() && (
            <div className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Tüm çevirileriniz <code className={`px-1 py-0.5 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{keyPrefix}</code> anahtarı altında gruplanacak
            </div>
          )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
          {/* Anahtarlar Alanı */}
        <div className="lg:w-1/3">
            <div className={`rounded-lg shadow-lg overflow-hidden h-full border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`${keyAreaHeaderBg} text-white p-3 font-bold flex items-center justify-between`}>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                  </svg>
                  ANAHTARLAR
                </div>
                {keys.trim() && (
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-white text-black bg-opacity-20`}>
                    {keys.split('\n').filter(k => k.trim()).length} anahtar
                  </span>
                )}
            </div>
            <textarea
                className={`w-full p-4 h-[calc(100%-48px)] ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:outline-none ${inputFocusRing} transition-colors custom-scrollbar keys-textarea`}
                placeholder="Her satıra bir anahtar yazın:
button:exit
button:quit
right
left"
              value={keys}
              onChange={(e) => setKeys(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Dil Girme Alanları */}
        <div className="lg:w-2/3 languages-container">
          <div className="flex justify-between items-center mb-3">
              <h2 className={`text-lg font-semibold ${textColor}`}>
                Dil Çevirileri
                {hasChanges && (
                  <span className="ml-2 text-sm text-yellow-500 font-normal italic">
                    (Kaydedilmemiş değişiklikler var - <kbd className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                      {navigator.platform.includes('Mac') ? '⌘+S' : 'Ctrl+S'}
                    </kbd> ile kaydedin)
                  </span>
                )}
              </h2>
              <div className="flex space-x-3">
                <button 
                  onClick={saveChanges}
                  disabled={!hasChanges && saveStatus !== 'error'}
                  className={`px-4 py-2 rounded-lg flex items-center shadow-md transition-colors save-button ${
                    saveStatus === 'saved' 
                      ? 'bg-green-500 text-white' 
                      : saveStatus === 'saving' 
                      ? 'bg-blue-400 text-white'
                      : saveStatus === 'error'
                      ? 'bg-red-500 text-white'
                      : hasChanges
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Kaydediliyor...
                    </>
                  ) : saveStatus === 'saved' ? (
                    <>
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Kaydedildi!
                    </>
                  ) : saveStatus === 'error' ? (
                    <>
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Tekrar Dene
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Kaydet
                    </>
                  )}
                </button>
                
                {/* Temizle butonu - localStorage'da kayıtlı veri varsa ve değişiklik yoksa görünür */}
                {hasStoredData && !hasChanges && (
                  <button 
                    onClick={confirmClear}
                    className={`px-4 py-2 rounded-lg flex items-center shadow-md transition-colors ${
                      saveStatus === 'cleared' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {saveStatus === 'cleared' ? (
                      <>
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Temizlendi!
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Temizle
                        <kbd className="ml-1 bg-red-600 text-xs px-1 py-0.5 rounded">
                          {navigator.platform.includes('Mac') ? '⌘+Backspace' : 'Ctrl+Backspace'}
                        </kbd>
                      </>
                    )}
                  </button>
                )}

            <button 
              onClick={addLanguage}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg flex items-center shadow-md transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Dil Ekle
            </button>
          </div>
            </div>
            
            {/* Eğer anahtarlar alanı boşsa, uyarı göster */}
            {!keys.trim() && (
              <div className={`mb-4 p-3 rounded-lg border ${darkMode ? 'bg-indigo-900/20 border-indigo-800 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-800'} flex items-center text-sm`}>
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Önce <strong>Anahtarlar</strong> alanına çevirmek istediğiniz anahtarları ekleyin.</span>
              </div>
            )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {languages.map(language => (
                <div key={language.id} className={`rounded-lg shadow-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="bg-purple-600 text-white p-3 font-bold flex justify-between items-center">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={language.code}
                      onChange={(e) => updateLanguage(language.id, 'code', e.target.value)}
                        className="bg-purple-700 text-white px-2 py-1 rounded w-24 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="Dil Kodu"
                    />
                  </div>
                    <div className="flex items-center space-x-2">
                      {/* Eğer dil çevirileri varsa, sayıyı göster */}
                      {language.translations.trim() && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-white bg-opacity-20 text-black' : 'bg-purple-100 text-purple-800'}`}>
                          {language.translations.split('\n').filter(t => t.trim()).length} çeviri
                        </span>
                      )}
                  {languages.length > 1 && (
                    <button 
                          onClick={() => confirmRemoveLanguage(language.id)}
                          className="text-white hover:text-red-300 transition-colors"
                          aria-label="Dili sil"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                    </div>
                </div>
                <textarea
                    className={`w-full p-4 h-64 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors custom-scrollbar`}
                    placeholder={keys.trim() 
                      ? `Her satıra bir çeviri yazın (key sırasıyla aynı olmalı):\n${keys.split('\n').filter(k => k.trim()).map((_, i) => i === 0 ? 'Birinci key için çeviri' : i === 1 ? 'İkinci key için çeviri' : `${i+1}. key için çeviri`).join('\n')}`
                      : 'Önce Anahtarlar alanını doldurun, sonra çevirileri buraya yazın.'}
                  value={language.translations}
                  onChange={(e) => updateLanguage(language.id, 'translations', e.target.value)}
                ></textarea>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Çıktı Alanı */}
        <div className="mt-8">
          {/* JSON Çıktısı için başlık - Data varsa göster */}
          {(keys.trim() && languages.some(lang => lang.translations.trim())) && (
            <div className="flex items-center mb-4">
              <h2 className={`text-lg font-semibold ${textColor}`}>JSON Çıktısı</h2>
              <span className={`ml-2 text-sm px-2 py-1 rounded-full ${darkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                {languages.length} dil için oluşturuldu
              </span>
            </div>
          )}
          
          {/* Anahtarlar alanı veya dil alanları boş ise bilgilendirme mesajı göster */}
          {(!keys.trim() || languages.every(lang => !lang.translations.trim())) ? (
            <div className={`p-8 rounded-lg shadow-lg ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-gray-300 border border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 text-gray-700 border border-gray-200'}`}>
              <div className="flex flex-col md:flex-row items-center">
                <div className="mb-6 md:mb-0 md:mr-8">
                  <div className={`w-24 h-24 mx-auto md:mx-0 flex items-center justify-center rounded-full ${darkMode ? 'bg-indigo-900/30' : 'bg-indigo-100'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className={`text-xl font-bold mb-3 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    Localization Verinizi Oluşturmaya Başlayın
                  </h3>
                  <p className="mb-4 max-w-md mx-auto md:mx-0">
                    {!keys.trim() 
                      ? "Anahtarlar alanına çevirmek istediğiniz anahtarları ekleyerek hızlıca çoklu dil desteği oluşturun." 
                      : "Harika! Şimdi dil çevirilerini ekleyin ve JSON çıktınız aşağıda görünecektir."}
                  </p>
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg max-w-md mx-auto md:mx-0 text-left text-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className="font-medium mb-2">Adımlar:</p>
                    <ol className="space-y-3 mt-2">
                      <li className="flex items-start">
                        <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full ${!keys.trim() ? (darkMode ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800') : (darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')}`}>
                          {!keys.trim() ? "1" : "✓"}
                        </span>
                        <span className="ml-2">
                          <strong>Anahtarları ekleyin:</strong> Her satıra bir anahtar yazın 
                          <div className={`mt-1 p-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                            <code>welcome</code>, <code>button:save</code>, <code>errors:notFound</code>
                          </div>
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full ${!keys.trim() || languages.every(lang => !lang.translations.trim()) ? (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600') : (darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')}`}>
                          {languages.some(lang => lang.translations.trim()) ? "✓" : "2"}
                        </span>
                        <span className="ml-2">
                          <strong>Çevirileri ekleyin:</strong> Her key için çeviri yazın
                          {!keys.trim() && <p className="text-xs mt-1 italic opacity-75">Key'leri ekledikten sonra bu adımı tamamlayabilirsiniz</p>}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full ${!(keys.trim() && languages.some(lang => lang.translations.trim())) ? (darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600') : (darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')}`}>
                          {(keys.trim() && languages.some(lang => lang.translations.trim())) ? "✓" : "3"}
                        </span>
                        <span className="ml-2">
                          <strong>JSON çıktınızı alın:</strong> Kopyalayıp dilediğiniz yerde kullanın
                        </span>
                      </li>
                    </ol>
                    {!keys.trim() && (
                      <div className={`mt-4 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className="text-xs opacity-80">
                          <strong>İpucu:</strong> Anahtarlar alanında <code>:</code> kullanarak gruplar oluşturabilirsiniz. Örneğin: <code>errors:notFound</code> anahtarı JSON çıktısında <code>errors: {'{notFound: "..."}'}</code> şeklinde görünecektir.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Verilerin olduğu durumda JSON çıktı kutularını göster */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {languages.map(language => (
                <div key={`output-${language.id}`} className={`rounded-lg shadow-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-800'} text-white p-3 font-bold flex justify-between items-center`}>
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                      </svg>
                      <span>
                        <strong>{language.code}</strong> 
                        <span className="ml-1 text-xs opacity-80">JSON çıktısı</span>
                      </span>
                    </span>
              <button 
                onClick={() => copyToClipboard(language.code)}
                      className={`px-4 py-1 rounded text-sm ${copied === language.code ? 'bg-green-500' : 'bg-indigo-500 hover:bg-indigo-600'} transition-colors flex items-center`}
                    >
                      {copied === language.code ? (
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
                  <pre className={`p-4 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'} overflow-auto h-64 text-sm custom-scrollbar`}>
              {formatOutput(language.code)}
            </pre>
                  {/* Key sayısı bilgisi */}
                  <div className={`px-4 py-2 border-t text-xs ${darkMode ? 'border-gray-700 bg-gray-900 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                    {keyPrefix && <span className="mr-2 px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">Prefix: {keyPrefix}</span>}
                    <span>{keys.split('\n').filter(k => k.trim()).length} anahtar için {language.translations.split('\n').filter(t => t.trim()).length} çeviri</span>
                  </div>
          </div>
        ))}
            </div>
          )}
      </div>
    </div>

      {/* Dil Silme Onay Modalı */}
      <ConfirmModal
        open={confirmModalOpen}
        setOpen={setConfirmModalOpen}
        darkMode={darkMode}
        title="Dil Silme Onayı"
        message="Bu dili silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        onConfirm={handleConfirmRemoveLanguage}
        confirmText="Sil"
        cancelText="İptal"
      />
      
      {/* Temizleme Onay Modalı */}
      <ConfirmModal
        open={showClearConfirm}
        setOpen={setShowClearConfirm}
        darkMode={darkMode}
        title="Tüm Verileri Temizle"
        message="Tüm kayıtlı verileri temizlemek istediğinize emin misiniz? Bu işlem geri alınamaz."
        onConfirm={clearAll}
        confirmText="Temizle"
        cancelText="İptal"
      />
    </>
  )
}

export default KeyValueGenerator 