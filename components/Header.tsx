import React from 'react';
import { MenuIcon } from './Icons';

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
    return (
        <header className="fixed top-0 left-0 right-0 bg-transparent z-20">
            <div className="container mx-auto px-4 h-14 flex items-center">
                <button aria-label="Menu" className="p-2 -ml-2">
                    <MenuIcon />
                </button>
            </div>
        </header>
    );
};

export default Header;