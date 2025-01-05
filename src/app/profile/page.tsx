'use client';

import { useEffect, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Lambda } from 'aws-amplify';
import { Card, Heading, Flex, Text, Loader, Button, Link } from '@aws-amplify/ui-react';

interface UserProfile {
  email: string;
  address: string;
  userId: string;
}

export default function ProfilePage() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user) return;

        const response = await Lambda.invoke('preGenerateWallet', {
          operation: 'GET_BY_USER_ID',
          userId: user.attributes?.sub
        });

        if (response.statusCode === 200) {
          const data = JSON.parse(response.body);
          setProfile(data);
        } else {
          setError('Failed to fetch profile data');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Error loading profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (!user) {
    return (
      <Flex direction="column" alignItems="center" padding="2rem">
        <Text>Please sign in to view your profile</Text>
      </Flex>
    );
  }

  if (loading) {
    return (
      <Flex direction="column" alignItems="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex direction="column" alignItems="center" padding="2rem">
        <Text color="red" variation="error">
          {error}
        </Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" alignItems="center" padding="2rem">
      <Card variation="elevated" padding="2rem" width="100%" maxWidth="600px">
        <Heading level={2} marginBottom="1rem">
          Profile
        </Heading>
        
        <Flex direction="column" gap="1rem">
          <Flex direction="column">
            <Text fontWeight="bold">Email</Text>
            <Text>{profile?.email}</Text>
          </Flex>

          <Flex direction="column">
            <Text fontWeight="bold">Wallet Address</Text>
            <Flex alignItems="center" gap="1rem">
              <Text>{profile?.address}</Text>
              <Link
                href={`https://etherscan.io/address/${profile?.address}`}
                isExternal={true}
                color="blue"
              >
                View on Etherscan
              </Link>
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
