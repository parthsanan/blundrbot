import { Link } from "react-router-dom";
import { Transition } from "@headlessui/react";
import { ArrowRightIcon, PuzzlePieceIcon } from "@heroicons/react/20/solid";
import { useState, useEffect } from "react";

// Using public URLs for static assets
const logo = "/assets/logo.png";
const boardScreenshot = "/assets/boardScreenshot.png";
const puzzleScreenshot = "/assets/samplePuzzle.png";

export default function LandingPage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <main className="flex-grow container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 items-center gap-12 mb-20">
          <div>
            <div className="mb-8 flex items-center gap-4">
              <img src={logo} alt="Logo" className="h-14" />
              <h1 className="text-5xl md:text-6xl font-extrabold">
                <span className="text-gradient">Blundr</span>
                <span className="text-white">Bot</span>
              </h1>
            </div>
            <Transition
              show={show}
              enter="transition-opacity duration-1000"
              enterFrom="opacity-0"
              enterTo="opacity-100"
            >
              <h2 className="text-3xl md:text-4xl font-bold leading-snug tracking-tight">
                Try and lose to a chess engine that makes the{" "}
                <span className="text-purple-400">worst possible moves</span>.
              </h2>
            </Transition>
            <p className="text-gray-300 text-base mb-6">
              Challenge yourself in reverse. It's not about winning — it's about
              losing better than the bot!
            </p>
            <div className="flex gap-4">
              <Link
                to="/game"
                className="btn-accent flex items-center gap-2 shadow-lg"
              >
                Play Now <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                to="/puzzles"
                className="btn flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white shadow-lg"
              >
                Try Puzzles <PuzzlePieceIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <Transition
            show={show}
            enter="transition-opacity duration-1000 delay-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
          >
            <img
              src={boardScreenshot}
              alt="Preview"
              className="rounded-xl shadow-xl border border-gray-700"
            />
          </Transition>
        </div>

        <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700 mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-3">
                <span className="text-pink-400">Puzzles</span> Challenge
              </h2>
              <p className="text-lg text-gray-300 mb-4">
                Can <span className="text-red-400 font-semibold">you</span> find
                the{" "}
                <span className="text-red-400 font-semibold">worst move</span>{" "}
                in the position?
              </p>
              <p className="text-gray-300 text-sm mb-6">
                Our new Puzzles feature turns traditional chess puzzles upside
                down. Instead of finding the best move, your goal is to identify
                the worst possible move in each position. Perfect for
                understanding blunders and improving your chess by recognizing
                what to avoid.
              </p>
              <Link
                to="/puzzles"
                className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 px-5 py-2.5 rounded-xl text-base font-semibold transition shadow-lg"
              >
                Try Puzzles <PuzzlePieceIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex items-center">
              <img
                src={puzzleScreenshot}
                alt="Puzzle Screenshot"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-800">
        BlundrBot - Made with ♟️ and bad decisions.
      </footer>
    </div>
  );
}
