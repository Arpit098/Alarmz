"use client"
import React, { useState } from 'react';
import AlarmzLogo from "../assets/images/AlarmzLogo.svg"
function NavbarTop() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="absolute inset-x-0 top-0">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <AlarmzLogo className="text-white" />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={toggleMenu}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
          <div className={`lg:flex lg:gap-x-12 ${isMenuOpen ? 'block' : 'hidden'} lg:block`}>
            <a href="#" className="text-sm font-semibold leading-6 text-gray-300">Home</a>
            <a href="#" className="text-sm font-semibold leading-6 text-gray-300">Transactions</a>
            <a href="#" className="text-sm font-semibold leading-6 text-gray-300">Update Info</a>
            <a href="#" className="text-sm font-semibold leading-6 text-gray-300">Help</a>
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a href="#" className="text-sm font-semibold leading-6 text-gray-900">Log in <span aria-hidden="true">→</span></a>
          </div>
        </nav>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="flex flex-col items-start space-y-2 p-6">
              <a href="#" className="block text-sm font-semibold leading-6 text-gray-900">Home</a>
              <a href="#" className="block text-sm font-semibold leading-6 text-gray-900">Transactions</a>
              <a href="#" className="block text-sm font-semibold leading-6 text-gray-900">Update Info</a>
              <a href="#" className="block text-sm font-semibold leading-6 text-gray-900">Help</a>
              <a href="#" className="block text-sm font-semibold leading-6 text-gray-900">Log in</a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export default NavbarTop;
