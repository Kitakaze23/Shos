import type { Metadata } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ | Fleet Cost Tracker",
  description: "Frequently asked questions about Fleet Cost Tracker",
};

type FAQQuestion = {
  q: string;
  a: string;
};

type FAQCategory = {
  category: string;
  questions: FAQQuestion[];
};

const faqs: FAQCategory[] = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How do I create an account?",
        a: "Click the 'Sign Up' button on the homepage, enter your email and password, then verify your email address. You can also sign up using Google or GitHub.",
      },
      {
        q: "Is there a free trial?",
        a: "Yes! You can create unlimited projects and track equipment costs for free. Some advanced features may require a subscription.",
      },
      {
        q: "What currencies are supported?",
        a: "We support all major currencies including RUB, USD, EUR, GBP, and more. You can set a default currency in your profile and use different currencies for different projects.",
      },
    ],
  },
  {
    category: "Projects & Equipment",
    questions: [
      {
        q: "How many projects can I create?",
        a: "You can create unlimited projects. Each project can have multiple pieces of equipment and team members.",
      },
      {
        q: "How do I calculate depreciation?",
        a: "Depreciation is automatically calculated using the straight-line method. You can specify the purchase price, acquisition date, service life, and optional salvage value. Monthly depreciation is calculated as (Purchase Price - Salvage Value) / (Service Life × 12).",
      },
      {
        q: "Can I import equipment from CSV?",
        a: "Yes! You can bulk import equipment using a CSV file. The CSV should include columns for name, purchase price, acquisition date, service life, and category.",
      },
      {
        q: "What happens if I archive equipment?",
        a: "Archived equipment is hidden from active calculations but remains in the database for historical records. You can unarchive it later if needed.",
      },
    ],
  },
  {
    category: "Cost Calculations",
    questions: [
      {
        q: "How are costs calculated?",
        a: "Total monthly cost = Fixed Costs + Variable Costs + Depreciation. Fixed costs include insurance, salaries, and rent. Variable costs are calculated as (Fuel Cost + Maintenance Cost) × Operating Hours.",
      },
      {
        q: "What is cost per hour?",
        a: "Cost per hour = Total Monthly Cost / Operating Hours. This metric helps you understand the hourly cost of operating your equipment.",
      },
      {
        q: "How is break-even calculated?",
        a: "Break-even hours = (Fixed Costs + Depreciation) / Variable Cost per Hour. This tells you the minimum hours needed to cover all costs.",
      },
      {
        q: "Can I change cost allocation methods?",
        a: "Yes! You can choose between three methods: by operating hours, equal split, or by ownership share. Change this in project settings.",
      },
    ],
  },
  {
    category: "Team & Sharing",
    questions: [
      {
        q: "How do I invite team members?",
        a: "Go to the Team Members tab in your project, click 'Add Member', enter their email address, set their role and ownership share, then click 'Add'. They'll receive an email invitation.",
      },
      {
        q: "What are the different roles?",
        a: "Owner: Full control, can delete project. Admin: Can edit project and manage members. Member: Can edit equipment and parameters. Viewer: Read-only access.",
      },
      {
        q: "Can I share projects with external users?",
        a: "Yes! You can share projects with anyone via email. They'll receive a link to access the project with the permissions you set.",
      },
      {
        q: "How is cost allocated to team members?",
        a: "Cost allocation depends on your chosen method: by hours (proportional to operating hours), equal split (divided equally), or by ownership share (proportional to percentage).",
      },
    ],
  },
  {
    category: "Reports & Export",
    questions: [
      {
        q: "What report types are available?",
        a: "Monthly Summary: Current month breakdown with trends. Annual Forecast: 12-month projection. Depreciation Schedule: Equipment depreciation over time. Scenario Analysis: Compare different usage/cost scenarios.",
      },
      {
        q: "Can I export reports?",
        a: "Yes! You can export reports as PDF, Excel (.xlsx), or CSV. PDFs include charts and formatted tables. Excel files have multiple sheets with editable data.",
      },
      {
        q: "Can I schedule automatic reports?",
        a: "Yes! You can set up scheduled email reports (weekly or monthly) that are automatically sent to team members.",
      },
      {
        q: "Are reports accurate?",
        a: "All calculations use Decimal.js for precision, ensuring accurate financial calculations. Reports are generated in real-time based on current project data.",
      },
    ],
  },
  {
    category: "Account & Security",
    questions: [
      {
        q: "How do I reset my password?",
        a: "Click 'Forgot Password' on the login page, enter your email, and you'll receive a password reset link. The link expires after 1 hour.",
      },
      {
        q: "How do I enable two-factor authentication?",
        a: "Go to Profile → Security → Two-Factor Authentication, click 'Enable', scan the QR code with your authenticator app, then enter the verification code.",
      },
      {
        q: "Can I export my data?",
        a: "Yes! Go to Profile → Data Export to download all your data in JSON format (GDPR compliant).",
      },
      {
        q: "How do I delete my account?",
        a: "Go to Profile → Delete Account, type 'DELETE' to confirm, and your account will be scheduled for deletion after a 30-day grace period. You can cancel during this period.",
      },
    ],
  },
  {
    category: "Technical",
    questions: [
      {
        q: "Is my data secure?",
        a: "Yes! We use HTTPS/TLS 1.3 encryption, secure password hashing (bcrypt), and follow industry best practices. All data is encrypted in transit and at rest.",
      },
      {
        q: "Do you have an API?",
        a: "Yes! We provide a RESTful API for programmatic access. See the API documentation for details and examples.",
      },
      {
        q: "Can I use this on mobile?",
        a: "Yes! The platform is fully responsive and works on mobile, tablet, and desktop. We also support PWA installation for a native app-like experience.",
      },
      {
        q: "What browsers are supported?",
        a: "We support all modern browsers: Chrome, Firefox, Safari, Edge. For best experience, use the latest version of your browser.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Find answers to common questions about Fleet Cost Tracker.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>
            <strong>Email:</strong> support@yourdomain.com
          </p>
          <p>
            <strong>Documentation:</strong> Full documentation is available in
            the Docs section.
          </p>
          <p>
            <strong>Troubleshooting:</strong> Check common issues and solutions
            in the help center.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {faqs.map((section) => (
              <AccordionItem key={section.category} value={section.category}>
                <AccordionTrigger>{section.category}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {section.questions.map((item) => (
                      <div key={item.q}>
                        <p className="font-medium">{item.q}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}