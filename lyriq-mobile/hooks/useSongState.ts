/**
 * useSongState Hook
 * Manages song state with persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { Song, Section, Lyric } from '../types';
import { generateId } from '../utils';
import { saveSong, loadSong } from '../services/storageService';

const initialSong: Song = {
  sections: [
    {
      id: generateId(),
      title: 'Intro',
      lyrics: [],
      takes: [],
    },
  ],
};

export function useSongState() {
  const [song, setSong] = useState<Song>(initialSong);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    initialSong.sections[0]?.id || null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load song from storage on mount
  useEffect(() => {
    loadSong()
      .then((loadedSong) => {
        if (loadedSong && loadedSong.sections.length > 0) {
          setSong(loadedSong);
          setActiveSectionId(loadedSong.sections[0].id);
        }
      })
      .catch((error) => {
        console.error('Error loading song:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Auto-save song to storage
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        saveSong(song);
      }, 1000); // Debounce saves by 1 second

      return () => clearTimeout(timer);
    }
  }, [song, isLoading]);

  // Add section
  const addSection = useCallback((title: string) => {
    const newSection: Section = {
      id: generateId(),
      title,
      lyrics: [],
      takes: [],
    };
    setSong((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    setActiveSectionId(newSection.id);
  }, []);

  // Update section title
  const updateSectionTitle = useCallback((sectionId: string, title: string) => {
    setSong((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, title } : section
      ),
    }));
  }, []);

  // Update section lyrics
  const updateSectionLyrics = useCallback((sectionId: string, lyrics: Lyric[]) => {
    setSong((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, lyrics } : section
      ),
    }));
  }, []);

  // Delete section
  const deleteSection = useCallback((sectionId: string) => {
    setSong((prev) => {
      const newSections = prev.sections.filter((s) => s.id !== sectionId);
      // Ensure at least one section remains
      if (newSections.length === 0) {
        return {
          sections: [
            {
              id: generateId(),
              title: 'Intro',
              lyrics: [],
              takes: [],
            },
          ],
        };
      }
      return { ...prev, sections: newSections };
    });

    // Update active section if the deleted one was active
    if (activeSectionId === sectionId) {
      setSong((currentSong) => {
        const remainingSections = currentSong.sections.filter((s) => s.id !== sectionId);
        if (remainingSections.length > 0) {
          setActiveSectionId(remainingSections[0].id);
        }
        return currentSong;
      });
    }
  }, [activeSectionId]);

  // Reorder sections
  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    setSong((prev) => {
      const newSections = [...prev.sections];
      const [removed] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, removed);
      return { ...prev, sections: newSections };
    });
  }, []);

  return {
    song,
    setSong,
    activeSectionId,
    setActiveSectionId,
    isLoading,
    addSection,
    updateSectionTitle,
    updateSectionLyrics,
    deleteSection,
    reorderSections,
  };
}
