
import React from 'react';

interface RhymePopupProps {
  position: { top: number; left: number };
  word: string;
  rhymes: string[];
  isLoading: boolean;
}

const LoadingDots: React.FC = () => (
    <div className="flex space-x-1 justify-center items-center h-12">
        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
    </div>
);

const RhymePopup: React.FC<RhymePopupProps> = ({ position, word, rhymes, isLoading }) => {
  return (
    <div
      style={{ top: position.top + 8, left: position.left }}
      className="fixed bg-[#2a2a2e] text-gray-200 rounded-lg shadow-2xl z-50 p-3 text-sm font-medium animate-fade-in-fast w-48"
    >
      <h4 className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 border-b border-gray-500 pb-1 px-1">
        Rhymes for "{word}"
      </h4>
      {isLoading ? (
        <LoadingDots />
      ) : (
        <ul className="space-y-1 max-h-48 overflow-y-auto">
          {rhymes.length > 0 && !rhymes.includes('Error.') && !rhymes.includes('No rhymes found.') ? (
            rhymes.map((rhyme) => (
              <li key={rhyme} className="px-2 py-0.5 rounded hover:bg-[#3a3a3e] transition-colors cursor-pointer">
                {rhyme}
              </li>
            ))
          ) : (
            <li className="text-gray-500 italic px-2 py-1">{rhymes[0] || 'No suggestions.'}</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default RhymePopup;
