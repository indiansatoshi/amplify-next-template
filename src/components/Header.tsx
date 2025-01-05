'use client';

import { useAuthenticator } from '@aws-amplify/ui-react';
import { Flex, Button, Link, Text } from '@aws-amplify/ui-react';
import NextLink from 'next/link';

export default function Header() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  return (
    <Flex
      as="header"
      padding="1rem"
      backgroundColor="white"
      boxShadow="0 2px 4px rgba(0,0,0,0.1)"
      justifyContent="space-between"
      alignItems="center"
    >
      <NextLink href="/" passHref>
        <Link>
          <Text fontSize="1.5rem" fontWeight="bold">
            My App
          </Text>
        </Link>
      </NextLink>

      <Flex gap="1rem" alignItems="center">
        {user ? (
          <>
            <NextLink href="/profile" passHref>
              <Link>Profile</Link>
            </NextLink>
            <Button onClick={signOut}>Sign Out</Button>
          </>
        ) : (
          <NextLink href="/login" passHref>
            <Link>Sign In</Link>
          </NextLink>
        )}
      </Flex>
    </Flex>
  );
}
