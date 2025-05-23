import { Link } from "react-router-dom";
import { Transition } from "@headlessui/react";
import { ArrowRightIcon, PuzzlePieceIcon } from "@heroicons/react/20/solid";
import { useState, useEffect, useCallback } from "react";
import Header from "../components/layout/Header";

// Using public URLs for static assets
const logo = '/assets/logo.png';
const boardScreenshot = '/assets/board-screenshot.png';

export default function LandingPage() {
  const [show, setShow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const checkIfMobile = useCallback(() => {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(isMobileDevice);
  }, []);

  useEffect(() => {
    checkIfMobile();
    setShow(true);
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [checkIfMobile]);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Mobile Support Coming Soon</h2>
          <p className="text-zinc-300">
            We're working on mobile support! For the best experience, please use a desktop or tablet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">      
      <main className="flex-grow container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 items-center gap-12 mb-20">
          <div>
            <div className="mb-8 flex items-center gap-4">    
              <img src={process.env.PUBLIC_URL + logo} alt="Logo" className="h-16"/>
              <h1 className="text-6xl md:text-7xl font-extrabold">
                <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  Blundr
                </span>
                <span className="text-white">Bot</span>
              </h1>
            </div>
            <Transition
              show={show}
              enter="transition-opacity duration-1000"
              enterFrom="opacity-0"
              enterTo="opacity-100"
            > 
              <h2 className="text-5xl font-bold leading-snug tracking-tight">
                Try and lose to a chess engine that makes the <span className="text-purple-400">worst possible moves</span>.
              </h2>
            </Transition>
            <p className="text-gray-300 mb-8">
              Challenge yourself in reverse. It's not about winning — it's about losing better than the bot!
            </p>
            <Link
              to="/game"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl text-lg font-semibold transition shadow-lg"
            >
              Play Now <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>

          <Transition
            show={show}
            enter="transition-opacity duration-1000 delay-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
          >
            <img
              src={process.env.PUBLIC_URL + boardScreenshot}
              alt="Preview"
              className="rounded-xl shadow-xl border border-gray-700"
            />
          </Transition>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                <span className="text-pink-400">Puzzles</span> Challenge
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                Can <span className="text-red-400 font-semibold">you</span> find the <span className="text-red-400 font-semibold">worst move</span> in the position?
              </p>
              <p className="text-gray-300 mb-8">
                Our new Puzzles feature turns traditional chess puzzles upside down. Instead of finding the best move, 
                your goal is to identify the worst possible move in each position. Perfect for understanding blunders 
                and improving your chess by recognizing what to avoid.
              </p>
              <Link
                to="/puzzles"
                className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded-xl text-lg font-semibold transition shadow-lg"
              > 
                Try Puzzles <PuzzlePieceIcon className="w-5 h-5" />
              </Link>
            </div>
          
            <img src={process.env.PUBLIC_URL + '/assets/samplePuzzle.png'} alt="Puzzle Screenshot" className="w-full h-auto mb-4" />
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-800">
        {new Date().getFullYear()} BlundrBot. Made with ♟️ and bad decisions.
      </footer>
    </div>
  );
}
