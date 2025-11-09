
import React from 'react';

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (title: string) => void;
  existingSectionTitles: string[];
}

const ALL_SECTIONS = [
  'Intro', 'Pre-Chorus', 'Chorus', 'Refrain', 'Bridge', 'Verse',
  'Intro & Verse', 'Verse & Chorus', 'All Parts',
  'A Part', 'B Part', 'C Part'
];

const SectionModal: React.FC<SectionModalProps> = ({ isOpen, onClose, onAddSection, existingSectionTitles }) => {
  if (!isOpen) return null;

  const handleAdd = (title: string) => {
    onAddSection(title);
    onClose();
  };
  
  const fromYourSong = [...new Set<string>(existingSectionTitles)];
  const otherSections = ALL_SECTIONS.filter(s => !fromYourSong.includes(s));

  return (
    <>
        <div className="fixed inset-0 z-10" onClick={onClose}></div>
        <div onMouseDown={(e) => e.stopPropagation()} className="absolute top-12 right-0 w-56 bg-white text-gray-800 rounded-lg shadow-2xl z-20 p-2 text-sm font-medium animate-fade-in-fast">
        {fromYourSong.length > 0 && (
            <>
            <h3 className="font-mono text-xs text-gray-500 font-semibold px-3 pt-2 pb-1">FROM YOUR SONG</h3>
            <ul>
                {fromYourSong.map(title => (
                <li key={`existing-${title}`}>
                    <button type="button" onClick={() => handleAdd(title)} className="w-full text-left flex items-center space-x-3 px-3 py-1.5 rounded-md text-gray-900 hover:bg-gray-100 transition-colors">
                    <span className="text-gray-400 text-lg font-light">+</span>
                    <span>{title}</span>
                    </button>
                </li>
                ))}
            </ul>
            </>
        )}

        {otherSections.length > 0 && (
            <>
                <h3 className="font-mono text-xs text-gray-500 font-semibold px-3 pt-2 pb-1">OTHER</h3>
                <ul>
                    {otherSections.map(title => (
                    <li key={title}>
                        <button type="button" onClick={() => handleAdd(title)} className="w-full text-left flex items-center space-x-3 px-3 py-1.5 rounded-md text-gray-900 hover:bg-gray-100 transition-colors">
                        <span className="text-gray-400 text-lg font-light">+</span>
                        <span>{title}</span>
                        </button>
                    </li>
                    ))}
                </ul>
            </>
        )}
        </div>
    </>
  );
};

export default SectionModal;
