# SEO Implementation TODOs

## Completed ✓
- [x] Enhanced metadata in root layout with comprehensive meta tags
- [x] Added Open Graph tags for social media sharing
- [x] Added Twitter card support
- [x] Created auto-generated sitemap (sitemap.ts)
- [x] Created robots.txt configuration (robots.ts)
- [x] Created web app manifest for PWA support (manifest.ts)
- [x] **Google SEO Optimizations:**
  - [x] Added JSON-LD structured data components (StructuredData, Course, Breadcrumb, FAQ, LearningResource)
  - [x] Created reusable SEO metadata utility (lib/seo.ts)
  - [x] Added page-specific metadata to home, math, and verbal pages
  - [x] Implemented breadcrumb structured data for navigation
  - [x] Added Course schema markup for educational content
  - [x] Optimized viewport configuration
  - [x] Enabled compression and modern optimizations in Next.js config
  - [x] Configured for Google Core Web Vitals (reactStrictMode, swcMinify, optimizeFonts)
  - [x] Added keyword optimization for main sections
- [x] **Bing SEO Optimizations:**
  - [x] Added Bing-specific robots directives (bingbot configuration)
  - [x] Enhanced Open Graph tags (Bing heavily weights these)
  - [x] Added author metadata (Bing prefers explicit author information)
  - [x] Added publish date metadata for content freshness ranking
  - [x] Enhanced structured data with Bing-preferred fields (knowsAbout, sameAs, isAccessibleForFree)
  - [x] Changed locale format to 'en-US' (Bing preference)
  - [x] Added Bing verification tag placeholder (msvalidate.01)
  - [x] Created BingSiteAuth.xml file for Webmaster Tools verification
  - [x] Optimized Course schema with educational credentials
- [x] **Facebook SEO Optimizations:**
  - [x] Enhanced Open Graph metadata with Facebook-recommended image dimensions (1200x630)
  - [x] Added Open Graph image alt text for accessibility
  - [x] Implemented article-type Open Graph for educational content
  - [x] Added Facebook article metadata (section, tags, authors)
  - [x] Added fb:app_id placeholder for Facebook App integration
  - [x] Optimized Open Graph type switching (website vs article)
  - [x] Added comprehensive Facebook sharing metadata

## Configuration Required
- [ ] Add `NEXT_PUBLIC_BASE_URL` environment variable to `.env` file with production URL
  - Example: `NEXT_PUBLIC_BASE_URL=https://yourdomain.com`
  - Required for correct sitemap URLs, canonical links, and structured data
- [ ] Add `NEXT_PUBLIC_BING_VERIFICATION` environment variable with Bing verification code
  - Get this from Bing Webmaster Tools after adding your site
  - Example: `NEXT_PUBLIC_BING_VERIFICATION=ABC123DEF456`
- [ ] Update `public/BingSiteAuth.xml` with actual Bing authentication code
  - Replace PLACEHOLDER_BING_AUTH_CODE with code from Bing Webmaster Tools
- [ ] Add Facebook App ID (optional but recommended for Facebook Insights)
  - Create a Facebook App at developers.facebook.com
  - Pass fbAppId parameter in generateMetadata calls
  - Enables Facebook Analytics and Insights for shared links

## Content Optimization
- [x] Add unique meta descriptions to main pages (home, math, verbal)
- [x] Add structured data (JSON-LD) for educational content
- [x] Optimize page titles for main sections with relevant keywords
- [ ] Add unique meta descriptions to individual topic pages (fractions, decimals, etc.)
- [ ] Add structured data to all lesson pages
- [ ] Add alt text to all images

## Social Media Assets
- [ ] Create and add Open Graph image for Facebook sharing (1200x630px - Facebook's recommended size)
  - Must be at least 600x314px for link sharing
  - Use high-quality images with minimal text overlay
  - Place in /public folder and reference in metadata
- [ ] Create and add Twitter card image (1200x675px or 2:1 ratio)
- [ ] Update manifest icons with actual logo/favicon files
  - [ ] Generate favicon.ico
  - [ ] Generate multiple sizes: 16x16, 32x32, 192x192, 512x512
- [ ] Test Facebook sharing with Facebook Sharing Debugger
- [ ] Test how links appear in Facebook feed previews

## Performance & Technical SEO
- [x] Enable compression in production
- [x] Configure Next.js optimizations (reactStrictMode, swcMinify, optimizeFonts)
- [x] Remove powered-by header for security
- [ ] Set up proper caching headers
- [ ] Optimize images (use Next.js Image component)
- [ ] Add loading states and skeleton screens for better UX
- [ ] Implement lazy loading for below-the-fold content

## Google-Specific Monitoring & Setup
- [ ] Set up Google Search Console
  - [ ] Verify domain ownership
  - [ ] Submit sitemap XML (automatically available at /sitemap.xml)
  - [ ] Request indexing for main pages
- [ ] Set up Google Analytics 4
- [ ] Monitor Google Core Web Vitals in Search Console
  - [ ] Check Largest Contentful Paint (LCP)
  - [ ] Check First Input Delay (FID)
  - [ ] Check Cumulative Layout Shift (CLS)
- [ ] Use Google's Rich Results Test to verify structured data
- [ ] Monitor keyword rankings in Google Search Console
- [ ] Set up Google PageSpeed Insights monitoring
- [ ] Check mobile-friendliness with Google's Mobile-Friendly Test

## Bing-Specific Monitoring & Setup
- [ ] Set up Bing Webmaster Tools
  - [ ] Verify domain ownership (use BingSiteAuth.xml or meta tag method)
  - [ ] Submit sitemap XML at /sitemap.xml
  - [ ] Use "Submit URL" feature for important pages
  - [ ] Import data from Google Search Console (optional shortcut)
- [ ] Configure Bing Places for Business (if applicable)
- [ ] Monitor Bing SEO Reports
  - [ ] Check crawl stats and errors
  - [ ] Review SEO reports and recommendations
  - [ ] Monitor keyword research data
- [ ] Use Bing's Markup Validator to verify structured data
- [ ] Monitor Bing ranking positions
- [ ] Set up Bing URL Inspection tool for key pages
- [ ] Check mobile-friendliness in Bing Mobile Friendliness Test Tool

## Facebook-Specific Setup & Monitoring
- [ ] Set up Facebook Domain Verification
  - [ ] Add meta tag or HTML file verification
  - [ ] Verify domain in Facebook Business Manager
- [ ] Create Facebook App (optional but recommended)
  - [ ] Get App ID from developers.facebook.com
  - [ ] Add App ID to metadata for Facebook Insights
- [ ] Test Open Graph tags with Facebook Sharing Debugger
  - [ ] Visit https://developers.facebook.com/tools/debug/
  - [ ] Test all main pages and fix any warnings
  - [ ] Scrape pages after updates to refresh cache
- [ ] Monitor Facebook Insights (requires App ID)
  - [ ] Track link shares and engagement
  - [ ] Monitor referral traffic from Facebook
- [ ] Optimize for Facebook News Feed
  - [ ] Ensure images load quickly
  - [ ] Test on mobile (majority of Facebook users)
  - [ ] Monitor click-through rates from Facebook

## Content Strategy
- [ ] Create cornerstone content for main topics
- [ ] Add internal linking between related lessons
- [ ] Create a blog/resources section for additional content
- [ ] Add FAQ sections to main pages
- [ ] Create shareable practice tests and resources

## Accessibility (improves SEO)
- [ ] Ensure proper heading hierarchy (h1, h2, h3)
- [ ] Add ARIA labels where needed
- [ ] Ensure keyboard navigation works
- [ ] Test with screen readers
- [ ] Check color contrast ratios

## Local SEO (if applicable)
- [ ] Add location-based keywords if targeting specific regions
- [ ] Create location pages if offering regional services

## Google Indexing Checklist
- [ ] Test structured data with [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Verify sitemap with [Google Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- [ ] Check robots.txt with Google Search Console
- [ ] Ensure all pages are mobile-friendly
- [ ] Test page speed with Google PageSpeed Insights
- [ ] Submit URL inspection requests for new pages in Search Console
- [ ] Monitor index coverage reports in Search Console

## Bing Indexing Checklist
- [ ] Verify structured data with [Bing Markup Validator](https://www.bing.com/toolbox/markup-validator)
- [ ] Submit sitemap via Bing Webmaster Tools
- [ ] Use Bing URL Submission API for faster indexing
- [ ] Check robots.txt accessibility in Bing Webmaster Tools
- [ ] Monitor crawl stats and fix any crawl errors
- [ ] Use "Fetch as Bingbot" to test page rendering
- [ ] Check site loading speed in Bing Site Scan
- [ ] Review Bing's SEO analyzer recommendations

## Facebook Sharing Optimization Checklist
- [ ] Test with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Verify Open Graph image displays correctly (1200x630px minimum)
- [ ] Check that title, description, and image appear properly in preview
- [ ] Test sharing on both desktop and mobile Facebook
- [ ] Scrape URL to refresh Facebook's cache after metadata changes
- [ ] Verify no Open Graph warnings or errors
- [ ] Test how shared links appear in Facebook feed
- [ ] Check that shared links work on Facebook Messenger

## Advanced Google SEO Features
- [ ] Add FAQ schema to relevant pages (use generateFAQStructuredData)
- [ ] Add LearningResource schema to lesson pages (use generateLearningResourceStructuredData)
- [ ] Consider adding VideoObject schema if adding video content
- [ ] Set up local business schema if offering local services
- [ ] Add aggregate rating schema if collecting reviews
- [ ] Implement speakable schema for voice search optimization

## Bing SEO Best Practices Implemented
- **Open Graph Priority**: Bing heavily weights Open Graph tags - all pages have comprehensive OG metadata
- **Social Signals**: Enhanced structured data with knowsAbout and sameAs fields (add social profiles when available)
- **Author Information**: Explicit author metadata added (Bing values this highly)
- **Content Freshness**: Publish date metadata for Bing's freshness ranking algorithm
- **Free Educational Content**: isAccessibleForFree flag helps Bing categorize educational resources
- **Locale Specificity**: Using 'en-US' instead of 'en' (Bing preference)
- **BingBot Directives**: Specific bingbot configuration in robots meta tags

## Facebook Sharing Best Practices Implemented
- **Optimal Image Dimensions**: Open Graph images set to 1200x630px (Facebook's recommended 1.91:1 ratio)
- **Image Alt Text**: All OG images include alt text for accessibility and better context
- **Article Metadata**: Support for article type with section, tags, and author information
- **Dynamic Type Switching**: Automatically switches between 'website' and 'article' OG types
- **Facebook App Integration**: Support for fb:app_id for Facebook Insights and Analytics
- **Rich Preview Optimization**: Comprehensive title, description, and image metadata for engaging feed previews
- **Mobile-First**: All metadata optimized for Facebook's mobile-dominant user base

## Notes
- Sitemap auto-includes all current pages and is available at /sitemap.xml
- Robots.txt allows all pages except /api/ and /private/, available at /robots.txt
- Metadata template set up for consistent title formatting across pages
- Structured data components available in components/structured-data.tsx
- SEO utilities available in lib/seo.ts with keyword sets
- All pages configured with Google and Bing-optimized robots directives
- Breadcrumb navigation added for better search engine understanding of site structure
- Course schema markup helps both Google and Bing understand educational content
- BingSiteAuth.xml created in public folder for Bing verification
- Bing verification meta tag placeholder ready in metadata (needs env variable)
- Facebook Open Graph tags optimized for rich link previews in News Feed
- Support for both website and article Open Graph types
- Facebook App ID integration ready (optional parameter in generateMetadata)
- All social sharing metadata follows platform best practices
