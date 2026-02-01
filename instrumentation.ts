/**
 * Next.js Instrumentation Hook
 * This runs once when the server starts
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Load polyfills for Node.js environment
    await import('./lib/polyfills')
  }
}
