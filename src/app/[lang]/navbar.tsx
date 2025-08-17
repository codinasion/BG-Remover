"use client";

import { Scissors, X, Menu } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">BG Remover</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#use-cases"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Use Cases
            </a>
            <a
              href="#testimonials"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Reviews
            </a>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-700">
                Features
              </a>
              <a href="#use-cases" className="block px-3 py-2 text-gray-700">
                Use Cases
              </a>
              <a href="#testimonials" className="block px-3 py-2 text-gray-700">
                Reviews
              </a>
              <button className="w-full text-left bg-blue-600 text-white px-3 py-2 rounded-lg mt-2">
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
