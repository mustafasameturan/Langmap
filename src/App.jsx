import { useState, useEffect } from 'react'
import Header from './components/Header'
import KeyValueGenerator from './components/KeyValueGenerator'
import JsonModal from './components/JsonModal'
import ConfirmModal from './components/ConfirmModal'
import AppTour from './components/AppTour'
import './index.css'

function App() {
  const [jsonModalOpen, setJsonModalOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(true) // Varsayılan olarak dark mode aktif
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [keysChanged, setKeysChanged] = useState(false)

  console.log('samet 4');
  
  // Dark mode tercihini localStorage'dan al veya varsayılan olarak dark mode kullan
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode')
    // Eğer localStorage'da bir değer yoksa veya true ise
    if (savedMode === null || savedMode === 'true') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Dark mode değiştiğinde localStorage'a kaydet ve HTML sınıfını güncelle
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handleJsonModalOpen = () => {
    // Eğer düzenleme varsa onay iste, yoksa direkt aç
    if (keysChanged) {
      setConfirmModalOpen(true)
    } else {
      setJsonModalOpen(true)
    }
  }

  // Key değişikliklerini takip etmek için (bu örnek için sadece simüle ediyoruz)
  const trackKeyChanges = (hasChanges) => {
    setKeysChanged(hasChanges)
  }

  // Turu sıfırlamak için fonksiyon
  const resetTour = () => {
    localStorage.removeItem('showAppTour');
    window.location.reload();
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 to-purple-50'}`}>
      {/* Tur Rehberi */}
      <AppTour darkMode={darkMode} />
      
      <div className="max-w-6xl mx-auto p-6">
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} onJsonModalOpen={handleJsonModalOpen} />
        
        <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="relative">
            <KeyValueGenerator darkMode={darkMode} onKeysChange={trackKeyChanges} />
          </div>
        </div>

        {/* Turu sıfırlamak için yardımcı buton (footer'a ekleyelim) */}
        <div className={`mt-8 text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <p>
            Langmap © {new Date().getFullYear()} | <button 
              onClick={resetTour} 
              className="text-indigo-500 hover:text-indigo-400 underline focus:outline-none"
            >
              Yardım turunu tekrar göster
            </button>
          </p>
        </div>
      </div>
      
      {/* JSON Extractor Modal */}
      <JsonModal open={jsonModalOpen} setOpen={setJsonModalOpen} darkMode={darkMode} />

      {/* Onay Modalı - Diğer Araca Geçmeden Önce */}
      <ConfirmModal
        open={confirmModalOpen}
        setOpen={setConfirmModalOpen}
        darkMode={darkMode}
        title="Araç Değiştirme Onayı"
        message="JSON Çıkarıcı'ya geçmek istediğinize emin misiniz? Kaydetmediğiniz değişiklikler kaybolabilir."
        onConfirm={() => {
          setConfirmModalOpen(false);
          setJsonModalOpen(true);
        }}
        confirmText="Evet, Geç"
        cancelText="İptal"
      />
    </div>
  )
}

export default App
