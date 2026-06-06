import { NextPage } from "next";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy || Barlon',
  description: 'Learn more about our privacy policy and how we handle your data.',
};

const PrivacyPolicy: NextPage = () => {
  return (
    <>
      <main className="policy-content-container">
        <div className="policy-box">
          <h1>Privacy Policy</h1>
          <p>Last updated: [Insert Date]</p>
          <p>
            At YourBrandName, we are committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, and safeguard your information when you visit our website.
          </p>
        </div>

        <div className="policy-box">
          <h2>Information We Collect</h2>
          <p>We may collect personal information such as:</p>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Shipping address</li>
            <li>Phone number</li>
            <li>Payment information (processed securely through third-party gateways)</li>
          </ul>
        </div>

        <div className="policy-box">
          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your order</li>
            <li>Send promotional materials (if opted-in)</li>
            <li>Improve our website and services</li>
          </ul>
        </div>

        <div className="policy-box">
          <h2>Sharing Your Information</h2>
          <p>
            We do not sell or rent your personal data. We may share information with trusted third
            parties for order fulfillment, payment processing, and delivery. We do not share your data with any third parties for marketing purposes. You can opt out of receiving promotional materials at any time.
          </p>
        </div>

        <div className="policy-box">
          <h2>Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal
            data. We use SSL encryption to protect your data. We do not share your payment information with any third parties. We do store your payment information on our servers with highly secure methods.
          </p>
        </div>

        <div className="policy-box">
          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </div>

        <div className="policy-box">
          <h2>Contact Us</h2>
          <p>
            If you have any other questions, please contact us at
          </p>
          <a href="mailto:support@yourbrand.com">support@yourbrand.com</a>
          <a href="tel:+1234567890">+1234567890</a>
          <p>For more Support and Contact, Visit here:</p>
          <a href="https://barlon.com/contact">Get Support</a>
        </div>
      </main>
    </>
  );
};

export default PrivacyPolicy;
