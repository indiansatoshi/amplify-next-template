"use client"

import React from "react";
import { Amplify } from "aws-amplify";
import "./globals.css";
import { Authenticator } from "@aws-amplify/ui-react";
import outputs from "@/amplify_outputs.json";
import { AuthWrapper } from "@/components/auth/auth-wrapper";

Amplify.configure(outputs);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Authenticator.Provider>
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </Authenticator.Provider>
      </body>
    </html>
  );
}