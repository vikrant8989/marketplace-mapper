"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex justify-between h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-3 mr-6">
          <div className="h-10 w-10 rounded-xl bg-[oklch(0.6_0.22_264)] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-white"
              aria-hidden="true"
            >
              <rect width="7" height="7" x="3" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="14" rx="1" />
              <rect width="7" height="7" x="3" y="14" rx="1" />
            </svg>
          </div>
          <span className="text-xl font-semibold hidden sm:inline">Marketplace Mapper</span>
          <span className="text-xl font-semibold sm:hidden">MM</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex justify-end items-center gap-6 text-sm flex-1">
          <Link href="/marketplaces" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Marketplace
          </Link>
          <Link href="/uploadfile" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Files
          </Link>
          <Link href="/mapping" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Mappings
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <nav className="container px-4 py-4 flex flex-col gap-4">
            <Link 
              href="/marketplaces" 
              className="transition-colors hover:text-foreground/80 text-foreground/60 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Marketplace
            </Link>
            <Link 
              href="/uploadfile" 
              className="transition-colors hover:text-foreground/80 text-foreground/60 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Files
            </Link>
            <Link 
              href="/mapping" 
              className="transition-colors hover:text-foreground/80 text-foreground/60 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Mappings
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header