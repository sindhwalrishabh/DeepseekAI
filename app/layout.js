import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppContextProvider } from "@/context/AppContext";
import {Toaster} from "react-hot-toast";
import "./prism.css"
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});


export const metadata = {
  title: "DeepSeekAI",
  description: "fullstack project",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <AppContextProvider>
    <html lang="en">
      <body  className={`${inter.className} h-full antialiased`}>
        <Toaster toastOptions={{
          success: {
            style:{
              background: '#4ade80',
              color: '#fff', 
            }
          },
           error: {
            style:{
              background: '#f87171',
              color: '#fff', 
            } 
           }
        }}/>
        {children}</body>
    </html>
    </AppContextProvider>
    </ClerkProvider>

  );
}
