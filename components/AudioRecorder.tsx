
import React, { useState, useEffect } from 'react';
import { TrashIcon } from './Icons';

interface AudioRecorderProps {
    startTime: number;
    onSave: () => void;
    onCancel: () => void;
}

const CheckIcon: React.FC = () => (
    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);


const AudioRecorder: React.FC<AudioRecorderProps> = ({ startTime, onSave, onCancel }) => {
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(Date.now() - startTime);
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            <div className="max-w-screen-xl mx-auto px-4 pb-4">
                <div className="bg-red-600 rounded-lg shadow-2xl flex items-center justify-between p-4 animate-fade-in-fast">
                    <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full bg-white animate-pulse"></div>
                        <span className="font-mono text-white text-lg">{formatTime(elapsedTime)}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button type="button" onClick={onCancel} className="p-2 rounded-full hover:bg-red-700 transition-colors" aria-label="Cancel recording">
                            <TrashIcon />
                        </button>
                        <button type="button" onClick={onSave} className="p-2 rounded-full hover:bg-red-700 transition-colors" aria-label="Save take">
                            <CheckIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudioRecorder;
