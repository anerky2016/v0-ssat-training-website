/**
 * Polyfills for Node.js environment
 * These are required for libraries that use browser APIs during SSR
 */

// Polyfill DOMMatrix for Node.js (required by react-reader/EPUB.js)
if (typeof global !== 'undefined' && typeof global.DOMMatrix === 'undefined') {
  // Simple identity matrix polyfill for SSR
  global.DOMMatrix = class DOMMatrix {
    constructor() {
      this.a = 1
      this.b = 0
      this.c = 0
      this.d = 1
      this.e = 0
      this.f = 0
    }
  }
}

// Export to make it importable
export {}
