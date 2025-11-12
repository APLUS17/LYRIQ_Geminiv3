
import React, { useState, useEffect, useRef } from 'react';
import { Section } from '../types';
import { generateWaveform } from '../services/waveformService';
import { PlayIcon, PauseIcon, TrashIcon, NextIcon, PreviousIcon } from './Icons';

interface BottomTakesPlayerProps {
    section: Section;
    onClose: () => void;
    onDeleteTake: (takeId: string, sectionId: string) => void;
}

const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60).toString();
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const BottomTakesPlayer: React.FC<BottomTakesPlayerProps> = ({ section, onClose, onDeleteTake }) => {
    const [playerState, setPlayerState] = useState<'peeking' | 'expanded'>('peeking');
    const [isVisible, setIsVisible] = useState(false);
    
    const [currentTakeIndex, setCurrentTakeIndex] = useState(section.takes.length > 0 ? section.takes.length - 1 : 0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [waveform, setWaveform] = useState<number[]>([]);
    const [isLoadingWaveform, setIsLoadingWaveform] = useState(true);

    const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
    const waveformContainerRef = useRef<HTMLDivElement | null>(null);
    const isScrubbingRef = useRef(false);

    const currentTake = section.takes[currentTakeIndex];

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); 
    };
    
    useEffect(() => {
        if (!currentTake) {
            if (section.takes.length === 0) handleClose();
            return;
        }

        setIsLoadingWaveform(true);
        generateWaveform(currentTake.data, 80).then(data => {
            setWaveform(data);
            setIsLoadingWaveform(false);
        });
        
        const audio = new Audio(currentTake.url);
        audioPlayerRef.current = audio;
        setProgress(0);

        const handleTimeUpdate = () => {
            if (!isScrubbingRef.current && audio.duration) {
                setProgress(audio.currentTime / audio.duration);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            if (currentTakeIndex < section.takes.length - 1) {
                setCurrentTakeIndex(prev => prev + 1);
            } else {
                 setProgress(0);
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        
        if (isPlaying) {
            audio.play().catch(e => console.error("Error playing audio:", e));
        }

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
        };
    }, [currentTake]);
    
    useEffect(() => {
        if (section.takes.length > 0) {
            setCurrentTakeIndex(prev => Math.min(prev, section.takes.length - 1));
        } else {
            handleClose();
        }
    }, [section.takes.length]);

    const handlePlayPause = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPlaying) {
            audioPlayerRef.current?.pause();
        } else {
            audioPlayerRef.current?.play().catch(err => console.error("Playback error:", err));
        }
        setIsPlaying(!isPlaying);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentTakeIndex > 0) setCurrentTakeIndex(prev => prev - 1);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentTakeIndex < section.takes.length - 1) setCurrentTakeIndex(prev => prev + 1);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentTake) {
            onDeleteTake(currentTake.id, section.id);
        }
    };
    
    const handleScrub = (e: React.MouseEvent | React.TouchEvent) => {
        if (!waveformContainerRef.current || !audioPlayerRef.current || !audioPlayerRef.current.duration) return;
        
        const rect = waveformContainerRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const newProgress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        
        setProgress(newProgress);
        audioPlayerRef.current.currentTime = newProgress * audioPlayerRef.current.duration;
    };

    const handleScrubStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        isScrubbingRef.current = true;
        handleScrub(e);
    };

    const handleScrubMove = (e: MouseEvent | TouchEvent) => {
        if (isScrubbingRef.current) handleScrub(e as any);
    };

    const handleScrubEnd = () => {
        isScrubbingRef.current = false;
    };
    
    useEffect(() => {
        window.addEventListener('mousemove', handleScrubMove);
        window.addEventListener('touchmove', handleScrubMove);
        window.addEventListener('mouseup', handleScrubEnd);
        window.addEventListener('touchend', handleScrubEnd);
        return () => {
            window.removeEventListener('mousemove', handleScrubMove);
            window.removeEventListener('touchmove', handleScrubMove);
            window.removeEventListener('mouseup', handleScrubEnd);
            window.removeEventListener('touchend', handleScrubEnd);
        };
    }, []);

    if (!currentTake) return null;

    const currentTime = audioPlayerRef.current ? progress * audioPlayerRef.current.duration : 0;
    const totalDuration = audioPlayerRef.current?.duration || currentTake.duration;

    const playerClassName = `peek-takes-player ${isVisible ? playerState : ''}`;
    
    return (
        <div className={playerClassName}>
            <div className="peek-modal-handle-container" onClick={() => setPlayerState(prev => prev === 'peeking' ? 'expanded' : 'peeking')}>
                <div className="peek-modal-handle"></div>
            </div>

            <div className="peek-modal-peek-header">
                <div className="peek-peek-song-info">
                    <h2>Take #{currentTakeIndex + 1} - {section.title}</h2>
                    <span>{formatDuration(currentTime)} / {formatDuration(totalDuration)}</span>
                </div>
                <div className="peek-peek-controls">
                    <button type="button" onClick={handlePrev} disabled={currentTakeIndex === 0} className="disabled:opacity-30 text-white p-1"><PreviousIcon /></button>
                    <button type="button" onClick={handlePlayPause} className="bg-white text-black rounded-full p-2">
                        {isPlaying ? <PauseIcon className="h-5 w-5"/> : <PlayIcon className="h-5 w-5"/>}
                    </button>
                    <button type="button" onClick={handleNext} disabled={currentTakeIndex >= section.takes.length - 1} className="disabled:opacity-30 text-white p-1"><NextIcon/></button>
                </div>
            </div>

            <div className="peek-modal-expanded-content">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-sm">
                        <p className="text-gray-200 font-bold">Take #{currentTakeIndex + 1} of {section.takes.length}</p>
                        <p className="text-gray-400">{section.title}</p>
                    </div>
                     <button type="button" onClick={handleDelete} className="text-gray-400 hover:text-white p-1"><TrashIcon/></button>
                </div>

                <div 
                    ref={waveformContainerRef}
                    className="relative h-16 w-full flex items-center cursor-pointer my-2"
                    onMouseDown={handleScrubStart}
                    onTouchStart={handleScrubStart}
                >
                    {isLoadingWaveform ? (
                         <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Generating waveform...</div>
                    ) : (
                        <>
                            <div className="w-full h-full flex items-center space-x-0.5">
                                {waveform.map((val, i) => (
                                    <div key={i} className="bg-gray-500 rounded-sm" style={{ width: '100%', height: `${Math.max(2, val * 100)}%` }} />
                                ))}
                            </div>
                            <div className="absolute top-0 left-0 h-full flex items-center space-x-0.5 overflow-hidden" style={{ width: `${progress * 100}%`}}>
                                {waveform.map((val, i) => (
                                    <div key={i} className="bg-yellow-400 rounded-sm flex-shrink-0" style={{ width: `${waveformContainerRef.current ? waveformContainerRef.current.clientWidth / waveform.length : 0}px`, height: `${Math.max(2, val * 100)}%` }} />
                                ))}
                            </div>
                            <div className="absolute top-0 h-full w-0.5 bg-yellow-400" style={{ left: `${progress * 100}%` }} />
                        </>
                    )}
                </div>
                 <div className="flex justify-between items-center mt-2">
                    <p className="font-mono text-xs text-gray-400">{formatDuration(currentTime)}</p>
                    <div className="flex items-center space-x-4">
                        <button type="button" onClick={handlePrev} disabled={currentTakeIndex === 0} className="disabled:opacity-30 text-white p-1"><PreviousIcon /></button>
                        <button type="button" onClick={handlePlayPause} className="bg-white text-black rounded-full p-2">
                            {isPlaying ? <PauseIcon className="h-6 w-6"/> : <PlayIcon className="h-6 w-6"/>}
                        </button>
                        <button type="button" onClick={handleNext} disabled={currentTakeIndex >= section.takes.length - 1} className="disabled:opacity-30 text-white p-1"><NextIcon/></button>
                    </div>
                    <p className="font-mono text-xs text-gray-400">{formatDuration(totalDuration)}</p>
                </div>
            </div>
        </div>
    );
};

export default BottomTakesPlayer;
