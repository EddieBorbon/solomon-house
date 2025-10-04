import React from 'react';

interface QuotaWarningProps {
  isVisible: boolean;
  onDismiss: () => void;
  onCleanup: () => void;
}

export function QuotaWarning({ isVisible, onDismiss, onCleanup }: QuotaWarningProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-yellow-900/90 backdrop-blur-sm border border-yellow-600 rounded-lg p-4 text-white">
      <div className="flex items-start gap-3">
        <div className="text-yellow-400 text-xl">⚠️</div>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-200 mb-2">
            Cuota de Firestore Excedida
          </h3>
          <p className="text-sm text-yellow-100 mb-3">
            Has alcanzado los límites del plan gratuito de Firebase. 
            La aplicación funcionará en modo local hasta que resuelvas esto.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={onCleanup}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
            >
              🧹 Limpiar Datos
            </button>
            <button
              onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
            >
              🔧 Ir a Firebase Console
            </button>
            <button
              onClick={() => window.open('https://firebase.google.com/pricing', '_blank')}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
            >
              💳 Ver Planes
            </button>
          </div>
          
          <div className="text-xs text-yellow-200">
            <strong>Soluciones:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Limpiar datos existentes en Firestore</li>
              <li>Actualizar al plan Blaze (pay-as-you-go)</li>
              <li>Optimizar las consultas para reducir uso</li>
              <li>Usar modo local temporalmente</li>
            </ul>
          </div>
        </div>
        
        <button
          onClick={onDismiss}
          className="text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}



