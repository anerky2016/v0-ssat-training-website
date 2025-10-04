// Bing Site Authentication XML file
// This will be available at /BingSiteAuth.xml
export async function GET() {
  const xml = `<?xml version="1.0"?>
<users>
  <user>YOUR_BING_VERIFICATION_CODE</user>
</users>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
