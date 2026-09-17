'use client';

import Link from 'next/link';
import { usePortfolio } from '@/components/providers/portfolio-provider';
import { Button } from './Button';

export const Navbar = () => {
  const { isLoggedIn, currentUser, logout } = usePortfolio();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Portfolio App
        </Link>
        
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard">
                <span className="text-gray-700 hover:text-blue-600">Dashboard</span>
              </Link>
              <Link href="/portfolios">
                <span className="text-gray-700 hover:text-blue-600">My Portfolios</span>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => logout()}
              >
                Sign Out
              </Button>
              <span className="text-sm text-gray-600">
                {currentUser?.name}
              </span>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="secondary" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};