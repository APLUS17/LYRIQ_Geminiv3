
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Song, Section, Lyric } from './types';
import { getSyllableCount } from './services/syllableService';
import { UnderlineIcon, SyllableCountIcon, PlusIcon, TrashIcon, GeminiIcon } from './components/Icons';
import SectionModal from './components/SectionModal';
import GeminiActionModal from './components/GeminiActionModal';
import { GoogleGenAI, Type } from "@google/genai";
import RhymePopup from './components/RhymePopup';


const initialSectionId = crypto.randomUUID();
const initialSong: Song = {
  sections: [
    { id: initialSectionId, title: 'Intro', lyrics: [] }
  ],
};

const App: React.FC = () => {
    const [song, setSong] = useState<Song>(initialSong);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUnstructured, setIsUnstructured] = useState(true);
    const [showSyllableCount, setShowSyllableCount] = useState(false);
    const sectionEditorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const [activeSectionId, setActiveSectionId] = useState<string | null>(initialSectionId);
    const [geminiModalSectionId, setGeminiModalSectionId] = useState<string | null>(null);
    const geminiIconRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    // Rhyme popup state
    const [rhymePopup, setRhymePopup] = useState<{
        word: string;
        position: { top: number; left: number };
        rhymes: string[];
        isLoading: boolean;
    } | null>(null);
    const rhymeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Swipe-to-delete state
    const [dragState, setDragState] = useState<{
        sectionId: string;
        startX: number;
        isDragging: boolean;
        translateX: number;
    } | null>(null);
    const [deletingSections, setDeletingSections] = useState<Set<string>>(new Set());
    const deleteTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
    
    // Drag-and-drop reorder state
    const [reorderState, setReorderState] = useState<{
        sectionId: string;
        startIndex: number;
        initialY: number;
        currentY: number;
        draggedElHeight: number;
    } | null>(null);
    const [dropIndex, setDropIndex] = useState<number | null>(null);
    const longPressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const sectionContainerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
      document.execCommand('defaultParagraphSeparator', false, 'div');
      
      const timeouts = deleteTimeouts.current;
      return () => {
          timeouts.forEach(clearTimeout);
      };
    }, []);

    const clearRhymePopupAndTimeout = useCallback(() => {
        if (rhymeTimeoutRef.current) clearTimeout(rhymeTimeoutRef.current);
        rhymeTimeoutRef.current = null;
        setRhymePopup(null);
    }, []);
    
    const deleteSection = useCallback((sectionId: string) => {
        setSong(prevSong => ({
            ...prevSong,
            sections: prevSong.sections.filter(s => s.id !== sectionId)
        }));
        deleteTimeouts.current.delete(sectionId);
    }, []);

    const handleGestureStart = useCallback((e: React.MouseEvent | React.TouchEvent, sectionId: string) => {
        if (isUnstructured || reorderState) return;
        clearRhymePopupAndTimeout();

        const target = e.target as HTMLElement;
        if (target.isContentEditable || target.closest('[contenteditable="true"]')) {
            return;
        }

        const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
        }

        longPressTimeout.current = setTimeout(() => {
            const startIndex = song.sections.findIndex(s => s.id === sectionId);
            const draggedElHeight = sectionContainerRefs.current[sectionId]?.offsetHeight || 0;

            if (startIndex !== -1) {
                setReorderState({
                    sectionId,
                    startIndex,
                    initialY: startY,
                    currentY: startY,
                    draggedElHeight,
                });
                setDropIndex(startIndex);
                document.body.style.userSelect = 'none';
                document.body.style.cursor = 'grabbing';
            }
            setDragState(null); // Cancel swipe
            longPressTimeout.current = null;
        }, 300);

        setDragState({
            sectionId,
            startX,
            isDragging: true,
            translateX: 0,
        });
    }, [isUnstructured, song.sections, reorderState, clearRhymePopupAndTimeout]);

    const handleGestureMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (reorderState) {
            e.preventDefault();
            const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            setReorderState(prev => prev ? { ...prev, currentY } : null);

            let newDropIndex = reorderState.startIndex;
            const { startIndex } = reorderState;
            for (let i = 0; i < song.sections.length; i++) {
                if (i === startIndex) continue;
                const sectionId = song.sections[i].id;
                const ref = sectionContainerRefs.current[sectionId];
                if (ref) {
                    const rect = ref.getBoundingClientRect();
                    const midY = rect.top + rect.height / 2;
                    if (startIndex < i && currentY > midY) {
                        newDropIndex = i;
                    }
                    if (startIndex > i && currentY < midY) {
                        newDropIndex = i;
                        break;
                    }
                }
            }
            setDropIndex(newDropIndex);
            return;
        }

        if (!dragState || !dragState.isDragging) return;

        // Prevent page scroll on touch devices when swiping
        if ('touches' in e) {
            e.preventDefault();
        }
        
        const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const diff = currentX - dragState.startX;

        if (Math.abs(diff) > 5 && longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
            longPressTimeout.current = null;
        }

        if (longPressTimeout.current) return;

        const translateX = Math.min(0, diff);
        setDragState(prev => prev ? { ...prev, translateX } : null);
    }, [dragState, reorderState, song.sections]);
    
    const handleGestureEnd = useCallback(() => {
        if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
            longPressTimeout.current = null;
        }

        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        
        if (reorderState && dropIndex !== null) {
            const { startIndex } = reorderState;
            if (startIndex !== dropIndex) {
                setSong(prevSong => {
                    const newSections = [...prevSong.sections];
                    const [removed] = newSections.splice(startIndex, 1);
                    newSections.splice(dropIndex, 0, removed);
                    return { ...prevSong, sections: newSections };
                });
            }
        }
        setReorderState(null);
        setDropIndex(null);

        if (!dragState) return;
        const { sectionId, translateX } = dragState;
        const SWIPE_THRESHOLD = -window.innerWidth / 3.5;

        if (translateX < SWIPE_THRESHOLD) {
            setDeletingSections(prev => new Set(prev).add(sectionId));
            const timeoutId = setTimeout(() => {
                deleteSection(sectionId);
            }, 500);
            deleteTimeouts.current.set(sectionId, timeoutId);
        }
        
        setDragState(null);
    }, [dragState, deleteSection, reorderState, dropIndex]);
    
    useEffect(() => {
        const isInteracting = dragState?.isDragging || !!reorderState;
        if (isInteracting) {
            window.addEventListener('mousemove', handleGestureMove);
            window.addEventListener('touchmove', handleGestureMove, { passive: false });
            window.addEventListener('mouseup', handleGestureEnd);
            window.addEventListener('touchend', handleGestureEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleGestureMove);
            window.removeEventListener('touchmove', handleGestureMove);
            window.removeEventListener('mouseup', handleGestureEnd);
            window.removeEventListener('touchend', handleGestureEnd);
        };
    }, [dragState?.isDragging, reorderState, handleGestureMove, handleGestureEnd]);

    const parseLyricsFromDom = (node: HTMLDivElement): Lyric[] => {
        const lyrics: Lyric[] = [];
        if (node.innerText.trim() === '' && node.innerHTML.trim() === '') {
            return [];
        }

        const processHtmlContent = (html: string) => {
            if (html.toLowerCase().trim() === '<br>') {
                lyrics.push({ id: crypto.randomUUID(), html: '' });
            } else {
                html.split(/<br\s*\/?>/i).forEach(lineHtml => {
                    lyrics.push({ id: crypto.randomUUID(), html: lineHtml });
                });
            }
        };

        const blocks = Array.from(node.children).filter(el => ['DIV', 'P'].includes(el.nodeName));
        
        if (blocks.length > 0) {
            blocks.forEach(block => {
                processHtmlContent((block as HTMLElement).innerHTML);
            });
        } else {
             processHtmlContent(node.innerHTML);
        }

        return lyrics;
    };


    const handleLyricsInput = (sectionId: string, editorNode: HTMLDivElement) => {
        clearRhymePopupAndTimeout();
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
        setActiveSectionId(newSection.id);
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
        clearRhymePopupAndTimeout();
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };
    
    const handleTitlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain').replace(/(\r\n|\n|\r)/gm, ' ');
        document.execCommand('insertText', false, text);
    };

    const handleGeminiIconClick = (e: React.MouseEvent<HTMLButtonElement>, sectionId: string) => {
        e.stopPropagation();
        setGeminiModalSectionId(prevId => (prevId === sectionId ? null : sectionId));
    };

    const handleGeminiAction = (action: 'suggest' | 'rhyme' | 'rewrite') => {
        if (geminiModalSectionId) {
            console.log(`Action: ${action} on section: ${geminiModalSectionId}`);
            // Gemini API calls can be triggered from here
        }
    };

    const fetchRhymes = async (word: string, context: string) => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Given the lyric line "${context}", provide a list of up to 10 contextual rhyming words for "${word}". The rhymes should fit the mood and meaning of the line. Only return single words.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            rhymes: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        },
                        required: ['rhymes']
                    }
                }
            });
            
            const jsonText = response.text.trim();
            const result = JSON.parse(jsonText);
            const filteredRhymes = (result.rhymes || []).filter((r: unknown) => typeof r === 'string' && !r.includes(' '));


            if (filteredRhymes.length > 0) {
                setRhymePopup(prev => prev ? { ...prev, rhymes: filteredRhymes, isLoading: false } : null);
            } else {
                setRhymePopup(prev => prev ? { ...prev, isLoading: false, rhymes: ['No rhymes found.'] } : null);
            }
        } catch (error) {
            console.error("Error fetching rhymes:", error);
            setRhymePopup(prev => prev ? { ...prev, isLoading: false, rhymes: ['Error.'] } : null);
        }
    };

    const handleSelection = () => {
        if (rhymeTimeoutRef.current) clearTimeout(rhymeTimeoutRef.current);
        
        rhymeTimeoutRef.current = setTimeout(() => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
                setRhymePopup(null); return;
            }

            const range = selection.getRangeAt(0);
            const editorNode = (range.startContainer.parentElement as HTMLElement)?.closest('.lyric-editor');
            if (!editorNode) {
                setRhymePopup(null); return;
            }

            const selectedText = selection.toString().trim();

            if (selectedText && !selectedText.includes(' ') && selectedText.length > 1) {
                if (rhymePopup && rhymePopup.word === selectedText) return;

                const rect = range.getBoundingClientRect();
                const lineElement = (range.startContainer.nodeType === Node.TEXT_NODE
                    ? range.startContainer.parentElement
                    : range.startContainer as HTMLElement
                )?.closest('div');
                const context = lineElement ? lineElement.textContent || '' : '';

                setRhymePopup({
                    word: selectedText,
                    position: { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX },
                    rhymes: [],
                    isLoading: true,
                });
                fetchRhymes(selectedText, context);
            } else {
                setRhymePopup(null);
            }
        }, 750);
    };

    const anchorEl = geminiModalSectionId ? geminiIconRefs.current[geminiModalSectionId] : null;

    return (
        <div className="h-screen flex flex-col">
            <main className="flex-grow py-8 max-w-screen-xl mx-auto px-4 w-full h-full">
                <div className="bg-[#1c1c1e] rounded-lg h-full flex flex-col overflow-hidden">
                    <div className="relative flex items-center justify-between px-6 py-4 flex-shrink-0">
                        <h2 className="text-2xl font-bold text-gray-200">Lyriq</h2>
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
                        <SectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddSection={addSection} />
                    </div>

                    <div className="flex-grow overflow-y-auto" onScroll={clearRhymePopupAndTimeout}>
                        <div className="pt-6 px-6 pb-24">
                            {song.sections.map((section, index) => {
                                const isDeleting = deletingSections.has(section.id);
                                const currentTranslateX = (dragState?.sectionId === section.id) ? dragState.translateX : 0;
                                
                                const isBeingDragged = reorderState?.sectionId === section.id;
                                let containerStyle = {};
                                let containerClasses = `transition-transform duration-300 ease-in-out`;
                                
                                if (reorderState) {
                                    const { startIndex, currentY, initialY, draggedElHeight } = reorderState;
                                    const finalDropIndex = dropIndex ?? startIndex;

                                    if (isBeingDragged) {
                                        containerStyle = {
                                            transform: `translateY(${currentY - initialY}px)`,
                                            zIndex: 50,
                                            cursor: 'grabbing',
                                        };
                                        containerClasses = ''; // no transition while dragging
                                    } else {
                                        let isShifted = false;
                                        let shiftAmount = 0;
                                        if (startIndex < finalDropIndex && index > startIndex && index <= finalDropIndex) {
                                            isShifted = true;
                                            shiftAmount = -draggedElHeight - (isUnstructured ? 24 : 32); // mb-6 or mb-8
                                        } else if (startIndex > finalDropIndex && index < startIndex && index >= finalDropIndex) {
                                            isShifted = true;
                                            shiftAmount = draggedElHeight + (isUnstructured ? 24 : 32);
                                        }
                                        if (isShifted) {
                                            containerStyle = { transform: `translateY(${shiftAmount}px)` };
                                        }
                                    }
                                }
                                
                                return (
                                    <div key={section.id}>
                                        <div
                                            className={`transition-all duration-500 ease-in-out ${isUnstructured ? 'mb-0' : 'mb-8'} ${isDeleting ? 'max-h-0 opacity-0 !mb-0' : 'max-h-[500px]'}`}
                                        >
                                            <div
                                                ref={el => { sectionContainerRefs.current[section.id] = el; }}
                                                className={`relative ${containerClasses}`}
                                                style={containerStyle}
                                                onMouseDown={(e) => handleGestureStart(e, section.id)}
                                                onTouchStart={(e) => handleGestureStart(e, section.id)}
                                            >
                                                <div className={`absolute inset-0 rounded-lg flex justify-end items-center pr-8 pointer-events-none ${!isUnstructured ? 'bg-red-600' : ''}`}>
                                                    {!isUnstructured && <TrashIcon />}
                                                </div>

                                                <div
                                                    style={{ transform: `translateX(${currentTranslateX}px)` }}
                                                    className={`relative transition-all duration-500 ease-in-out ${dragState?.sectionId === section.id && dragState?.isDragging ? '!duration-0' : ''} ${isUnstructured ? 'bg-[#1c1c1e] shadow-none p-0 mb-6' : 'bg-[#2a2a2e] rounded-lg p-6 shadow-md'} ${isBeingDragged ? 'shadow-2xl scale-105' : ''}`}
                                                >
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <h3 
                                                            contentEditable
                                                            suppressContentEditableWarning
                                                            onInput={(e) => updateSectionTitle(section.id, e.currentTarget.innerText)}
                                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLHeadingElement).blur(); }}}
                                                            onPaste={handleTitlePaste}
                                                            className="w-fit text-gray-500 font-semibold tracking-wider text-sm uppercase outline-none focus:ring-1 focus:ring-gray-500 rounded-md"
                                                        >{section.title}</h3>
                                                        <button
                                                            ref={el => { geminiIconRefs.current[section.id] = el; }}
                                                            type="button"
                                                            aria-label="Gemini Actions"
                                                            onClick={(e) => handleGeminiIconClick(e, section.id)}
                                                            className={`transition-all duration-300 ease-in-out ${isUnstructured && activeSectionId === section.id ? 'w-[15px] opacity-100' : 'w-0 opacity-0'}`}
                                                            tabIndex={isUnstructured && activeSectionId === section.id ? 0 : -1}
                                                        >
                                                            <GeminiIcon className="h-[15px] w-[15px] text-blue-400 flex-shrink-0" />
                                                        </button>
                                                    </div>
                                                   
                                                    <div className="flex items-start">
                                                        <div
                                                            ref={el => { sectionEditorRefs.current[section.id] = el; }}
                                                            contentEditable
                                                            data-placeholder="Start writing..."
                                                            data-section-id={section.id}
                                                            onFocus={() => { clearRhymePopupAndTimeout(); setActiveSectionId(section.id); }}
                                                            onBlur={clearRhymePopupAndTimeout}
                                                            onMouseDown={clearRhymePopupAndTimeout}
                                                            onTouchStart={clearRhymePopupAndTimeout}
                                                            onMouseUp={handleSelection}
                                                            onTouchEnd={handleSelection}
                                                            onInput={e => handleLyricsInput(section.id, e.currentTarget as HTMLDivElement)}
                                                            onPaste={handlePaste}
                                                            className="lyric-editor flex-grow outline-none text-gray-200 text-lg leading-relaxed"
                                                        />
                                                        <div className={`font-mono text-gray-600 pl-4 w-12 text-right transition-opacity duration-300 ${showSyllableCount ? 'opacity-100' : 'opacity-0'}`}>
                                                            {section.lyrics.map(lyric => {
                                                                const count = getSyllableCount(lyric.html);
                                                                return (
                                                                    <div key={lyric.id} className="text-lg leading-relaxed">
                                                                        {count !== null ? count : '\u00A0'}
                                                                    </div>
                                                                );
                                                            })}
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
            {geminiModalSectionId && anchorEl && (
                <GeminiActionModal
                    anchorEl={anchorEl}
                    onClose={() => setGeminiModalSectionId(null)}
                    onAction={handleGeminiAction}
                />
            )}
            {rhymePopup && <RhymePopup {...rhymePopup} />}
        </div>
    );
};

export default App;
