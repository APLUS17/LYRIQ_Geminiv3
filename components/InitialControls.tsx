import React, { useRef } from 'react';
import { MusicNoteIcon } from './Icons';

const AddBeatIcon: React.FC = () => (
    <span className="relative inline-flex items-center justify-center">
        <MusicNoteIcon />
        <svg className="absolute -top-1 -right-1 h-2.5 w-2.5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
        </svg>
    </span>
);

interface InitialControlsProps {
    onAddBeat: (file: File) => void;
}

const InitialControls: React.FC<InitialControlsProps> = ({ onAddBeat }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddBeatClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onAddBeat(file);
        }
    };

    return (
        <div className="lyriq-initial-controls">
            <button type="button" onClick={handleAddBeatClick} className="lyriq-initial-btn" aria-label="Add beat from file">
                <AddBeatIcon />
                <span>Add Beat</span>
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/wav,audio/mpeg,audio/mp3,audio/ogg,audio/flac,audio/aac,audio/*,.wav"
                className="visually-hidden"
                aria-hidden="true"
            />
        </div>
    );
};

export default InitialControls;