"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Menu, LogOut, TrendingUp } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { AcademicCap, BookOpen as BookOpenIcon } from "@/components/ui/icon"
import { useSession, signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SignInDialog } from "@/components/sign-in-dialog"
import { ResumeButton } from "@/components/resume-button"
import { StudyReminder } from "@/components/study-reminder"
import { NotesButton } from "@/components/notes-button"
import { useState } from "react"

export function Header() {
  const { data: session, status } = useSession()
  const [showSignInDialog, setShowSignInDialog] = useState(false)
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl">
          <AcademicCap size="lg" className="text-primary" />
          <span className="text-foreground">SSAT Prep</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/#sections"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Test Sections
          </Link>
          <Link
            href="/progress"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Progress
          </Link>
          <Link
            href="/how-to"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            How To
          </Link>
          <Link
            href="/notes"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Notes
          </Link>
          <Link
            href="/about"
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
          <ResumeButton />
          <StudyReminder compact />
          <NotesButton />
          <ThemeToggle />

          {status === "loading" ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse hidden sm:block" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="hidden sm:flex">
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                    <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => setShowSignInDialog(true)}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => setShowSignInDialog(true)}
              >
                Get Started
              </Button>
            </>
          )}

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
                  href="/#sections"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                >
                  Test Sections
                </Link>
                <Link
                  href="/progress"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2 flex items-center gap-2"
                >
                  <TrendingUp className="h-5 w-5" />
                  Progress
                </Link>
                <Link
                  href="/how-to"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2 flex items-center gap-2"
                >
                  <BookOpen className="h-5 w-5" />
                  How To
                </Link>
                <Link
                  href="/notes"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                >
                  Notes
                </Link>
                <Link
                  href="/about"
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
                  {session ? (
                    <>
                      <div className="px-4 py-2 text-center">
                        <p className="text-sm font-medium">{session.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => signOut()}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => setShowSignInDialog(true)}
                      >
                        Sign In with Google
                      </Button>
                      <Button className="w-full" onClick={() => setShowSignInDialog(true)}>
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <SignInDialog open={showSignInDialog} onOpenChange={setShowSignInDialog} />
    </header>
  )
}
