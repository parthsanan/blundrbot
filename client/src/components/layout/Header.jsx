import { memo } from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';
import logo from '../../assets/logo.png';

const Header = () => (
  <header className="border-b border-gray-800 py-4">
    <div className="px-6">
      <div className="container max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="group flex items-center gap-3">
                  <img src={logo} alt="Logo" className="h-12"/>
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  Blundr
                </span>
                <span className="text-white">Bot</span>
              </h1>
            </Link>
            <span className="hidden sm:inline-block text-gray-400 text-base">
              You vs. a chess engine with a death wish.
            </span>
          </div>
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-gray-300 hover:text-white px-4 py-2.5 rounded-lg text-base font-medium transition-colors"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default memo(Header);
