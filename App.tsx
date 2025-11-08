
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
    const [isUnstructuredMode, setIsUnstructuredMode] = useState(false);
    const [isStrikethroughActive, setIsStrikethroughActive] = useState(false);
    const sectionEditorRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

    useEffect(() => {
        const handleSelectionChange = () => {
            setIsStrikethroughActive(document.queryCommandState('strikeThrough'));
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

        // If the editor is not empty but no lyrics were parsed (e