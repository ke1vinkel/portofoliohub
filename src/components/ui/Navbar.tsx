'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './Button';

export const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          PortfolioHub
        </Link>
        
        <div className="flex items-center gap-4">
          {session ? (
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
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
              <span className="text-sm text-gray-600">
                {session.user?.name}
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