import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 to-background dark:from-slate-900">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
                Terms of Service
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
                  These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and midssat.com ("we," "us," or "our") governing your access to and use of the website located at <strong>https://www.midssat.com</strong> (the "Site"). By accessing or using the Site, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must immediately discontinue use of the Site.
                </p>
              </div>

              <h2>1. Acceptance of Terms</h2>

              <p>
                By accessing, browsing, or using the Site, you affirm that you have the legal capacity to enter into these Terms. If you are under the age of 18, you represent that you have obtained parental or guardian consent to use the Site. If you are accessing the Site on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.
              </p>
              <p>
                These Terms apply to all users of the Site, including without limitation students, parents, educators, and casual visitors.
              </p>

              <h2>2. Description of Service</h2>

              <p>
                The Site provides educational materials, practice problems, study guides, and other resources designed to assist students preparing for the Secondary School Admission Test (SSAT), specifically the Middle Level examination. The Service includes:
              </p>
              <ul>
                <li>Educational content covering mathematics, verbal reasoning, and test-taking strategies</li>
                <li>Interactive practice exercises with varying difficulty levels</li>
                <li>Instructional materials, tutorials, and explanations</li>
                <li>Progress tracking and performance analytics (if account features are implemented)</li>
                <li>Supplementary educational resources and study tools</li>
              </ul>
              <p>
                We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without notice, and without liability to you.
              </p>

              <h2>3. User Conduct and Prohibited Activities</h2>

              <h3>3.1 Permitted Use</h3>
              <p>
                You may access and use the Site solely for personal, non-commercial educational purposes. You agree to use the Site in compliance with all applicable federal, state, local, and international laws and regulations.
              </p>

              <h3>3.2 Prohibited Activities</h3>
              <p>
                You expressly agree not to engage in any of the following prohibited activities:
              </p>
              <ul>
                <li><strong>Unauthorized Access:</strong> Attempt to gain unauthorized access to any portion of the Site, other user accounts, computer systems, or networks connected to the Site through hacking, password mining, or any other means</li>
                <li><strong>Data Extraction:</strong> Use any automated systems, including but not limited to robots, spiders, scrapers, or offline readers, to access or extract data from the Site without our express written permission</li>
                <li><strong>Content Reproduction:</strong> Copy, reproduce, distribute, transmit, publicly display, publicly perform, modify, create derivative works from, sell, or exploit any content from the Site for commercial purposes without our prior written consent</li>
                <li><strong>Reverse Engineering:</strong> Reverse engineer, decompile, disassemble, or attempt to derive the source code of any software or algorithms used on the Site</li>
                <li><strong>Interference:</strong> Interfere with or disrupt the Site, servers, or networks connected to the Site, or disobey any requirements, procedures, policies, or regulations of such networks</li>
                <li><strong>Harmful Code:</strong> Upload, transmit, or distribute any viruses, malware, worms, Trojan horses, or other harmful or destructive code</li>
                <li><strong>Misrepresentation:</strong> Impersonate any person or entity, falsely state or misrepresent your affiliation with any person or entity, or use a false identity</li>
                <li><strong>Harassment:</strong> Harass, threaten, stalk, or abuse other users or third parties</li>
                <li><strong>Illegal Activities:</strong> Use the Site for any illegal purpose or in violation of any local, state, national, or international law</li>
              </ul>

              <h3>3.3 Enforcement</h3>
              <p>
                We reserve the right, but are not obligated, to monitor user conduct and content on the Site. We may investigate violations of these Terms and take appropriate action, including but not limited to terminating access, removing content, and reporting violations to law enforcement authorities.
              </p>

              <h2>4. Intellectual Property Rights</h2>

              <h3>4.1 Ownership</h3>
              <p>
                The Site and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, audio, design, selection, arrangement, and the "look and feel" of the Site) are owned by midssat.com, our licensors, or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
              </p>

              <h3>4.2 Limited License</h3>
              <p>
                Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to:
              </p>
              <ul>
                <li>Access and use the Site for personal, non-commercial educational purposes</li>
                <li>View and print individual pages of the Site for personal study purposes</li>
                <li>Download materials explicitly marked as downloadable for offline personal use</li>
              </ul>
              <p>
                This license does not include any right to: (a) resell or make commercial use of the Site or its contents; (b) collect and use product listings, descriptions, or prices; (c) make derivative works of the Site or its contents; or (d) use any data mining, robots, or similar data gathering and extraction tools.
              </p>

              <h3>4.3 Trademark Notice</h3>
              <p>
                All trademarks, service marks, logos, and trade names displayed on the Site are the property of their respective owners. Nothing contained on the Site should be construed as granting any license or right to use any trademark without the prior written permission of the trademark owner.
              </p>

              <h3>4.4 Copyright Infringement</h3>
              <p>
                We respect the intellectual property rights of others and expect users to do the same. If you believe that content on the Site infringes your copyright, please contact us at <a href="mailto:support@midssat.com">support@midssat.com</a> with the following information:
              </p>
              <ul>
                <li>A description of the copyrighted work that you claim has been infringed</li>
                <li>The URL or location on the Site where the allegedly infringing material is located</li>
                <li>Your contact information (name, address, email, phone number)</li>
                <li>A statement that you have a good faith belief that the use is not authorized by the copyright owner</li>
                <li>A statement under penalty of perjury that the information in your notice is accurate and that you are authorized to act on behalf of the copyright owner</li>
              </ul>

              <h2>5. Educational Content and Accuracy</h2>

              <h3>5.1 Educational Purpose</h3>
              <p>
                All content on the Site, including practice problems, lessons, explanations, and study materials, is provided for educational and informational purposes only. The content is designed to assist students in preparing for the SSAT examination but does not guarantee any specific test scores, admission outcomes, or academic achievements.
              </p>

              <h3>5.2 No Warranty of Accuracy</h3>
              <p>
                While we make reasonable efforts to ensure the accuracy and quality of the educational content, we do not warrant that the content is complete, accurate, current, error-free, or suitable for any particular purpose. Educational methodologies and test content may change over time, and we are not responsible for ensuring that all content reflects the most current information.
              </p>

              <h3>5.3 Not Official SSAT Materials</h3>
              <p>
                The Site is an independent educational resource and is not affiliated with, endorsed by, or connected to The Enrollment Management Association or the official SSAT organization. Our materials are created independently and are not official SSAT preparation materials.
              </p>

              <h2>6. User Accounts (Future Feature)</h2>

              <p>
                Currently, the Site does not require user registration or account creation to access basic educational content. Should we implement user account functionality in the future, the following terms will apply:
              </p>

              <h3>6.1 Account Security</h3>
              <p>
                If you create an account, you are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>

              <h3>6.2 Account Termination</h3>
              <p>
                We reserve the right to suspend or terminate your account at any time, with or without notice, for violations of these Terms or for any other reason at our sole discretion.
              </p>

              <h2>7. Disclaimer of Warranties</h2>

              <p>
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE SITE AND ALL CONTENT, MATERIALS, INFORMATION, SOFTWARE, PRODUCTS, AND SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
              </p>
              <p>
                WE EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul>
                <li>IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT</li>
                <li>WARRANTIES THAT THE SITE WILL BE UNINTERRUPTED, SECURE, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS</li>
                <li>WARRANTIES REGARDING THE ACCURACY, RELIABILITY, OR COMPLETENESS OF ANY CONTENT OR INFORMATION</li>
                <li>WARRANTIES THAT DEFECTS WILL BE CORRECTED OR THAT THE SITE WILL MEET YOUR REQUIREMENTS</li>
                <li>WARRANTIES THAT USE OF THE SITE WILL RESULT IN ANY PARTICULAR TEST SCORES, ADMISSION OUTCOMES, OR ACADEMIC ACHIEVEMENTS</li>
              </ul>
              <p>
                NO ADVICE OR INFORMATION, WHETHER ORAL OR WRITTEN, OBTAINED BY YOU FROM THE SITE OR THROUGH THE SITE WILL CREATE ANY WARRANTY NOT EXPRESSLY STATED IN THESE TERMS.
              </p>

              <h2>8. Limitation of Liability</h2>

              <p>
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL MIDSSAT.COM, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, LICENSORS, OR SERVICE PROVIDERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul>
                <li>LOSS OF PROFITS, REVENUE, OR DATA</li>
                <li>LOSS OF USE OR GOODWILL</li>
                <li>BUSINESS INTERRUPTION</li>
                <li>PERSONAL INJURY OR EMOTIONAL DISTRESS</li>
                <li>TEST PERFORMANCE OR ADMISSION OUTCOMES</li>
                <li>ANY OTHER INTANGIBLE LOSSES</li>
              </ul>
              <p>
                WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
              <p>
                IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, AND CAUSES OF ACTION (WHETHER IN CONTRACT, TORT, OR OTHERWISE) EXCEED THE AMOUNT PAID BY YOU, IF ANY, FOR ACCESSING THE SITE DURING THE SIX (6) MONTHS PRIOR TO THE DATE OF THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
              </p>
              <p>
                SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN WARRANTIES OR LIABILITIES, SO SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.
              </p>

              <h2>9. Indemnification</h2>

              <p>
                You agree to defend, indemnify, and hold harmless midssat.com, its affiliates, officers, directors, employees, agents, licensors, and service providers from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to:
              </p>
              <ul>
                <li>Your violation of these Terms</li>
                <li>Your use or misuse of the Site</li>
                <li>Your violation of any third-party rights, including intellectual property rights</li>
                <li>Your violation of any applicable laws or regulations</li>
                <li>Any content you submit, post, or transmit through the Site</li>
              </ul>
              <p>
                We reserve the right to assume the exclusive defense and control of any matter subject to indemnification by you, in which event you will cooperate with us in asserting any available defenses.
              </p>

              <h2>10. Third-Party Links and Resources</h2>

              <p>
                The Site may contain links to third-party websites, services, or resources that are not owned, controlled, or operated by us. We provide these links solely for your convenience and do not endorse, approve, or make any representations about such third-party websites or their content.
              </p>
              <p>
                We have no control over and assume no responsibility for the content, privacy policies, terms of use, or practices of any third-party websites or services. You acknowledge and agree that we shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such third-party content, goods, or services available on or through any such websites or services.
              </p>
              <p>
                We strongly advise you to read the terms and conditions and privacy policies of any third-party websites or services that you visit.
              </p>

              <h2>11. SSAT Trademark Disclaimer</h2>

              <p>
                SSAT® is a registered trademark of The Enrollment Management Association (EMA). This website is an independent educational resource and is not affiliated with, endorsed by, sponsored by, or otherwise connected to The Enrollment Management Association or any official SSAT organization.
              </p>
              <p>
                All references to "SSAT" on this Site are used solely for descriptive purposes to indicate the subject matter of the educational materials provided. The use of the SSAT trademark does not imply any affiliation with or endorsement by The Enrollment Management Association.
              </p>

              <h2>12. Modifications to the Site and Terms</h2>

              <h3>12.1 Site Modifications</h3>
              <p>
                We reserve the right to modify, update, suspend, or discontinue any aspect of the Site, including content, features, functionality, or availability, at any time without prior notice and without liability to you.
              </p>

              <h3>12.2 Terms Modifications</h3>
              <p>
                We may revise and update these Terms from time to time at our sole discretion. All changes are effective immediately upon posting to the Site. The "Last Modified" date at the top of this page indicates when these Terms were last updated.
              </p>
              <p>
                If we make material changes to these Terms, we will provide prominent notice on the Site or send notification to the email address associated with your account (if applicable) at least thirty (30) days prior to the changes taking effect.
              </p>
              <p>
                Your continued use of the Site following the posting of revised Terms constitutes your acceptance of and agreement to the changes. If you do not agree to the revised Terms, you must discontinue all use of the Site.
              </p>

              <h2>13. Termination</h2>

              <h3>13.1 Termination by Us</h3>
              <p>
                We may terminate or suspend your access to the Site immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, your right to use the Site will immediately cease.
              </p>

              <h3>13.2 Effect of Termination</h3>
              <p>
                All provisions of these Terms which by their nature should survive termination shall survive, including but not limited to ownership provisions, warranty disclaimers, indemnification obligations, and limitations of liability.
              </p>

              <h2>14. Dispute Resolution</h2>

              <h3>14.1 Informal Resolution</h3>
              <p>
                Before filing a claim, you agree to contact us at <a href="mailto:support@midssat.com">support@midssat.com</a> and attempt to resolve the dispute informally. We will attempt to resolve disputes in good faith within sixty (60) days of receiving notice.
              </p>

              <h3>14.2 Binding Arbitration</h3>
              <p>
                If the informal dispute resolution process does not resolve the dispute, you agree that any dispute arising out of or relating to these Terms or the Site shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association (AAA). The arbitration shall be conducted in English, and the arbitrator's decision shall be final and binding.
              </p>

              <h3>14.3 Class Action Waiver</h3>
              <p>
                YOU AND MIDSSAT.COM AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
              </p>

              <h2>15. Governing Law and Jurisdiction</h2>

              <p>
                These Terms and your use of the Site shall be governed by and construed in accordance with the laws of the United States and the State of [Your State], without regard to its conflict of law provisions.
              </p>
              <p>
                You agree to submit to the personal and exclusive jurisdiction of the courts located within [Your County], [Your State], for the resolution of any disputes arising out of or relating to these Terms or the Site.
              </p>

              <h2>16. Severability</h2>

              <p>
                If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving its original intent. If modification is not possible, the invalid provision shall be severed from these Terms, and the remaining provisions shall continue in full force and effect.
              </p>

              <h2>17. Entire Agreement</h2>

              <p>
                These Terms, together with our Privacy Policy and any other legal notices or agreements published by us on the Site, constitute the entire agreement between you and midssat.com regarding your use of the Site and supersede all prior and contemporaneous understandings, agreements, representations, and warranties, both written and oral, regarding the Site.
              </p>

              <h2>18. Waiver</h2>

              <p>
                Our failure to enforce any right or provision of these Terms shall not be deemed a waiver of such right or provision. No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term.
              </p>

              <h2>19. Contact Information</h2>

              <p>
                If you have any questions, concerns, or comments regarding these Terms of Service, please contact us:
              </p>

              <div className="not-prose bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 mt-4">
                <p className="text-sm font-semibold mb-2">Legal Department</p>
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
                  These Terms of Service were last updated on January 1, 2025. By using the Site, you acknowledge that you have read, understood, and agree to be bound by these Terms.
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
