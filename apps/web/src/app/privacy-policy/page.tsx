import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Privacy Policy || WohaAI',
  description: 'Learn more about our privacy policy and how we handle your data.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-svh font-reading bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <div className="mb-12">
          <h1 className="font-gerogia-sans text-fluid-2xl font-medium text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-fluid-sm mb-6">
            Last updated: January 17, 2026
          </p>
          <p className="text-foreground text-fluid-base leading-relaxed">
            At WohaAI, we are committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, and safeguard your information when you use our AI-powered services.
          </p>
        </div>

        <div className="space-y-8">
          <section className="border-l-2 border-border pl-6">
            <h2 className="font-gerogia-sans text-fluid-xl font-medium text-foreground mb-3">
              Information We Collect
            </h2>
            <p className="text-muted-foreground text-fluid-base leading-relaxed mb-3">
              We may collect the following types of information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground text-fluid-base space-y-2 ml-2">
              <li><strong>Account Information:</strong> Name, email address, username, and password</li>
              <li><strong>Usage Data:</strong> AI interactions, prompts, and generated content</li>
              <li><strong>Technical Data:</strong> IP address, device information, browser type</li>
              <li><strong>Communication Data:</strong> Messages sent to our support team</li>
            </ul>
          </section>

          <section className="border-l-2 border-border pl-6">
            <h2 className="font-gerogia-sans text-fluid-xl font-medium text-foreground mb-3">
              How We Use Your Information
            </h2>
            <p className="text-muted-foreground text-fluid-base leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground text-fluid-base space-y-2 ml-2">
              <li>Provide and improve our AI services</li>
              <li>Process your requests and generate responses</li>
              <li>Authenticate users and secure accounts</li>
              <li>Communicate with you about service updates</li>
              <li>Analyze usage patterns to enhance performance</li>
              <li>Prevent fraud and abuse of our services</li>
            </ul>
          </section>

          <section className="border-l-2 border-border pl-6">
            <h2 className="font-gerogia-sans text-fluid-xl font-medium text-foreground mb-3">
              AI Content & Data Processing
            </h2>
            <p className="text-muted-foreground text-fluid-base leading-relaxed mb-3">
              When you interact with our AI:
            </p>
            <ul className="list-disc list-inside text-muted-foreground text-fluid-base space-y-2 ml-2">
              <li>Your prompts may be processed to generate relevant responses</li>
              <li>We may use anonymized data to train and improve our AI models</li>
              <li>We do not sell your personal data or conversations to third parties</li>
              <li>You can request deletion of your conversation history at any time</li>
            </ul>
          </section>

          <section className="border-l-2 border-border pl-6">
            <h2 className="font-gerogia-sans text-fluid-xl font-medium text-foreground mb-3">
              Data Security
            </h2>
            <p className="text-muted-foreground text-fluid-base leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal
              data, including encryption, secure servers, and access controls. We regularly review our
              security practices to ensure your data remains safe.
            </p>
          </section>

          <section className="border-l-2 border-border pl-6">
            <h2 className="font-gerogia-sans text-fluid-xl font-medium text-foreground mb-3">
              Your Rights
            </h2>
            <p className="text-muted-foreground text-fluid-base leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground text-fluid-base space-y-2 ml-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Withdraw consent at any time</li>
              <li>Export your data in a portable format</li>
              <li>Opt-out of data collection for non-essential purposes</li>
            </ul>
          </section>

          <section className="border-l-2 border-border pl-6">
            <h2 className="font-gerogia-sans text-fluid-xl font-medium text-foreground mb-3">
              Third-Party Services
            </h2>
            <p className="text-muted-foreground text-fluid-base leading-relaxed">
              We may use third-party services for analytics, authentication, and infrastructure.
              These services have their own privacy policies, and we ensure they comply with
              applicable data protection regulations.
            </p>
          </section>

          <section className="border-l-2 border-border pl-6">
            <h2 className="font-gerogia-sans text-fluid-xl font-medium text-foreground mb-3">
              Cookies & Tracking
            </h2>
            <p className="text-muted-foreground text-fluid-base leading-relaxed">
              We use cookies and similar technologies to improve your experience, analyze usage,
              and maintain security. You can manage your cookie preferences through your browser settings.
            </p>
          </section>

          <section className="border-l-2 border-border pl-6">
            <h2 className="font-gerogia-sans text-fluid-xl font-medium text-foreground mb-3">
              Children's Privacy
            </h2>
            <p className="text-muted-foreground text-fluid-base leading-relaxed">
              Our services are not intended for children under 13. We do not knowingly collect
              personal information from children under 13.
            </p>
          </section>

          <section className="border-l-2 border-border pl-6">
            <h2 className="font-gerogia-sans text-fluid-xl font-medium text-foreground mb-3">
              Changes to This Policy
            </h2>
            <p className="text-muted-foreground text-fluid-base leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any
              significant changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="border-l-2 border-border pl-6">
            <h2 className="font-gerogia-sans text-fluid-xl font-medium text-foreground mb-3">
              Contact Us
            </h2>
            <p className="text-muted-foreground text-fluid-base leading-relaxed mb-3">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="space-y-2">
              <Link href="mailto:privacy@wohaai.com" className="text-primary hover:underline block">
                privacy@wohaai.com
              </Link>
              <Link href="/" className="text-primary hover:underline block">
                Return to WohaAI
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
