import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Terms of Service || WohaAI',
  description: 'Learn more about our terms of service and how we handle your data.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-svh font-reading bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <div className="mb-12">
          <h1 className="font-gerogia-sans text-fluid-2xl font-medium text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-fluid-sm mb-6">
            Last updated: January 17, 2026
          </p>
          <p className="text-foreground text-fluid-base leading-relaxed">
            Welcome to WohaAI, your AI-powered assistant for thinking fast and crafting faster.
            By using our services, you agree to these Terms of Service and our Privacy Policy.
          </p>
        </div>

        <div className="space-y-8">
          <section className="border-l-2 border-border pl-6">
            <h2 className="font-gerogia-sans text-fluid-xl font-medium text-foreground mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground text-fluid-base leading-relaxed">
              By accessing or using WohaAI services, you agree to be bound by these Terms of Service
              and our Privacy Policy. If you do not agree with these terms, please do not use our services.
            </p>
          </section>

          <section className="border-l-2 border-border pl-6">
            <h2 className="font-gerogia-sans text-fluid-xl font-medium text-foreground mb-3">
              2. Use of Our Services
            </h2>
            <p className="text-muted-foreground text-fluid-base leading-relaxed mb-3">
              You agree to use our AI services for lawful purposes only. You must not:
            </p>
            <ul className="list-disc list-inside text-muted-foreground text-fluid-base space-y-2 ml-2">
              <li>Use the service to generate harmful, illegal, or inappropriate content</li>
              <li>Attempt to reverse engineer or circumvent security measures</li>
              <li>Use the service to violate any applicable laws or regulations</li>
              <li>Interfere with the operation of our services or servers</li>
            </ul>
          </section>

          <section className="border-l-2 border-border pl-6">
            <h2 className="font-gerogia-sans text-fluid-xl font-medium text-foreground mb-3">
              3. AI Content & Accuracy
            </h2>
            <p className="text-muted-foreground text-fluid-base leading-relaxed">
              Our AI generates content based on the input provided. While we strive for accuracy,
              AI-generated content may not always be correct or complete. You should verify important
              information independently. We are not responsible for decisions made based on AI-generated content.
            </p>
          </section>

          <section className="border-l-2 border-border pl-6">
            <h2 className="font-gerogia-sans text-fluid-xl font-medium text-foreground mb-3">
              4. User Accounts
            </h2>
            <p className="text-muted-foreground text-fluid-base leading-relaxed mb-3">
              You are responsible for maintaining the confidentiality of your account credentials.
              You agree to notify us immediately of any unauthorized use of your account.
            </p>
            <p className="text-muted-foreground text-fluid-base leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section className="border-l-2 border-border pl-6">
            <h2 className="font-gerogia-sans text-fluid-xl font-medium text-foreground mb-3">
              5. Intellectual Property
            </h2>
            <p className="text-muted-foreground text-fluid-base leading-relaxed mb-3">
              All content, features, and functionality of WohaAI are owned by WohaAI Corporation
              and are protected by intellectual property laws.
            </p>
            <p className="text-muted-foreground text-fluid-base leading-relaxed">
              You retain ownership of content you provide, but grant us a license to use it for
              providing and improving our services.
            </p>
          </section>

          <section className="border-l-2 border-border pl-6">
            <h2 className="font-gerogia-sans text-fluid-xl font-medium text-foreground mb-3">
              6. Limitation of Liability
            </h2>
            <p className="text-muted-foreground text-fluid-base leading-relaxed">
              WohaAI shall not be liable for any indirect, incidental, special, or consequential
              damages resulting from your use of our services, to the maximum extent permitted by law.
            </p>
          </section>

          <section className="border-l-2 border-border pl-6">
            <h2 className="font-gerogia-sans text-fluid-xl font-medium text-foreground mb-3">
              7. Changes to Terms
            </h2>
            <p className="text-muted-foreground text-fluid-base leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of our services
              after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section className="border-l-2 border-border pl-6">
            <h2 className="font-gerogia-sans text-fluid-xl font-medium text-foreground mb-3">
              8. Contact Us
            </h2>
            <p className="text-muted-foreground text-fluid-base leading-relaxed mb-3">
              For questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2">
              <Link href="mailto:support@wohaai.com" className="text-primary hover:underline block">
                support@wohaai.com
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
