
import React, { useState, useRef, useEffect } from 'react';
import { Song, Section, Lyric } from './types';
import { getSyllableCount } from './services/syllableService';
import { UnderlineIcon, StrikethroughIcon, PlusIcon, MenuIcon } from './components/Icons';
import SectionModal from './components/SectionModal';

const initialSong: Song = {
  sections: [],
};

const App: React.FC = () => {
    const [song, setSong] = useState<Song>(initialSong);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectionStyles, setSelectionStyles] = useState({ isUnderlined: false, isStrikethrough: false });
    const sectionEditorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

    useEffect(() => {
        const handleSelectionChange = () => {
            setSelectionStyles({
                isUnderlined: document.queryCommandState('underline'),
                isStrikethrough: document.queryCommandState('strikeThrough'),
            });
        };
        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, []);
    
    useEffect(() => {
      // Use divs for new lines in contentEditable
      document.execCommand('defaultParagraphSeparator', false, 'div');
    }, []);

    const parseLyricsFromDom = (node: HTMLDivElement): Lyric[] => {
        const lyrics: Lyric[] = [];
        if (node.innerText.trim() === '') {
            return [];
        }

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

        // If the editor is not empty but no lyrics were parsed (e.g. just text nodes), capture the content
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

    const toggleStyle = (style: 'underline' | 'strikeThrough') => {
        document.execCommand(style, false, null);

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        
        const element = container.nodeType === Node.ELEMENT_NODE ? (container as Element) : container.parentElement;
        const editorNode = element?.closest('[contentEditable=true]');

        if (editorNode && 'dataset' in editorNode) {
            const sectionId = (editorNode as HTMLElement).dataset.sectionId;
            if (sectionId) {
                handleLyricsInput(sectionId, editorNode as HTMLDivElement);
            }
        }
    };

    const addSection = (title: string) => {
        const newSection: Section = {
            id: crypto.randomUUID(),
            title: title,
            lyrics: [],
        };
        setSong(prevSong => ({...prevSong, sections: [...prevSong.sections, newSection]}));
        setIsModalOpen(false);
    }
    
    const generateHtmlForSection = (lyrics: Lyric[]) => {
      if (lyrics.length === 0) return '<div><br></div>';
      return lyrics.map(l => `<div data-lyric-id="${l.id}">${l.html || '<br>'}</div>`).join('');
    };
    
    // Sync DOM if state changes from outside user input, but not for the active editor
    useEffect(() => {
        song.sections.forEach(section => {
            if (section.id === activeSectionId) {
                return; // Don't update the DOM for the active editor to avoid cursor jumps
            }
            const editorNode = sectionEditorRefs.current[section.id];
            if (editorNode) {
                const newHtml = generateHtmlForSection(section.lyrics);
                if (editorNode.innerHTML !== newHtml) {
                    editorNode.innerHTML = newHtml;
                }
            }
        });
    }, [song, activeSectionId]);

    return (
        <div className="h-screen flex flex-col">
            <main className="flex-grow py-8 container mx-auto px-4 overflow-y-auto">
                <div className="bg-[#1c1c1e] rounded-lg p-6">
                    <div className="relative flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <button aria-label="Menu" className="p-2 -ml-2 mr-4">
                                <MenuIcon />
                            </button>
                            <h2 className="text-2xl font-bold text-gray-200">Lyrics</h2>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button onClick={() => toggleStyle('underline')} aria-label="Underline">
                                <UnderlineIcon active={selectionStyles.isUnderlined} />
                            </button>
                            <button onClick={() => toggleStyle('strikeThrough')} aria-label="Strikethrough">
                                <StrikethroughIcon active={selectionStyles.isStrikethrough} />
                            </button>
                            <button onClick={() => setIsModalOpen(true)} aria-label="Add section">
                                <PlusIcon />
                            </button>
                        </div>
                        <SectionModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onAddSection={addSection}
                            existingSectionTitles={song.sections.map(s => s.title)}
                        />
                    </div>

                    {song.sections.map(section => (
                        <div key={section.id} className="bg-[#2a2a2e] rounded-lg p-6 shadow-md mb-8">
                            <h3 
                                contentEditable
                                suppressContentEditableWarning
                                onInput={(e) => updateSectionTitle(section.id, e.currentTarget.innerText)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        (e.target as HTMLHeadingElement).blur();
                                    }
                                }}
                                className="text-gray-500 font-semibold tracking-wider text-sm mb-3 uppercase outline-none focus:ring-1 focus:ring-gray-500 rounded-md"
                             >{section.title}</h3>
                            {section.lyrics.length > 0 ? (
                                <div className="flex items-start group">
                                    <div
                                        ref={el => { sectionEditorRefs.current[section.id] = el; }}
                                        contentEditable
                                        data-section-id={section.id}
                                        onFocus={() => setActiveSectionId(section.id)}
                                        onBlur={() => setActiveSectionId(null)}
                                        onInput={e => handleLyricsInput(section.id, e.currentTarget as HTMLDivElement)}
                                        className="lyric-editor flex-grow outline-none text-gray-200 text-lg leading-relaxed"
                                    />
                                    <div className="font-mono text-gray-600 pl-4 w-10 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                        {section.lyrics.map(lyric => (
                                            <div key={lyric.id} className="text-lg leading-relaxed h-[29px]">
                                                {getSyllableCount(lyric.html)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                               <div className="flex items-center justify-between group">
                                     <div
                                        className="lyric-input flex-grow outline-none text-gray-500 text-lg leading-relaxed italic cursor-text"
                                        onClick={() => {
                                            const newLyric = { id: crypto.randomUUID(), html: '' };
                                            setSong(prev => ({ ...prev, sections: prev.sections.map(s => s.id === section.id ? { ...s, lyrics: [newLyric] } : s) }));
                                            setTimeout(() => sectionEditorRefs.current[section.id]?.focus(), 0);
                                        }}
                                     >
                                        Start writing...
                                     </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default App;
