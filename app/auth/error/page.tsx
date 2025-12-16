"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const errorMessages: Record<string, string> = {
  InvalidToken: "Invalid verification token",
  TokenExpired: "Verification token has expired",
  VerificationFailed: "Email verification failed. Please try again.",
  Configuration: "There is a problem with the server configuration",
  AccessDenied: "You do not have permission to sign in",
  Default: "An error occurred during authentication",
};

function AuthErrorInner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  const message = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            Something went wrong while signing you in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <Button asChild className="w-full mt-2">
            <Link href="/auth/signin">Back to Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorInner />
    </Suspense>
  );
}