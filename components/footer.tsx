import Link from "next/link"
import { BookOpen } from "lucide-react"

export function Footer() {
  return (
    <footer id="contact" className="border-t bg-muted/30 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-base sm:text-lg mb-3 sm:mb-4">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-foreground">SSAT Prep</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Comprehensive training materials for Middle Level SSAT success.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-muted-foreground/60">
                  Practice Tests <span className="text-xs">(Coming Soon)</span>
                </span>
              </li>
              <li>
                <span className="text-muted-foreground/60">
                  Study Guides <span className="text-xs">(Coming Soon)</span>
                </span>
              </li>
              <li>
                <span className="text-muted-foreground/60">
                  Video Lessons <span className="text-xs">(Coming Soon)</span>
                </span>
              </li>
              <li>
                <span className="text-muted-foreground/60">
                  Flashcards <span className="text-xs">(Coming Soon)</span>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; 2025 SSAT Prep. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
