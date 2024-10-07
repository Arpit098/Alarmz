import React from 'react';
import NavbarTop from "./components/Navbar";
import './globals.css'; // Ensure this is pointing to your correct CSS file
import Hero from './components/Hero';
import InfoSection from './components/InfoSection';
import Transaction from './components/Transaction';

export default function Home() {
  return (
    <>
      <NavbarTop/>
      {/* <Hero/> */}
      <InfoSection/>   
      <Transaction/>
    </>
  );
}
