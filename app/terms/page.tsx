import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Fleet Cost Tracker",
  description: "Terms of Service for Fleet Cost Tracker",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-muted-foreground mb-4">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing or using Fleet Cost Tracker ("the Service"), you agree to be bound by
            these Terms of Service. If you disagree with any part of these terms, you may not
            access the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use License</h2>
          <p>
            Permission is granted to temporarily use the Service for personal or commercial
            purposes. This is the grant of a license, not a transfer of title, and under this
            license you may not:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose without written consent</li>
            <li>Attempt to reverse engineer any software contained in the Service</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
          <p>
            When you create an account with us, you must provide information that is accurate,
            complete, and current at all times. You are responsible for safeguarding the password
            and for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Service in any way that violates applicable laws or regulations</li>
            <li>Transmit any malicious code or viruses</li>
            <li>Attempt to gain unauthorized access to the Service</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Use automated systems to access the Service without permission</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by Fleet
            Cost Tracker and are protected by international copyright, trademark, patent, trade
            secret, and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Ownership</h2>
          <p>
            You retain ownership of all data you upload to the Service. By using the Service,
            you grant us a license to store, process, and display your data as necessary to
            provide the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Service Availability</h2>
          <p>
            We strive to maintain high availability but do not guarantee uninterrupted access
            to the Service. We reserve the right to modify, suspend, or discontinue the Service
            at any time with or without notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
          <p>
            In no event shall Fleet Cost Tracker, nor its directors, employees, partners, agents,
            suppliers, or affiliates, be liable for any indirect, incidental, special, consequential,
            or punitive damages resulting from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless Fleet Cost Tracker from any claims,
            damages, obligations, losses, liabilities, costs, or debt arising from your use of
            the Service or violation of these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice, for any
            breach of these Terms. Upon termination, your right to use the Service will cease
            immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of any
            material changes. Your continued use of the Service after such modifications constitutes
            acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">12. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of [Your
            Jurisdiction], without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mt-8 mb-4">13. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p>
            Email: legal@yourdomain.com<br />
            Address: [Your Company Address]
          </p>
        </section>
      </div>
    </div>
  )
}
