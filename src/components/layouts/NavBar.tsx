'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Navbar() {
  const { data: session } = useSession();
  const role = session?.user.role;
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href='/' className="text-2xl font-bold text-green-600">ArenaKu</Link>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-green-600 font-medium">Beranda</Link>
            <Link href="/cari-venue" className="text-gray-700 hover:text-green-600 font-medium">Venue</Link>
            <a href="#" className="text-gray-700 hover:text-green-600 font-medium">Cara Booking</a>
            <a href="#" className="text-gray-700 hover:text-green-600 font-medium">Tentang Kami</a>
          </div>

          {/* Auth buttons (desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <Link
                  href={role === 'OWNER' ? '/owner/dashboard' : '/profile'}
                  className="px-4 py-2 font-bold transition hover:bg-gray-200 rounded-lg"
                >
                  {role === 'OWNER' ? 'Owner Dashboard' : 'Profile'}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="cursor-pointer px-4 py-2 bg-red-500 text-white font-medium hover:bg-red-600 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="px-4 py-2 font-medium hover:bg-gray-100 rounded-lg">
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-green-500 text-white font-medium hover:bg-green-600 rounded-lg transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Hamburger Button */}
          <button className="md:hidden text-gray-700" onClick={toggleMenu}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden mt-4 space-y-4"
            >
              <Link href="/" className="block text-gray-700 hover:text-green-600 font-medium">Beranda</Link>
              <a href="#" className="block text-gray-700 hover:text-green-600 font-medium">Venue</a>
              <a href="#" className="block text-gray-700 hover:text-green-600 font-medium">Cara Booking</a>
              <a href="#" className="block text-gray-700 hover:text-green-600 font-medium">Tentang Kami</a>

              <div className="pt-4 border-t border-gray-200 space-y-2">
                {session ? (
                  <>
                    <Link
                      href={role === 'OWNER' ? '/owner/dashboard' : '/profile'}
                      className="block px-4 py-2 font-bold transition hover:bg-gray-100 rounded-lg"
                    >
                      {role === 'OWNER' ? 'Owner Dashboard' : 'Profile'}
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 bg-red-500 text-white font-medium hover:bg-red-600 rounded-lg transition"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="block px-4 py-2 font-medium hover:bg-gray-100 rounded-lg">
                      Login
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block px-4 py-2 bg-green-500 text-white font-medium hover:bg-green-600 rounded-lg transition"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}