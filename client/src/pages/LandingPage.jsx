import { Link } from "react-router-dom";
import { Transition } from "@headlessui/react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";

// Using public URLs for static assets
const logo = '/assets/logo.png';
const boardScreenshot = '/assets/board-screenshot.png';

export default function LandingPage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <main className="flex-grow container mx-auto px-6 py-16 grid md:grid-cols-2 items-center gap-12">
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
            Challenge yourself in reverse. It’s not about winning — it’s about losing better than the bot!
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
      </main>

      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-800">
        {new Date().getFullYear()} BlundrBot. Made with ♟️ and bad decisions.
      </footer>
    </div>
  );
}
