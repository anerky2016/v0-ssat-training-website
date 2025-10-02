import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl">
          <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="text-foreground">SSAT Prep</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#materials"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Materials
          </Link>
          <Link
            href="#sections"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Test Sections
          </Link>
          <Link
            href="#about"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link
            href="#contact"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            Sign In
          </Button>
          <Button size="sm" className="hidden sm:inline-flex">
            Get Started
          </Button>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="#materials"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                >
                  Materials
                </Link>
                <Link
                  href="#sections"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                >
                  Test Sections
                </Link>
                <Link
                  href="#about"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                >
                  About
                </Link>
                <Link
                  href="#contact"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                >
                  Contact
                </Link>
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t">
                  <div className="flex justify-center">
                    <ThemeToggle />
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    Sign In
                  </Button>
                  <Button className="w-full">Get Started</Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
