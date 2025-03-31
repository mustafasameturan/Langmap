import { useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({ open, setOpen, title, children, onClose, darkMode, customClass = "", showFooter = true }) {
  const cancelButtonRef = useRef(null)

  useEffect(() => {
    // Modal açıldığında body'nin scroll'unu engelle
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setOpen(false)
    }
  }

  if (!open) return null;

  // Modal içeriği document.body'ye portal olarak render edilir
  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ pointerEvents: 'auto' }}>
      {/* Hafif bir backdrop/arka plan */}
      <div className={`fixed inset-0 ${darkMode ? 'bg-black/70' : 'bg-black/50'}`} onClick={handleClose}></div>
      
      {/* Modal içeriği */}
      <div className="flex min-h-screen items-center justify-center p-4 relative z-10">
        <div className={`relative overflow-hidden rounded-xl shadow-2xl border transition-colors ${customClass}
          ${darkMode 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-white border-indigo-100 text-gray-900'}`}>
          {/* Modal başlık */}
          <div className={`p-4 flex justify-between items-center border-b 
            ${darkMode 
              ? 'border-gray-700 bg-gray-900' 
              : 'border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white'}`}>
            <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-white'}`}>{title}</h3>
            <button 
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          
          {/* Modal içerik */}
          <div className="p-6">
            {children}
          </div>
          
          {/* Modal footer - isteğe bağlı olarak gösteriliyor */}
          {showFooter && (
            <div className={`px-4 py-3 border-t flex justify-end 
              ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors 
                  ${darkMode 
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                onClick={handleClose}
                ref={cancelButtonRef}
              >
                Kapat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
} 