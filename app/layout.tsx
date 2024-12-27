"use client"

import React from "react";
import { Amplify } from "aws-amplify";
import "./globals.css";
import { Authenticator } from "@aws-amplify/ui-react";
import outputs from "@/amplify_outputs.json";
import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { ThemeProvider } from "@/components/theme-provider"

Amplify.configure(outputs);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Authenticator.Provider>
            <AuthWrapper>
              {children}
            </AuthWrapper>
          </Authenticator.Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}