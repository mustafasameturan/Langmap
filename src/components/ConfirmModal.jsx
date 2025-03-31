import React, { useEffect, useRef } from 'react'
import Modal from './Modal'

function ConfirmModal({ 
  open, 
  setOpen, 
  darkMode, 
  title = "Onay", 
  message = "Bu işlemi gerçekleştirmek istediğinize emin misiniz?", 
  onConfirm, 
  onCancel,
  confirmText = "Evet",
  cancelText = "Hayır"
}) {
  
  const confirmButtonRef = useRef(null);
  
  const handleCancel = () => {
    if (onCancel) onCancel();
    setOpen(false);
  };
  
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    setOpen(false);
  };
  
  // Klavye kısayolları için event listener ekle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;
      
      // Esc tuşu -> İptal
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
      
      // Enter tuşu -> Onayla
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Modal açıldığında onay butonuna focus yap
    if (open && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      title={title}
      darkMode={darkMode}
      customClass="w-[40%]"
      onClose={handleCancel}
      showFooter={false}
    >
      <div className="py-4">
        <div className={`flex items-center ${darkMode ? 'text-yellow-300' : 'text-amber-500'} text-lg mb-6`}>
          <svg className="w-8 h-8 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <p className={`${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{message}</p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors
              ${darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={handleConfirm}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none ${darkMode ? 'focus:ring-red-500' : 'focus:ring-red-400'}
              ${darkMode 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmModal 