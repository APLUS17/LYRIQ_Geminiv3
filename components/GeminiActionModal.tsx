import React, { useEffect, useRef, useState } from 'react';

interface GeminiActionModalProps {
  anchorEl: HTMLElement;
  onClose: () => void;
  onAction: (action: 'suggest' | 'rhyme' | 'rewrite') => void;
}

const GeminiActionModal: React.FC<GeminiActionModalProps> = ({ anchorEl, onClose, onAction }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    const anchorRect = anchorEl.getBoundingClientRect();
    const modalWidth = 192; // w-48
    const left = Math.min(
      anchorRect.left + window.scrollX,
      window.innerWidth - modalWidth - 16 // 1rem padding from edge
    );
    setPosition({
      top: anchorRect.bottom + window.scrollY + 8, // 8px gap
      left: left,
    });

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [anchorEl, onClose]);

  const handleActionClick = (action: 'suggest' | 'rhyme' | 'rewrite') => {
    onAction(action);
    onClose();
  };

  return (
    <div
      ref={modalRef}
      style={{ top: position.top, left: position.left }}
      className="fixed bg-[#2a2a2e] text-gray-200 rounded-lg z-50 p-2 text-sm font-medium animate-fade-in-fast w-48"
    >
      <ul>
        <li>
          <button type="button" onClick={() => handleActionClick('suggest')} className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#3a3a3e] transition-colors">
            Suggest next line
          </button>
        </li>
        <li>
          <button type="button" onClick={() => handleActionClick('rhyme')} className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#3a3a3e] transition-colors">
            Suggest rhymes
          </button>
        </li>
        <li>
          <button type="button" onClick={() => handleActionClick('rewrite')} className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[#3a3a3e] transition-colors">
            Rewrite
          </button>
        </li>
      </ul>
    </div>
  );
};

export default GeminiActionModal;