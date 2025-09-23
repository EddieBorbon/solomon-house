'use client';

interface SoundObjectFooterProps {
  className?: string;
}

export function SoundObjectFooter({ className = "" }: SoundObjectFooterProps) {
  return (
    <div className={`mt-6 pt-4 border-t border-gray-700 ${className}`}>
      <p className="text-xs text-gray-400 text-center">
        Los cambios se aplican en tiempo real
      </p>
    </div>
  );
}
