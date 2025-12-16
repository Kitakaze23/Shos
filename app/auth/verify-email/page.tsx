"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);

        if (response.redirected) {
          const url = new URL(response.url);

          if (url.pathname === "/auth/signin") {
            setStatus("success");
            setMessage(
              "Email verified successfully! Redirecting to sign in...",
            );
            setTimeout(() => {
              router.push("/auth/signin?verified=true");
            }, 2000);
          } else {
            setStatus("error");
            setMessage("Verification failed");
          }
        } else if (!response.ok) {
          setStatus("error");
          setMessage("Verification failed");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification");
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email verification</CardTitle>
          <CardDescription>
            We are verifying your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Please wait while we verify your email.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="font-medium">{message}</p>
              <p className="text-sm text-muted-foreground">
                You will be redirected shortly. If not, click the button below.
              </p>
              <Button asChild className="mt-2">
                <Link href="/auth/signin?verified=true">Go to sign in</Link>
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center space-y-3">
              <XCircle className="h-10 w-10 text-destructive" />
              <p className="font-medium">{message}</p>
              <p className="text-sm text-muted-foreground">
                The verification link may be invalid or expired. You can request
                a new verification email.
              </p>
              <Button asChild variant="outline" className="mt-2">
                <Link href="/auth/resend-verification">
                  Resend verification email
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/signin">Back to sign in</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  );
}