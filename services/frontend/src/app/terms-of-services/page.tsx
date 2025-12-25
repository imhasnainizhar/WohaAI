import { NextPage } from "next";
import "@styles/pages/terms-page.style.css"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Terms of Service || Barlon',
  description: 'Learn more about our terms of service and how we handle your data.',
};

const TermsOfService: NextPage = () => {
  return (
    <>
      <main className="terms-of-service-container">
        <section className="terms-service-box">
          <h1>Terms of Service</h1>
          <p>Last updated: [Insert Date]</p>
          <p>Welcome to Barlon, your ultimate destination for stylish, high-quality clothing that fits every mood and moment. Whether {`you're looking for everyday essentials, bold statement pieces, or the latest fashion trends, we've got you covered. Here are the terms and conditions that govern your use of our website.`}</p>
        </section>

        <section className="terms-service-box">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By using this website, you agree to be bound by these Terms of Service and our Privacy
            Policy. If you do not agree, please do not use our website.
          </p>
        </section>

        <section className="terms-service-box">
          <h2>2. Use of Our Website</h2>
          <p>
            You agree to use our website for lawful purposes only. You must not use it in any way
            that breaches any applicable local, national, or international law.
          </p>
        </section>

        <section className="terms-service-box">
          <h2>3. Products & Services</h2>
          <p>
            All products displayed are subject to availability. We reserve the right to modify or
            discontinue any product without notice.
          </p>
        </section>

        <section className="terms-service-box">
          <h2>4. Orders & Payment</h2>
          <p>
            By placing an order, you confirm that you are authorized to use the payment method
            provided. All transactions are securely processed.
          </p>
        </section>

        <section className="terms-service-box">
          <h2>5. Returns & Refunds</h2>
          <p>
            Our return and refund policy is outlined on the relevant product or help page. Please
            review it before making a purchase.
          </p>
        </section>

        <section className="terms-service-box">
          <h2>6. Limitation of Liability</h2>
          <p>
            We are not liable for any damages resulting from your use of this website or the purchase
            of our products, except as required by law.
          </p>
        </section>

        <section className="terms-service-box">
          <h2>7. Changes to Terms</h2>
          <p>
            We reserve the right to change these terms at any time. Continued use of the website
            constitutes acceptance of the new terms.
          </p>
        </section>

        <section className="terms-service-box">
          <h2>8. Contact Us</h2>
          <p>
            For any questions regarding these Terms of Service, please contact us at
          </p>
          <a href="mailto:support@yourbrand.com">support@yourbrand.com</a>
          <a href="tel:+1234567890">+1234567890</a>
          <p>For more Support and Contact, Visit here:</p>
          <a href="https://barlon.com/contact">Get Support</a>
        </section>
      </main>
    </>
  );
};

export default TermsOfService;
