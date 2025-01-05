'use client';

import { useEffect, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from '@aws-amplify/api';
import { Card, Heading, Flex, Text, Loader, Button } from '@aws-amplify/ui-react';
import { GraphQLResult } from '@aws-amplify/api';
import { getWalletByUserId } from '@/app/graphql/queries';
import '@/app/lib/amplify';

interface UserProfile {
  email: string;
  address: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface GetWalletByUserIdData {
  getWalletByUserId: UserProfile;
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

        console.log('Fetching profile for user:', user.username);
        const response = await generateClient().graphql<GetWalletByUserIdData>({
          query: getWalletByUserId,
          variables: {
            userId: user.username
          },
          authMode: 'userPool'
        });

        console.log('Profile response:', response);
        if ('data' in response && response.data?.getWalletByUserId) {
          setProfile(response.data.getWalletByUserId);
          setError(null);
        } else {
          setError('No wallet found. Please generate one first.');
          setProfile(null);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Error loading profile data. Please try again later.');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
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
        <Card variation="elevated" padding="2rem" width="100%" maxWidth="600px">
          <Heading level={2} marginBottom="1rem">
            Profile
          </Heading>
          <Text color="red" variation="error" marginBottom="1rem">
            {error}
          </Text>
          {error.includes('No wallet') && (
            <Button onClick={() => {
              // TODO: Add wallet generation logic
              console.log('Generate wallet clicked');
            }}>
              Generate Wallet
            </Button>
          )}
        </Card>
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
            <Text>{profile?.address}</Text>
          </Flex>

          <Flex direction="column">
            <Text fontWeight="bold">Created At</Text>
            <Text>{profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : 'N/A'}</Text>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
