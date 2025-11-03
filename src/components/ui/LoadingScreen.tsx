"use client";

import Image from 'next/image';
import { useLanguage } from '../../contexts/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface LoadingScreenProps {
  variant?: 'initial' | 'scene' | 'audio';
  onStart?: () => void;
  onSkipTutorial?: () => void;
}

export function LoadingScreen({ variant = 'initial', onStart, onSkipTutorial }: LoadingScreenProps) {
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
    <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm z-50 p-4 sm:p-6 lg:p-8">
      {/* Background image */}
      <div className="absolute inset-0 opacity-5">
        <div className="relative w-full h-full">
          <Image 
            src="/backgrounds/Minculturas_Patrones-02.png" 
            alt="Background Pattern" 
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
      
      {/* Main content container with border */}
      <div className="relative w-full h-full border border-white flex flex-col items-center justify-center">
        {/* Grid pattern background overlay */}
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
        <div className="relative border border-white p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full loading-screen-content">
          {/* Corner decorations */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white"></div>
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white"></div>
          
          {/* Inner content */}
          <div className="text-center">

            {/* Title */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-mono font-bold text-white tracking-wider mb-2">
                {content.systemCode}
              </h2>
              <div className="w-16 sm:w-20 lg:w-24 h-px bg-white mx-auto"></div>
              <div className="w-12 sm:w-14 lg:w-16 h-px bg-gray-500 mx-auto mt-1"></div>
            </div>

            {/* Main title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-mono font-bold text-white tracking-wider mb-4 sm:mb-6 loading-title">
              {content.title}
            </h1>

            {/* Welcome message */}
            {content.welcomeMessage && (
              <div className="mb-4 sm:mb-6">
                <p className="text-sm sm:text-base lg:text-lg font-mono text-white tracking-wide mb-3 sm:mb-4 text-center loading-subtitle">
                  {content.welcomeMessage}
                </p>
                <p className="text-xs sm:text-sm font-mono text-gray-300 tracking-wide leading-relaxed max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                  {content.description}
                </p>
              </div>
            )}

            {/* Action buttons */}
            {content.showButton && (
              <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button 
                  onClick={onStart}
                  className="group relative px-6 sm:px-8 lg:px-10 py-3 sm:py-4 border border-white text-white hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
                >
                  <div className="absolute -inset-1 border border-gray-600 group-hover:border-white transition-colors duration-300"></div>
                  <span className="relative font-mono text-xs sm:text-sm tracking-wider">
                    {t('loading.startTutorial')}
                  </span>
                </button>
                
                <button 
                  onClick={onSkipTutorial}
                  className="group relative px-6 sm:px-8 lg:px-10 py-3 sm:py-4 border border-gray-500 text-gray-300 hover:border-white hover:text-white transition-all duration-300 cursor-pointer"
                >
                  <div className="absolute -inset-1 border border-gray-700 group-hover:border-gray-500 transition-colors duration-300"></div>
                  <span className="relative font-mono text-xs sm:text-sm tracking-wider">
                    {t('loading.startExperience')}
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
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-600">
              {/* Project Information */}
              <div className="text-center space-y-1 sm:space-y-2">
                <p className="text-xs font-mono text-gray-300 tracking-wider">
                  {t('loading.project')}
                </p>
                <p className="text-xs font-mono text-gray-300 tracking-wider">
                  {t('loading.degree')}
                </p>
                
                {/* Author */}
                <div className="mt-3 sm:mt-4 pt-2 border-t border-gray-700">
                  <p className="text-xs font-mono text-gray-400 tracking-wider mb-1">
                    {t('loading.author')}
                  </p>
                  <p className="text-xs sm:text-sm font-mono text-white tracking-wider">
                    {t('loading.authorName')}
                  </p>
                </div>

                {/* Tutor */}
                <div className="mt-2 sm:mt-3">
                  <p className="text-xs font-mono text-gray-400 tracking-wider mb-1">
                    {t('loading.tutor')}
                  </p>
                  <p className="text-xs sm:text-sm font-mono text-white tracking-wider">
                    {t('loading.tutorName')}
                  </p>
                </div>

                {/* Co-Tutores */}
                <div className="mt-2 sm:mt-3">
                  <p className="text-xs font-mono text-gray-400 tracking-wider mb-1">
                    {t('loading.cotutors')}
                  </p>
                  <p className="text-xs sm:text-sm font-mono text-white tracking-wider">
                    {t('loading.cotutorsNames')}
                  </p>
                </div>
              </div>

              {/* Logos - Todos en una sola fila horizontal */}
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-700">
                <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 lg:gap-6">
                  {/* Logo Principal */}
                  <div className="text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 flex items-center justify-center logo-container">
                      <Image 
                        src="/logos/logo.png" 
                        alt="Solomon House Logo" 
                        width={128}
                        height={128}
                        className="w-full h-full object-contain opacity-90"
                      />
                    </div>
                  </div>

                  {/* Mincultura Distintivos */}
                  <div className="text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center logo-container">
                      <Image 
                        src="/logos/Mincultura_Distintivos-03.png" 
                        alt="Mincultura Distintivos" 
                        width={128}
                        height={128}
                        className="w-full h-full object-contain opacity-90"
                      />
                    </div>
                  </div>
                  
                  {/* Mincultura Objetivos Estratégicos */}
                  <div className="text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center logo-container">
                      <Image 
                        src="/logos/Mincultura_ObjetivosEstrategicos-04.png" 
                        alt="Mincultura Objetivos Estratégicos" 
                        width={128}
                        height={128}
                        className="w-full h-full object-contain opacity-90"
                      />
                    </div>
                  </div>

                  {/* UNAM Logo */}
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center logo-container">
                      <Image 
                        src="/logos/Picture1-removebg-preview.png" 
                        alt="UNAM Logo" 
                        width={96}
                        height={96}
                        className="w-full h-full object-contain filter brightness-0 invert opacity-90"
                      />
                    </div>
                  </div>
                  
                  {/* FaM Logo */}
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center logo-container">
                      <Image 
                        src="/logos/Picture2-removebg-preview.png" 
                        alt="FaM Logo" 
                        width={96}
                        height={96}
                        className="w-full h-full object-contain filter brightness-0 invert opacity-90"
                      />
                    </div>
                  </div>

                  {/* CEAM Logo */}
                  <div className="text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center logo-container">
                      <Image 
                        src="/logos/ceam.png" 
                        alt="CEAM Logo" 
                        width={128}
                        height={128}
                        className="w-full h-full object-contain opacity-90"
                      />
                    </div>
                  </div>

                  {/* Nanjing Logo */}
                  <div className="text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center logo-container">
                      <Image 
                        src="/logos/logoNanjing.svg" 
                        alt="Nanjing Logo" 
                        width={128}
                        height={128}
                        className="w-full h-full object-contain opacity-90"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Language Selector - Centered below logos */}
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-700">
                <LanguageSelector variant="loading-no-flag" className="language-selector" />
              </div>

              {/* Mención del Apoyo del Ministerio de las Culturas, las Artes y los Saberes */}
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-700">
                <div className="text-center space-y-2">
                  <p className="text-xs font-mono text-gray-400 tracking-wider">
                    {t('loading.ministrySupport')}
                  </p>
                  <p className="text-xs font-mono text-white tracking-wider">
                    {t('loading.ministryName')}
                  </p>
                  <p className="text-xs font-mono text-gray-300 tracking-wider">
                    {t('loading.ministryDirection')}
                  </p>
                  <p className="text-xs font-mono text-gray-300 tracking-wider">
                    {t('loading.ministryCall')}
                  </p>
                  <p className="text-xs font-mono text-gray-300 tracking-wider mt-2">
                    {t('loading.ministrySupportDescription')}
                  </p>
                </div>
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
