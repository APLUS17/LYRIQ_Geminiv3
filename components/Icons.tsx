import React from 'react';

const iconProps = {
    className: "h-6 w-6 text-gray-300 hover:text-white transition-colors",
    strokeWidth: 1.5,
};

export const MenuIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

export const UndoIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
);

export const RedoIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
    </svg>
);

export const ShareIcon: React.FC = () => (
    <svg {...iconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

const editorIconProps = {
    className: "h-5 w-5",
};

export const UnderlineIcon: React.FC<{ active: boolean }> = ({ active }) => (
    <span className={`font-sans text-xl font-bold tracking-tighter cursor-pointer ${active ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>U</span>
);

export const StrikethroughIcon: React.FC<{ active: boolean }> = ({ active }) => (
     <span className={`font-sans text-xl font-bold tracking-tighter cursor-pointer ${active ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>S</span>
);

export const PlusIcon: React.FC = () => (
    <svg {...editorIconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-gray-500 hover:text-gray-300 cursor-pointer">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);