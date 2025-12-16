import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "./db";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.COOKIE_DOMAIN
            : undefined,
      },
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        // Check if account is scheduled for deletion
        if (user.deletedAtScheduled) {
          const daysUntilDeletion = Math.ceil(
            (user.deletedAtScheduled.getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          );

          if (daysUntilDeletion > 0) {
            throw new Error(
              `Account scheduled for deletion in ${daysUntilDeletion} days. Contact support to restore.`
            );
          }
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Activity logging will be handled in callbacks
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-email",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // добавляем кастомное поле id на токен
        (token as any).id = (user as any).id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // читаем кастомное поле id с токена
        (session.user as any).id = (token as any).id as string;
      }
      return session;
    },

    async signIn({ user, account }) {
      // Log activity for credential-based sign-ins
      if (account?.provider === "credentials" && (user as any).id) {
        try {
          await prisma.activityLog.create({
            data: {
              userId: (user as any).id,
              action: "login",
              description: "User logged in",
            },
          });
        } catch (error) {
          console.error("Failed to log activity:", error);
          // Не блокируем логин, если логирование упало
        }
      }
      return true;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};