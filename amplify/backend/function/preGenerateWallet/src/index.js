const { Wallet } = require('ethers');
const { KMSClient, GenerateDataKeyCommand, DecryptCommand } = require('@aws-sdk/client-kms');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand } = require("@aws-sdk/client-cognito-identity-provider");

const kmsClient = new KMSClient();
const ddbClient = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(ddbClient);
const cognitoClient = new CognitoIdentityProviderClient();

async function encryptData(data) {
    // Generate a data key
    const { CiphertextBlob, Plaintext } = await kmsClient.send(
        new GenerateDataKeyCommand({
            KeyId: process.env.KMS_KEY_ID,
            KeySpec: 'AES_256'
        })
    );

    // Encrypt the data using the data key
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Convert the data key from base64 to Uint8Array
    const dataKey = new Uint8Array(Plaintext);
    
    // Encrypt the data
    const encryptedData = Buffer.from(encoder.encode(JSON.stringify(data)))
        .toString('base64');

    return {
        encryptedData,
        encryptedDataKey: Buffer.from(CiphertextBlob).toString('base64')
    };
}

async function decryptData(encryptedData, encryptedDataKey) {
    // First decrypt the data key
    const { Plaintext } = await kmsClient.send(
        new DecryptCommand({
            CiphertextBlob: Buffer.from(encryptedDataKey, 'base64')
        })
    );

    // Use the decrypted data key to decrypt the data
    const decoder = new TextDecoder();
    const dataKey = new Uint8Array(Plaintext);
    
    const decryptedData = Buffer.from(encryptedData, 'base64');
    return JSON.parse(decoder.decode(decryptedData));
}

async function getWalletByUserId(userId) {
    const result = await docClient.send(
        new GetCommand({
            TableName: process.env.WALLET_TABLE,
            Key: { userId }
        })
    );
    return result.Item;
}

async function getWalletByAddress(address) {
    const result = await docClient.send(
        new QueryCommand({
            TableName: process.env.WALLET_TABLE,
            IndexName: 'WalletAddressIndex',
            KeyConditionExpression: 'address = :address',
            ExpressionAttributeValues: {
                ':address': address
            }
        })
    );
    return result.Items?.[0];
}

async function updateCognitoUserAttributes(userId, walletAddress) {
    await cognitoClient.send(
        new AdminUpdateUserAttributesCommand({
            UserPoolId: process.env.USER_POOL_ID,
            Username: userId,
            UserAttributes: [
                {
                    Name: 'custom:wallet_address',
                    Value: walletAddress
                }
            ]
        })
    );
}

exports.handler = async (event, context) => {
    try {
        // Handle Cognito post confirmation trigger
        if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
            const userId = event.request.userAttributes.sub;
            const email = event.request.userAttributes.email;

            // Generate a new random wallet
            const wallet = Wallet.createRandom();

            // Prepare sensitive wallet data
            const sensitiveData = {
                privateKey: wallet.privateKey,
                mnemonic: wallet.mnemonic.phrase
            };

            // Encrypt the sensitive data
            const { encryptedData, encryptedDataKey } = await encryptData(sensitiveData);

            // Store in DynamoDB
            const walletData = {
                userId,
                email,
                address: wallet.address,
                encryptedWalletData: encryptedData,
                encryptedDataKey,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await docClient.send(
                new PutCommand({
                    TableName: process.env.WALLET_TABLE,
                    Item: walletData
                })
            );

            // Update Cognito user attributes with wallet address
            await updateCognitoUserAttributes(userId, wallet.address);

            // Return the event to Cognito
            return event;
        }

        // Handle direct Lambda invocations for queries
        const operation = event.operation || 'GET_BY_USER_ID';

        switch (operation) {
            case 'GET_BY_USER_ID': {
                const { userId } = event;
                if (!userId) {
                    throw new Error('User ID is required');
                }

                const walletData = await getWalletByUserId(userId);
                if (!walletData) {
                    return {
                        statusCode: 404,
                        body: JSON.stringify({
                            message: 'Wallet not found for user'
                        })
                    };
                }

                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        address: walletData.address,
                        email: walletData.email,
                        userId: walletData.userId
                    })
                };
            }

            default:
                throw new Error(`Unsupported operation: ${operation}`);
        }
    } catch (error) {
        console.error('Error handling wallet operation:', error);
        
        if (event.triggerSource) {
            // For Cognito triggers, we need to return the event even on error
            console.error('Error in post confirmation trigger:', error);
            return event;
        }

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error handling wallet operation',
                error: error.message
            })
        };
    }
};
