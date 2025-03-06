import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import AuthProvider from "@/components/AuthContext";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata = {
  title: 'StreamVault',
  description: 'Your personal streaming guide',
}

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <html lang="en" className="scroll-smooth">
        <body className={`${inter.className} min-h-screen flex flex-col`}>
          <Navbar />
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </AuthProvider>
  );
}
