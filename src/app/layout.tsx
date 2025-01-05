'use client';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Header from '../components/Header';

// Import your Amplify configuration
import awsconfig from '../aws-exports';
Amplify.configure(awsconfig);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Authenticator.Provider>
          <Header />
          <main>{children}</main>
        </Authenticator.Provider>
      </body>
    </html>
  );
}
