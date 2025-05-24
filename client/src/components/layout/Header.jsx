import { memo } from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';
const logo = '/assets/logo.png';

const Header = ({ activePage }) => (
  <header className="border-b border-gray-800 py-3 sm:py-4">
    <div className="px-4 sm:px-6">
      <div className="container max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6">
            <Link to="/" className="group flex items-center gap-2 sm:gap-3">
              <img src={process.env.PUBLIC_URL + logo} alt="Logo" className="h-10 sm:h-12"/>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  Blundr
                </span>
                <span className="text-white">Bot</span>
              </h1>
            </Link>
            <span className="hidden sm:inline-block text-gray-400 text-sm sm:text-base">
              You vs. a chess engine with a death wish.
            </span>
          </div>
          <nav className="flex items-center justify-between sm:justify-end gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-2 sm:mx-0 px-2 sm:px-0">
            <Link 
              to="/" 
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                activePage === 'home' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm">Home</span>
            </Link>
            <Link 
              to="/game" 
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                activePage === 'game' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 7H11V15H9V7Z" fill="currentColor" />
                <path d="M15 7H13V15H15V7Z" fill="currentColor" />
                <path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5ZM5 5H19V19H5V5Z" fill="currentColor" />
              </svg>
              <span className="text-xs sm:text-sm">Play</span>
            </Link>
            <Link 
              to="/puzzles" 
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                activePage === 'puzzles' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              <PuzzlePieceIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm">Puzzles</span>
            </Link>
          </nav>
        </div>
        <div className="mt-2 sm:hidden text-xs text-gray-500 italic">
          You vs. a chess engine with a death wish.
        </div>
      </div>
    </div>
  </header>
);

export default memo(Header);
