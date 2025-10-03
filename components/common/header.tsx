import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 mx-auto">
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
          <span className="text-xl font-semibold">Marketplace Mapper</span>
        </Link>

        <nav className="flex justify-end items-center gap-6 text-sm flex-1">
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

      </div>
    </header>
  )
}

export default Header;
