"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { LogOut, Menu, UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary">
                RoomReservation
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === "/" ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}
              >
                Home
              </Link>
              <Link
                href="/rooms"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  pathname === "/rooms" || pathname.startsWith("/rooms/") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Rooms
              </Link>
              {user && (
                <Link
                  href="/bookings"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === "/bookings" ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}
                >
                  My Bookings
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <UserIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href="/profile" className="w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/dashboard" className="w-full">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/auth">Sign In</Link>
              </Button>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                pathname === "/" ? "border-primary text-primary bg-primary-foreground/10" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/rooms"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                pathname === "/rooms" || pathname.startsWith("/rooms/") ? "border-primary text-primary bg-primary-foreground/10" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Rooms
            </Link>
            {user && (
              <>
                <Link
                  href="/bookings"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    pathname === "/bookings" ? "border-primary text-primary bg-primary-foreground/10" : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Bookings
                </Link>
                <Link
                  href="/dashboard"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link href="/profile" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>
                  Profile
                </Link>
              </>
            )}
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              >
                Log out
              </button>
            ) : (
              <Link href="/auth" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
