"use client";

import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface LoadingScreenProps {
  variant?: 'initial' | 'scene' | 'audio';
  onStart?: () => void;
}

export function LoadingScreen({ variant = 'initial', onStart }: LoadingScreenProps) {
  const { t } = useLanguage();
  
  const getContent = () => {
    switch (variant) {
      case 'initial':
        return {
          systemCode: t('loading.systemCode'),
          welcomeMessage: t('loading.welcome'),
          description: t('loading.description'),
          showButton: true,
          showInstructions: true,
          steps: []
        };
      case 'scene':
        return {
          systemCode: '003_SCENE_LOADING',
          title: `♪ ${t('loading.systemCode')}`,
          welcomeMessage: '',
          description: '',
          showButton: false,
          showInstructions: false,
          statusText: t('loading.sceneLoading'),
          steps: [
            { text: t('loading.initRenderer'), active: true },
            { text: t('loading.loadModels'), active: false },
            { text: t('loading.prepareAudio'), active: false }
          ]
        };
      case 'audio':
        return {
          systemCode: '004_AUDIO_INIT',
          title: `♪ ${t('loading.systemCode')}`,
          welcomeMessage: '',
          description: '',
          showButton: false,
          showInstructions: false,
          statusText: t('loading.audioInit'),
          steps: [
            { text: t('loading.loadWebAudio'), active: true },
            { text: t('loading.prepareSynths'), active: false },
            { text: t('loading.configSpatial'), active: false }
          ]
        };
      default:
        return {
          systemCode: '002_SYSTEM',
          title: `♪ ${t('loading.systemCode')}`,
          welcomeMessage: '',
          description: '',
          showButton: false,
          showInstructions: false,
          steps: []
        };
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm z-50 p-8">
      {/* Main content container with border */}
      <div className="relative w-full h-full border border-white flex flex-col items-center justify-center">
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

       

        {/* Complex border container */}
        <div className="relative border border-white p-8">
          {/* Corner decorations */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white"></div>
          
          {/* Inner content */}
          <div className="text-center">

            {/* Title */}
            <div className="mb-6">
              <h2 className="text-2xl font-mono font-bold text-white tracking-wider mb-2">
                {content.systemCode}
              </h2>
              <div className="w-24 h-px bg-white mx-auto"></div>
              <div className="w-16 h-px bg-gray-500 mx-auto mt-1"></div>
            </div>

            {/* Main title */}
            <h1 className="text-3xl font-mono font-bold text-white tracking-wider mb-6">
              {content.title}
            </h1>

            {/* Welcome message */}
            {content.welcomeMessage && (
              <div className="mb-6">
                <p className="text-lg font-mono text-white tracking-wide mb-4 text-center">
                  {content.welcomeMessage}
                </p>
                <p className="text-sm font-mono text-gray-300 tracking-wide leading-relaxed max-w-4xl mx-auto text-center px-8">
                  {content.description}
                </p>
              </div>
            )}

            {/* Action button */}
            {content.showButton && (
              <div className="mb-8">
                <button 
                  onClick={onStart}
                  className="group relative px-8 py-3 border border-white text-white hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
                >
                  <div className="absolute -inset-1 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative font-mono text-sm tracking-wider">
                    {t('loading.startButton')}
                  </span>
                </button>
              </div>
            )}


            {/* Status text */}
            {content.statusText && (
              <p className="text-sm font-mono text-gray-300 tracking-wide mb-6">
                {content.statusText}
              </p>
            )}

            {/* Loading steps */}
            {content.steps.length > 0 && (
              <div className="space-y-2 text-xs font-mono text-gray-400 tracking-wider mb-8">
                {content.steps.map((step, index) => (
                  <div key={index} className="flex items-center justify-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${step.active ? 'bg-white animate-pulse' : 'bg-gray-500'}`}></div>
                    <span>{step.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Academic Information */}
            <div className="mt-8 pt-6 border-t border-gray-600">
              {/* Project Information */}
              <div className="text-center space-y-2">
                <p className="text-xs font-mono text-gray-300 tracking-wider">
                  {t('loading.project')}
                </p>
                <p className="text-xs font-mono text-gray-300 tracking-wider">
                  {t('loading.degree')}
                </p>
                
                {/* Author */}
                <div className="mt-4 pt-2 border-t border-gray-700">
                  <p className="text-xs font-mono text-gray-400 tracking-wider mb-1">
                    {t('loading.author')}
                  </p>
                  <p className="text-sm font-mono text-white tracking-wider">
                    {t('loading.authorName')}
                  </p>
                </div>

                {/* Tutor */}
                <div className="mt-3">
                  <p className="text-xs font-mono text-gray-400 tracking-wider mb-1">
                    {t('loading.tutor')}
                  </p>
                  <p className="text-sm font-mono text-white tracking-wider">
                    {t('loading.tutorName')}
                  </p>
                </div>
              </div>

              {/* Logos */}
              <div className="flex justify-center items-center gap-8 mt-6 pt-4 border-t border-gray-700">
                {/* UNAM Logo */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-2 flex items-center justify-center">
                    <img 
                      src="/Picture1-removebg-preview.png" 
                      alt="UNAM Logo" 
                      className="w-full h-full object-contain filter brightness-0 invert opacity-90"
                    />
                  </div>
                </div>
                
                {/* FaM Logo */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-2 flex items-center justify-center">
                    <img 
                      src="/Picture2-removebg-preview.png" 
                      alt="FaM Logo" 
                      className="w-full h-full object-contain filter brightness-0 invert opacity-90"
                    />
                  </div>
                </div>
              </div>

              {/* Language Selector - Centered below logos */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <LanguageSelector variant="loading-no-flag" />
              </div>
            </div>

          </div>
        </div>

          {/* Bottom right corner indicator */}
          <div className="absolute bottom-2 right-2 w-6 h-6 border border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>

        {/* Scanner line effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute w-full h-1 bg-white shadow-lg shadow-white/80"
            style={{
              animation: 'scanner 2s linear infinite',
              top: '-8px'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
