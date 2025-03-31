import React from 'react'

function Header({ darkMode, toggleDarkMode, onJsonModalOpen }) {
  return (
    <header className={`py-4 px-6 ${darkMode ? 'bg-gray-900 border-b border-gray-800' : 'bg-white border-b border-gray-200'} shadow-sm mb-8 transition-colors`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo & Title Section */}
        <div className="flex items-center">
          <div className="flex items-center header-logo">
            {/* Logo Icon */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg mr-3 ${darkMode ? 'bg-gradient-to-br from-indigo-600 to-purple-700' : 'bg-gradient-to-br from-indigo-500 to-purple-600'} shadow-lg`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
              </svg>
            </div>
            
            {/* Logo Text */}
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600'}`}>Langmap</h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Localization dosyalarını kolayca oluşturun
              </p>
            </div>
          </div>
        </div>
        
        {/* Actions Section */}
        <div className="flex items-center space-x-4">
          {/* JSON Çıkarıcı Button */}
          <button 
            onClick={onJsonModalOpen}
            className="px-4 py-1.5 bg-purple-600 text-white rounded-lg font-medium shadow-md hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 flex items-center json-extractor-button"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
            </svg>
            JSON Çıkarıcı
          </button>
          
          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header 