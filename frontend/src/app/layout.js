import localFont from "next/font/local";
import "./globals.css";
import {NextUIProvider} from "@nextui-org/react";

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body > 
        {/* <div className=" gradient "></div> */}
        <NextUIProvider>
      
        {children}
        
        </NextUIProvider>
      </body>
    </html>
  );
}
