import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
} from '@clerk/nextjs'
const inter = Inter({ subsets: ["latin"] });
import { ptBR } from "@clerk/localizations";
 import 'react-toastify/dist/ReactToastify.css';
import Header from "@/components/layout/header/header";
import toast, { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "Ourofino - Alianças ",
  description: "Loja de alianças e jóias",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  

  return (
    <ClerkProvider localization={ptBR}>
      <html lang="en">

        <body className={inter.className}>
          <Header />
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )

}
