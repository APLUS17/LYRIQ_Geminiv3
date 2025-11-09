
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Song, Section, Lyric } from './types';
import { getSyllableCount } from './services/syllableService';
import { UnderlineIcon, SyllableCountIcon, PlusIcon, TrashIcon } from './components/Icons';
import SectionModal from './components/SectionModal';

const initialSong: Song = {
  sections: [
    { id: crypto.randomUUID(), title: 'Intro', lyrics: [] }
  ],
};

const App: React.FC = () => {
    const [song, setSong] = useState<Song>(initialSong);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUnstructured, setIsUnstructured] = useState(true);
    const [showSyllableCount, setShowSyllableCount] = useState(false);
    const sectionEditorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

    // Swipe-to-delete state
    const [dragState, setDragState] = useState<{
        sectionId: string;
        startX: number;
        isDragging: boolean;
        translateX: number;
    } | null>(null);
    const [deletingSections, setDeletingSections] = useState<Set<string>>(new Set());
    const deleteTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
    
    useEffect(() => {
      document.execCommand('defaultParagraphSeparator', false, 'div');
      
      // Cleanup timeouts on unmount to prevent memory leaks
      const timeouts = deleteTimeouts.current;
      return () => {
          timeouts.forEach(clearTimeout);
      };
    }, []);
    
    const deleteSection = useCallback((sectionId: string) => {
        setSong(prevSong => ({
            ...prevSong,
            sections: prevSong.sections.filter(s => s.id !== sectionId)
        }));
    }, []);

    const handleGestureEnd = useCallback(() => {
        if (!dragState) return;
        const { sectionId, translateX } = dragState;
        const SWIPE_THRESHOLD = -window.innerWidth / 3.5;

        if (translateX < SWIPE_THRESHOLD) {
            setDeletingSections(prev => new Set(prev).add(sectionId));
            const timeoutId = setTimeout(() => {
                deleteSection(sectionId);
            }, 500);
            deleteTimeouts.current.push(timeoutId);
        }
        
        setDragState(null);
    }, [dragState, deleteSection]);

    const handleGestureMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!dragState || !dragState.isDragging) return;

        const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const diff = currentX - dragState.startX;
        const translateX = Math.min(0, diff); // Only allow swiping left

        setDragState(prev => prev ? { ...prev, translateX } : null);
    }, [dragState]);

    const handleGestureStart = useCallback((e: React.MouseEvent | React.TouchEvent, sectionId: string) => {
        if (isUnstructured) return;

        const target = e.target as HTMLElement;
        if (target.isContentEditable || target.closest('[contenteditable="true"]')) {
            return;
        }

        const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        setDragState({
            sectionId,
            startX,
            isDragging: true,
            translateX: 0,
        });
    }, [isUnstructured]);
    
    useEffect(() => {
        if (dragState?.isDragging) {
            window.addEventListener('mousemove', handleGestureMove);
            window.addEventListener('touchmove', handleGestureMove);
            window.addEventListener('mouseup', handleGestureEnd);
            window.addEventListener('touchend', handleGestureEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleGestureMove);
            window.removeEventListener('touchmove', handleGestureMove);
            window.removeEventListener('mouseup', handleGestureEnd);
            window.removeEventListener('touchend', handleGestureEnd);
        };
    }, [dragState?.isDragging, handleGestureMove, handleGestureEnd]);

    const parseLyricsFromDom = (node: HTMLDivElement): Lyric[] => {
        const lyrics: Lyric[] = [];
        if (node.innerText.trim() === '') return [];

        node.childNodes.forEach(childNode => {
            if (childNode.nodeType === Node.ELEMENT_NODE) {
                const el = childNode as HTMLElement;
                if (['DIV', 'P'].includes(el.nodeName)) {
                    const id = el.dataset.lyricId || crypto.randomUUID();
                    const html = el.innerHTML === '<br>' ? '' : el.innerHTML;
                    lyrics.push({ id, html });
                }
            }
        });

        if (lyrics.length === 0 && node.innerHTML) {
             lyrics.push({ id: crypto.randomUUID(), html: node.innerHTML });
        }
        return lyrics;
    };

    const handleLyricsInput = (sectionId: string, editorNode: HTMLDivElement) => {
        const newLyrics = parseLyricsFromDom(editorNode);
        setSong(prevSong => ({
            ...prevSong,
            sections: prevSong.sections.map(s =>
                s.id === sectionId ? { ...s, lyrics: newLyrics } : s
            )
        }));
    };

    const updateSectionTitle = (sectionId: string, newTitle: string) => {
        setSong(prevSong => ({
            ...prevSong,
            sections: prevSong.sections.map(section => section.id === sectionId ? {...section, title: newTitle} : section)
        }));
    };

    const addSection = (title: string) => {
        const newSection: Section = { id: crypto.randomUUID(), title: title, lyrics: [] };
        setSong(prevSong => ({...prevSong, sections: [...prevSong.sections, newSection]}));
        setIsModalOpen(false);
    }
    
    const generateHtmlForSection = (lyrics: Lyric[]) => {
      if (lyrics.length === 0) return '';
      return lyrics.map(l => `<div data-lyric-id="${l.id}">${l.html || '<br>'}</div>`).join('');
    };
    
    useEffect(() => {
        song.sections.forEach(section => {
            if (section.id === activeSectionId) return;
            const editorNode = sectionEditorRefs.current[section.id];
            if (editorNode) {
                const newHtml = generateHtmlForSection(section.lyrics);
                if (editorNode.innerHTML !== newHtml) editorNode.innerHTML = newHtml;
            }
        });
    }, [song, activeSectionId]);

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };
    
    const handleTitlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain').replace(/(\r\n|\n|\r)/gm, ' ');
        document.execCommand('insertText', false, text);
    };

    return (
        <div className="h-screen flex flex-col">
            <main className="flex-grow py-8 max-w-screen-xl mx-auto px-4 w-full h-full">
                <div className="bg-[#1c1c1e] rounded-lg h-full flex flex-col overflow-hidden">
                    <div className="relative flex items-center justify-between px-6 py-4 flex-shrink-0">
                        <h2 className="text-2xl font-bold text-gray-200">Lyrics</h2>
                        <div className="flex items-center space-x-4">
                            <button type="button" onClick={() => setIsUnstructured(prev => !prev)} aria-label="Toggle unstructured view">
                                <UnderlineIcon active={isUnstructured} />
                            </button>
                            <button type="button" onClick={() => setShowSyllableCount(prev => !prev)} aria-label="Toggle syllable count">
                                <SyllableCountIcon active={showSyllableCount} />
                            </button>
                            <button type="button" onClick={() => setIsModalOpen(true)} aria-label="Add section">
                                <PlusIcon />
                            </button>
                        </div>
                        <SectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddSection={addSection} existingSectionTitles={song.sections.map(s => s.title)} />
                    </div>

                    <div className="flex-grow overflow-y-auto">
                        <div className="pt-6 px-6 pb-24">
                            {song.sections.map(section => {
                                const isDeleting = deletingSections.has(section.id);
                                const currentTranslateX = (dragState?.sectionId === section.id) ? dragState.translateX : 0;
                                const totalSyllables = section.lyrics.reduce((sum, lyric) => sum + getSyllableCount(lyric.html), 0);
                                
                                return (
                                    <div key={section.id}>
                                        <div
                                            className={`transition-all duration-500 ease-in-out ${isUnstructured ? 'mb-0' : 'mb-8'} ${isDeleting ? 'max-h-0 opacity-0 !mb-0' : 'max-h-[500px]'}`}
                                        >
                                            <div
                                                className="relative"
                                                onMouseDown={(e) => handleGestureStart(e, section.id)}
                                                onTouchStart={(e) => handleGestureStart(e, section.id)}
                                                style={{ touchAction: 'pan-y' }}
                                            >
                                                <div className={`absolute inset-0 rounded-lg flex justify-end items-center pr-8 pointer-events-none ${!isUnstructured ? 'bg-red-600' : ''}`}>
                                                    {!isUnstructured && <TrashIcon />}
                                                </div>

                                                <div
                                                    style={{ transform: `translateX(${currentTranslateX}px)` }}
                                                    className={`relative transition-all duration-500 ease-in-out ${dragState?.sectionId === section.id && dragState?.isDragging ? '!duration-0' : ''} ${isUnstructured ? 'bg-[#1c1c1e] shadow-none p-0 mb-6' : 'bg-[#2a2a2e] rounded-lg p-6 shadow-md'}`}
                                                >
                                                    <h3 
                                                        contentEditable
                                                        suppressContentEditableWarning
                                                        onInput={(e) => updateSectionTitle(section.id, e.currentTarget.innerText)}
                                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLHeadingElement).blur(); }}}
                                                        onPaste={handleTitlePaste}
                                                        className="text-gray-500 font-semibold tracking-wider text-sm mb-3 uppercase outline-none focus:ring-1 focus:ring-gray-500 rounded-md"
                                                    >{section.title}</h3>
                                                   
                                                    <div className="flex items-start">
                                                        <div
                                                            ref={el => { sectionEditorRefs.current[section.id] = el; }}
                                                            contentEditable
                                                            data-placeholder="Start writing..."
                                                            data-section-id={section.id}
                                                            onFocus={() => setActiveSectionId(section.id)}
                                                            onBlur={() => {
                                                                setActiveSectionId(null)
                                                                const editorNode = sectionEditorRefs.current[section.id];
                                                                if (editorNode && editorNode.innerText.trim() === '') {
                                                                    handleLyricsInput(section.id, editorNode);
                                                                }
                                                            }}
                                                            onInput={e => handleLyricsInput(section.id, e.currentTarget as HTMLDivElement)}
                                                            onPaste={handlePaste}
                                                            className="lyric-editor flex-grow outline-none text-gray-200 text-lg leading-relaxed"
                                                        />
                                                        <div className={`font-mono text-gray-600 pl-4 w-12 text-right transition-opacity duration-300 ${showSyllableCount ? 'opacity-100' : 'opacity-0'}`}>
                                                            {section.lyrics.map(lyric => (
                                                                <div key={lyric.id} className="text-lg leading-relaxed h-[29px]">
                                                                    {getSyllableCount(lyric.html)}
                                                                </div>
                                                            ))}
                                                            {section.lyrics.length > 1 && (
                                                                <>
                                                                    <div className="border-t border-gray-700 my-2 -mr-2"></div>
                                                                    <div className="text-lg leading-relaxed h-[29px] font-bold text-gray-500">
                                                                        {totalSyllables}
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;