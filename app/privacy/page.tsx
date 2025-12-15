import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Fleet Cost Tracker",
  description: "Privacy Policy for Fleet Cost Tracker",
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p>
            Fleet Cost Tracker ("we", "our", or "us") is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you use our service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
          <h3 className="text-xl font-semibold mt-4 mb-2">2.1 Personal Information</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name and email address</li>
            <li>Profile information (avatar, company details)</li>
            <li>Authentication credentials (hashed passwords)</li>
            <li>Payment information (if applicable)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-4 mb-2">2.2 Usage Data</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Project and equipment data</li>
            <li>Financial calculations and reports</li>
            <li>Activity logs</li>
            <li>IP address and browser information</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information to improve our service</li>
            <li>To monitor the usage of our service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your
            personal data against unauthorized access, alteration, disclosure, or destruction.
            This includes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Encryption of data in transit (HTTPS/TLS 1.3)</li>
            <li>Encryption of sensitive data at rest</li>
            <li>Secure password hashing (bcrypt, 12 rounds)</li>
            <li>Regular security audits</li>
            <li>Access controls and authentication</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights (GDPR/CCPA)</h2>
          <h3 className="text-xl font-semibold mt-4 mb-2">5.1 Right to Access</h3>
          <p>You can request a copy of all personal data we hold about you.</p>

          <h3 className="text-xl font-semibold mt-4 mb-2">5.2 Right to Rectification</h3>
          <p>You can update your personal information at any time through your profile settings.</p>

          <h3 className="text-xl font-semibold mt-4 mb-2">5.3 Right to Erasure</h3>
          <p>
            You can request deletion of your account and personal data. We provide a 30-day
            grace period to cancel the deletion request.
          </p>

          <h3 className="text-xl font-semibold mt-4 mb-2">5.4 Right to Data Portability</h3>
          <p>
            You can export all your data in JSON format through the account settings page.
          </p>

          <h3 className="text-xl font-semibold mt-4 mb-2">5.5 Right to Object</h3>
          <p>
            You can object to processing of your personal data for certain purposes, such as
            marketing or analytics.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Retention</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account data: Retained while your account is active</li>
            <li>Audit logs: 90 days</li>
            <li>Activity logs: 90 days</li>
            <li>Deleted accounts: Permanently deleted after 30-day grace period</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Cookies and Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our service.
            You can instruct your browser to refuse all cookies or to indicate when a cookie
            is being sent.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Third-Party Services</h2>
          <p>
            We may use third-party services for analytics, email delivery, and payment processing.
            These services have their own privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13 years of age. We do not knowingly
            collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes
            by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            Email: privacy@yourdomain.com<br />
            Address: [Your Company Address]
          </p>
        </section>
      </div>
    </div>
  )
}
