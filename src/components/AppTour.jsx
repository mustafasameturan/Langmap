import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';

const AppTour = ({ darkMode }) => {
  const [runTour, setRunTour] = useState(false);
  const [steps, setSteps] = useState([]);

  // LocalStorage'dan tur gösterim durumunu kontrol et
  useEffect(() => {
    // "showAppTour" değeri localStorage'da yoksa veya "true" ise turu göster
    const showTour = localStorage.getItem('showAppTour') !== 'false';
    
    // Tur adımlarını tanımla
    const tourSteps = [
      {
        target: '.header-logo',
        content: 'Langmap\'e hoş geldiniz! Bu araç, çok dilli uygulamalar için localization verilerinizi kolayca oluşturmanıza yardımcı olur.',
        disableBeacon: true,
        placement: 'bottom',
        title: 'Hoş Geldiniz'
      },
      {
        target: '.json-extractor-button',
        content: 'JSON verilerinden anahtar-değer çiftlerini kolayca çıkarmak için JSON Çıkarıcı\'yı kullanabilirsiniz.',
        placement: 'bottom',
        title: 'JSON Çıkarıcı'
      },
      {
        target: '.key-prefix-input',
        content: 'Tüm çevirilerinizi gruplandırmak için bir ana anahtar başlığı belirleyin.',
        placement: 'bottom',
        title: 'Ana Anahtar Başlığı'
      },
      {
        target: '.keys-textarea',
        content: 'Her satıra bir anahtar yazarak çeviri yapacağınız metinleri belirleyin. "button:save" gibi iki nokta ile gruplandırma yapabilirsiniz.',
        placement: 'right',
        title: 'Anahtarlar'
      },
      {
        target: '.languages-container',
        content: 'Farklı dillerde çevirileri buraya ekleyebilirsiniz. "Dil Ekle" butonu ile yeni diller ekleyebilirsiniz.',
        placement: 'left',
        title: 'Dil Çevirileri'
      },
      {
        target: '.save-button',
        content: 'Yaptığınız çalışmayı kaydetmek için bu butonu kullanın veya klavyeden Ctrl/Cmd+S tuşlarına basın.',
        placement: 'bottom',
        title: 'Kaydetme'
      },
    ];

    setSteps(tourSteps);
    
    // İlk girişte turu göster
    if (showTour) {
      setRunTour(true);
    }
  }, []);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    
    // Tur bittiğinde veya kapatıldığında
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Bir daha gösterme
      localStorage.setItem('showAppTour', 'false');
      setRunTour(false);
    }
  };

  const tourStyles = {
    options: {
      arrowColor: darkMode ? '#374151' : '#fff',
      backgroundColor: darkMode ? '#374151' : '#fff',
      overlayColor: 'rgba(0, 0, 0, 0.7)',
      primaryColor: '#6366f1',
      textColor: darkMode ? '#f3f4f6' : '#4b5563',
      zIndex: 1000,
    },
    buttonNext: {
      backgroundColor: '#6366f1'
    },
    buttonBack: {
      color: darkMode ? '#f3f4f6' : '#4b5563'
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton={false}
      run={runTour}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={tourStyles}
      disableScrolling={false}
      locale={{
        back: 'Geri',
        close: 'Kapat',
        last: 'Bitir',
        next: 'İleri',
        skip: 'Turu Geç'
      }}
      floaterProps={{
        disableAnimation: false,
        styles: {
          buttonClose: {
            display: 'none'
          }
        }
      }}
      tooltipComponent={props => (
        <div className={`p-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg shadow-lg max-w-md`}>
          {props.step.title && (
            <h3 className="text-lg font-bold mb-2">{props.step.title}</h3>
          )}
          <div className="text-sm mb-4">{props.step.content}</div>
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {props.index > 0 && (
                <button 
                  onClick={props.backProps.onClick} 
                  className={`px-3 py-1 rounded ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Geri
                </button>
              )}
              <button 
                onClick={props.skipProps.onClick}
                className={`px-3 py-1 rounded ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Turu Geç
              </button>
            </div>
            <button 
              onClick={props.index === steps.length - 1 ? props.primaryProps.onClick : props.primaryProps.onClick} 
              className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              {props.index === steps.length - 1 ? 'Bitir' : `İleri (${props.index + 1}/${steps.length})`}
            </button>
          </div>
        </div>
      )}
    />
  );
};

export default AppTour; 