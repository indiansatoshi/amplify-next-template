'use client';

import { useEffect, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { Card, Heading, Flex, Text, Loader, Button, Link } from '@aws-amplify/ui-react';
import { GraphQLResult } from '@aws-amplify/api-graphql';
import { AuthUser } from '@aws-amplify/auth';
import { getWalletByUserId } from '@/app/graphql/queries';

// Define the GraphQL query
// const getWalletByUserId = /* GraphQL */ `
//   query GetWalletByUserId($userId: ID!) {
//     getWalletByUserId(userId: $userId) {
//       userId
//       email
//       address
//     }
//   }
// `;

interface UserProfile {
  email: string;
  address: string;
  userId: string;
}

interface GetWalletByUserIdData {
  getWalletByUserId: UserProfile;
}

export default function ProfilePage() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const client = generateClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user) return;

        const response = (await client.graphql({
          query: getWalletByUserId,
          variables: {
            userId: user.userId
          }
        })) as GraphQLResult<GetWalletByUserIdData>;

        if (response.data?.getWalletByUserId) {
          setProfile(response.data.getWalletByUserId);
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
