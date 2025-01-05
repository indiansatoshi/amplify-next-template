export const getWalletByUserId = /* GraphQL */ `
  query GetWalletByUserId($userId: ID!) {
    getWalletByUserId(userId: $userId) {
      userId
      email
      address
    }
  }
`;
