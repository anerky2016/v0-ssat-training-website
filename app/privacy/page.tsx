import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 to-background dark:from-slate-900">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
                Privacy Policy
              </h1>
              <p className="text-base text-muted-foreground">
                Effective Date: January 1, 2025
              </p>
              <p className="text-base text-muted-foreground mt-1">
                Last Modified: January 1, 2025
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl prose prose-slate dark:prose-invert prose-headings:font-semibold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-relaxed">

              <div className="not-prose bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 mb-8">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This Privacy Policy describes how midssat.com ("we," "us," or "our") collects, uses, discloses, and protects information obtained from users ("you" or "your") of our website located at <strong>https://www.midssat.com</strong> (the "Site"). By accessing or using the Site, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
                </p>
              </div>

              <h2>1. Information We Collect</h2>

              <h3>1.1 Automatically Collected Information</h3>
              <p>
                When you access our Site, we automatically collect certain technical information through cookies, web beacons, and similar tracking technologies, including but not limited to:
              </p>
              <ul>
                <li><strong>Device Information:</strong> Internet Protocol (IP) address, browser type and version, operating system, device type, and unique device identifiers.</li>
                <li><strong>Usage Data:</strong> Pages visited, date and time of visits, time spent on pages, clickstream data, referring/exit pages, and other diagnostic data regarding your interaction with the Site.</li>
                <li><strong>Performance Metrics:</strong> Page load times, server response times, and other technical performance indicators.</li>
              </ul>

              <h3>1.2 Information You Provide</h3>
              <p>
                Currently, the Site does not require user registration or account creation. If you contact us via email at <a href="mailto:support@midssat.com">support@midssat.com</a>, we may collect:
              </p>
              <ul>
                <li>Your email address and name (if provided)</li>
                <li>The content of your communication</li>
                <li>Any other information you voluntarily provide</li>
              </ul>

              <h3>1.3 Future Account Features</h3>
              <p>
                Should we implement user account functionality in the future, we may collect additional information such as username, password (encrypted), progress tracking data, and preferences. Users will be notified of any such changes through an updated Privacy Policy.
              </p>

              <h2>2. How We Use Your Information</h2>

              <p>We use the collected information for the following lawful purposes:</p>

              <h3>2.1 Service Provision and Improvement</h3>
              <ul>
                <li>To provide, maintain, and improve the educational content and functionality of the Site</li>
                <li>To analyze usage patterns and optimize user experience</li>
                <li>To develop new features, content, and services</li>
                <li>To troubleshoot technical issues and ensure platform stability</li>
              </ul>

              <h3>2.2 Communication</h3>
              <ul>
                <li>To respond to your inquiries, comments, or support requests</li>
                <li>To send administrative information, including updates to our policies</li>
                <li>To provide educational updates or announcements (with your consent where required)</li>
              </ul>

              <h3>2.3 Security and Legal Compliance</h3>
              <ul>
                <li>To detect, prevent, and address fraud, security vulnerabilities, and technical issues</li>
                <li>To enforce our Terms of Service and other legal agreements</li>
                <li>To comply with applicable laws, regulations, legal processes, or governmental requests</li>
              </ul>

              <h2>3. Information Sharing and Disclosure</h2>

              <p>
                We respect your privacy and do not sell, rent, or trade your personal information to third parties for their marketing purposes. We may share your information only in the following circumstances:
              </p>

              <h3>3.1 Service Providers</h3>
              <p>
                We engage trusted third-party service providers to perform functions on our behalf, including:
              </p>
              <ul>
                <li><strong>Analytics Providers:</strong> Google Analytics and Umami Analytics for website traffic analysis and usage statistics</li>
                <li><strong>Hosting Services:</strong> Cloud infrastructure providers for data storage and site hosting</li>
                <li><strong>Email Services:</strong> Email service providers for communication purposes</li>
              </ul>
              <p>
                These service providers are contractually obligated to use your information only for the purposes of providing services to us and are required to maintain the confidentiality and security of your information.
              </p>

              <h3>3.2 Legal Requirements</h3>
              <p>
                We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., court orders, subpoenas, or government agencies) to:
              </p>
              <ul>
                <li>Comply with legal obligations</li>
                <li>Protect and defend our rights or property</li>
                <li>Prevent or investigate possible wrongdoing in connection with the Site</li>
                <li>Protect the personal safety of users or the public</li>
              </ul>

              <h3>3.3 Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, reorganization, bankruptcy, or sale of assets, your information may be transferred as part of that transaction. We will provide notice before your information becomes subject to a different privacy policy.
              </p>

              <h2>4. Analytics and Tracking Technologies</h2>

              <h3>4.1 Google Analytics</h3>
              <p>
                We use Google Analytics, a web analytics service provided by Google LLC, to collect and analyze information about Site usage. Google Analytics uses cookies to track your interactions with the Site. The information generated by the cookie (including your IP address) is transmitted to and stored by Google on servers in the United States.
              </p>
              <p>
                You may opt out of Google Analytics by installing the Google Analytics Opt-out Browser Add-on available at: <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">https://tools.google.com/dlpage/gaoptout</a>
              </p>

              <h3>4.2 Umami Analytics</h3>
              <p>
                We use Umami Analytics, a privacy-focused analytics platform that does not use cookies and does not collect personally identifiable information. Umami provides aggregated, anonymized usage statistics.
              </p>

              <h3>4.3 Cookies</h3>
              <p>
                Cookies are small text files stored on your device by your web browser. We use the following types of cookies:
              </p>
              <ul>
                <li><strong>Essential Cookies:</strong> Necessary for the Site to function properly</li>
                <li><strong>Analytics Cookies:</strong> Used to understand how visitors interact with the Site</li>
                <li><strong>Preference Cookies:</strong> Used to remember your settings and preferences (e.g., theme selection)</li>
              </ul>
              <p>
                You can control cookie settings through your browser preferences. However, disabling cookies may limit your ability to use certain features of the Site.
              </p>

              <h2>5. Data Security</h2>

              <p>
                We implement industry-standard technical and organizational security measures designed to protect your information from unauthorized access, disclosure, alteration, and destruction, including:
              </p>
              <ul>
                <li>Encryption of data in transit using HTTPS/TLS protocols</li>
                <li>Secure server infrastructure with regular security updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular security assessments and monitoring</li>
              </ul>
              <p>
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>

              <h2>6. Children's Privacy (COPPA Compliance)</h2>

              <p>
                The Site provides educational content for students preparing for the Middle Level SSAT examination, which is typically taken by students in grades 5-7. We recognize that many of our users may be under the age of 13.
              </p>
              <p>
                In compliance with the Children's Online Privacy Protection Act (COPPA), we do not knowingly collect personal information from children under 13 without verifiable parental consent. Our current Site design does not require users to provide personal information to access educational content.
              </p>
              <p>
                If we learn that we have inadvertently collected personal information from a child under 13 without parental consent, we will take immediate steps to delete that information from our servers.
              </p>
              <p>
                If you are a parent or guardian and believe that your child has provided us with personal information without your consent, please contact us immediately at <a href="mailto:support@midssat.com">support@midssat.com</a>.
              </p>

              <h2>7. Your Privacy Rights</h2>

              <p>
                Depending on your jurisdiction, you may have the following rights regarding your personal information:
              </p>

              <h3>7.1 Access and Portability</h3>
              <p>
                You have the right to request access to the personal information we hold about you and to receive that information in a structured, commonly used, and machine-readable format.
              </p>

              <h3>7.2 Correction</h3>
              <p>
                You have the right to request correction of inaccurate or incomplete personal information.
              </p>

              <h3>7.3 Deletion</h3>
              <p>
                You have the right to request deletion of your personal information, subject to certain legal exceptions (e.g., legal obligations, fraud prevention).
              </p>

              <h3>7.4 Opt-Out</h3>
              <p>
                You have the right to opt out of marketing communications. You may also configure your browser to refuse cookies or alert you when cookies are being sent.
              </p>

              <h3>7.5 California Privacy Rights (CCPA)</h3>
              <p>
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, disclose, or sell, and the right to request deletion of your personal information.
              </p>

              <h3>7.6 European Privacy Rights (GDPR)</h3>
              <p>
                If you are located in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR), including the right to object to processing, the right to restrict processing, and the right to lodge a complaint with a supervisory authority.
              </p>

              <p className="mt-6">
                To exercise any of these rights, please contact us at <a href="mailto:support@midssat.com">support@midssat.com</a>. We will respond to your request within 30 days.
              </p>

              <h2>8. Data Retention</h2>

              <p>
                We retain your information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When information is no longer needed, we will securely delete or anonymize it.
              </p>
              <p>
                Retention periods vary based on the type of information:
              </p>
              <ul>
                <li><strong>Analytics Data:</strong> Retained for up to 26 months (Google Analytics default)</li>
                <li><strong>Communication Records:</strong> Retained for up to 3 years for customer support purposes</li>
                <li><strong>Technical Logs:</strong> Retained for up to 90 days for security and troubleshooting</li>
              </ul>

              <h2>9. International Data Transfers</h2>

              <p>
                Your information may be transferred to and processed in countries other than your country of residence, including the United States, where data protection laws may differ from those in your jurisdiction. By using the Site, you consent to the transfer of your information to the United States and other countries.
              </p>
              <p>
                We ensure that appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable laws.
              </p>

              <h2>10. Third-Party Links</h2>

              <p>
                The Site may contain links to third-party websites, services, or resources that are not operated or controlled by us. This Privacy Policy does not apply to those third-party sites. We are not responsible for the privacy practices of third parties and encourage you to review their privacy policies before providing any information.
              </p>

              <h2>11. Changes to This Privacy Policy</h2>

              <p>
                We reserve the right to modify this Privacy Policy at any time. Any changes will be effective immediately upon posting the revised Privacy Policy on the Site. The "Last Modified" date at the top of this page indicates when the Privacy Policy was last updated.
              </p>
              <p>
                If we make material changes that significantly affect your rights, we will provide prominent notice on the Site or via email (if we have your email address) at least 30 days prior to the changes taking effect.
              </p>
              <p>
                Your continued use of the Site after the effective date of any changes constitutes your acceptance of the revised Privacy Policy. If you do not agree to the changes, you must discontinue use of the Site.
              </p>

              <h2>12. Do Not Track Signals</h2>

              <p>
                Some web browsers have a "Do Not Track" (DNT) feature that signals to websites that you do not want to be tracked. Currently, there is no industry consensus on how to respond to DNT signals. At this time, the Site does not respond to DNT signals.
              </p>

              <h2>13. Contact Information</h2>

              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>

              <div className="not-prose bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 mt-4">
                <p className="text-sm font-semibold mb-2">Privacy Officer</p>
                <p className="text-sm text-muted-foreground">midssat.com</p>
                <p className="text-sm text-muted-foreground mt-3">
                  <strong>Email:</strong> <a href="mailto:support@midssat.com" className="text-primary hover:underline">support@midssat.com</a>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Website:</strong> <a href="https://www.midssat.com" className="text-primary hover:underline">https://www.midssat.com</a>
                </p>
              </div>

              <div className="not-prose border-t border-slate-200 dark:border-slate-800 pt-6 mt-12">
                <p className="text-xs text-muted-foreground">
                  This Privacy Policy was last updated on January 1, 2025. We are committed to protecting your privacy and handling your information with transparency and care.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Back Button */}
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex justify-center">
              <Link href="/">
                <button className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
