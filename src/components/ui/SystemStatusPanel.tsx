'use client';

export function SystemStatusPanel() {
  return (
    <div className="relative bg-black border border-white p-6 max-w-sm">
      {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      {/* Complex border decorations */}
      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-white"></div>
      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-white"></div>
      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-white"></div>
      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-white"></div>
      
      {/* Additional corner details */}
      <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t border-l border-white"></div>
      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t border-r border-white"></div>
      <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b border-l border-white"></div>
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b border-r border-white"></div>

      {/* Scanner line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute w-full h-1 bg-white shadow-lg shadow-white/80"
          style={{
            animation: 'scanner 3s linear infinite',
            top: '-8px'
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Title */}
        <div className="mb-4">
          <h2 className="text-lg font-mono font-bold text-white tracking-wider mb-2">
            La Casa de Salomon
          </h2>
          <div className="w-16 h-px bg-white"></div>
          <div className="w-12 h-px bg-gray-500 mt-1"></div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-sm font-mono text-gray-300 tracking-wide leading-relaxed">
            LOREM_IPSUM_DOLOR_SIT_AMET_CONSECTETUR_ADIPISCING_ELIT_SED_DO_EIUSMOD_TEMPOR_INCIDIDUNT_UT_LABORE_ET_DOLORE_MAGNA_ALIQUA_UT_ENIM_AD_MINIM_VENIAM_QUIS_NOSTRUD_EXERCITATION_ULLAMCO_LABORIS.
          </p>
        </div>

        {/* Audio Wave Visualization */}
        <div className="mb-4">
          <div className="text-xs font-mono text-gray-400 tracking-wider mb-2">
            AUDIO_WAVEFORM_ANALYSIS
          </div>
          <div className="flex items-end justify-between h-16 border border-gray-600 p-2">
            {/* Wave bars with different heights */}
            <div className="w-1 bg-white h-2"></div>
            <div className="w-1 bg-gray-300 h-4"></div>
            <div className="w-1 bg-white h-6"></div>
            <div className="w-1 bg-gray-300 h-3"></div>
            <div className="w-1 bg-white h-8"></div>
            <div className="w-1 bg-gray-300 h-5"></div>
            <div className="w-1 bg-white h-7"></div>
            <div className="w-1 bg-gray-300 h-2"></div>
            <div className="w-1 bg-white h-9"></div>
            <div className="w-1 bg-gray-300 h-4"></div>
            <div className="w-1 bg-white h-6"></div>
            <div className="w-1 bg-gray-300 h-3"></div>
            <div className="w-1 bg-white h-5"></div>
            <div className="w-1 bg-gray-300 h-7"></div>
            <div className="w-1 bg-white h-4"></div>
            <div className="w-1 bg-gray-300 h-6"></div>
            <div className="w-1 bg-white h-3"></div>
            <div className="w-1 bg-gray-300 h-5"></div>
            <div className="w-1 bg-white h-8"></div>
            <div className="w-1 bg-gray-300 h-2"></div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white tracking-wider">STATUS: ACTIVE</span>
          </div>
          <div className="text-gray-400 tracking-wider">
            CPU: 87%
          </div>
        </div>
      </div>

      {/* Bottom right corner indicator */}
      <div className="absolute bottom-2 right-2 w-4 h-4 border border-white flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}
