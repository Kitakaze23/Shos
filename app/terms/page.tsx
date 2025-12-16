import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Fleet Cost Tracker",
  description: "Terms of Service for Fleet Cost Tracker",
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <section>
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: 16 December 2025
        </p>
      </section>

      <section className="space-y-4 text-sm leading-relaxed">
        <p>
          By accessing or using Fleet Cost Tracker (&quot;the Service&quot;), you agree
          to be bound by these Terms of Service. If you disagree with any part of
          these terms, you may not access the Service.
        </p>

        <p>
          Permission is granted to temporarily use the Service for personal or
          commercial purposes. This is the grant of a license, not a transfer of
          title.
        </p>

        <p>
          When you create an account with us, you must provide information that is
          accurate, complete, and current at all times. You are responsible for
          safeguarding the password and for all activities that occur under your
          account.
        </p>

        <p>
          The Service and its original content, features, and functionality are
          owned by Fleet Cost Tracker and are protected by applicable intellectual
          property laws.
        </p>

        <p>
          You retain ownership of all data you upload to the Service. By using the
          Service, you grant us a license to store, process, and display your data
          as necessary to provide the Service.
        </p>

        <p>
          We strive to maintain high availability but do not guarantee
          uninterrupted access to the Service. We may modify, suspend, or
          discontinue the Service at any time with or without notice.
        </p>

        <p>
          In no event shall Fleet Cost Tracker, nor its directors, employees,
          partners, agents, suppliers, or affiliates, be liable for any indirect,
          incidental, special, consequential, or punitive damages resulting from
          your use of the Service.
        </p>

        <p>
          You agree to defend, indemnify, and hold harmless Fleet Cost Tracker
          from any claims, damages, obligations, losses, liabilities, costs, or
          debt arising from your use of the Service or violation of these Terms.
        </p>

        <p>
          We may terminate or suspend your account immediately, without prior
          notice, for any breach of these Terms. Upon termination, your right to
          use the Service will cease immediately.
        </p>

        <p>
          We reserve the right to modify these Terms at any time. Your continued
          use of the Service after such modifications constitutes acceptance of
          the updated Terms.
        </p>

        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of your jurisdiction, without regard to its conflict of law
          provisions.
        </p>
      </section>

      <section className="space-y-1 text-sm">
        <p>If you have any questions about these Terms, please contact us:</p>
        <p>Email: legal@yourdomain.com</p>
        <p>Address: [Your Company Address]</p>
      </section>
    </main>
  );
}
