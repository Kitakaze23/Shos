import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Fleet Cost Tracker",
  description: "Privacy Policy for Fleet Cost Tracker",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <section>
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: 16 December 2025
        </p>
      </section>

      <section className="space-y-4 text-sm leading-relaxed">
        <p>
          Fleet Cost Tracker (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to
          protecting your privacy. This Privacy Policy explains how we
          collect, use, disclose, and safeguard your information when you
          use our service.
        </p>

        <p>
          We implement appropriate technical and organizational measures to
          protect your personal data against unauthorized access, alteration,
          disclosure, or destruction.
        </p>

        <p>
          You can request a copy of all personal data we hold about you.
          You can update your personal information at any time through your
          profile settings.
        </p>

        <p>
          You can request deletion of your account and personal data. We
          provide a 30-day grace period to cancel the deletion request.
        </p>

        <p>
          You can export all your data in JSON format through the account
          settings page.
        </p>

        <p>
          You can object to processing of your personal data for certain
          purposes, such as marketing or analytics.
        </p>

        <p>
          We use cookies and similar tracking technologies to track activity
          on our service. You can instruct your browser to refuse all cookies
          or to indicate when a cookie is being sent.
        </p>

        <p>
          We may use third-party services for analytics, email delivery, and
          payment processing. These services have their own privacy policies.
        </p>

        <p>
          Our service is not intended for children under 13 years of age.
          We do not knowingly collect personal information from children.
        </p>

        <p>
          We may update our Privacy Policy from time to time. We will notify
          you of any changes by posting the new Privacy Policy on this page
          and updating the &quot;Last updated&quot; date.
        </p>
      </section>

      <section className="space-y-1 text-sm">
        <p>If you have any questions about this Privacy Policy, please contact us:</p>
        <p>Email: privacy@yourdomain.com</p>
        <p>Address: [Your Company Address]</p>
      </section>
    </main>
  );
}
