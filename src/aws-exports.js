const outputsJson = require('../amplify_outputs.json');

const awsmobile = {
    "aws_project_region": outputsJson.Region || "eu-west-2",
    "aws_cognito_region": outputsJson.Region || "eu-west-2",
    "aws_user_pools_id": outputsJson.UserPoolId,
    "aws_user_pools_web_client_id": outputsJson.WebClientId,
    "oauth": {},
    "aws_cognito_username_attributes": [
        "EMAIL"
    ],
    "aws_cognito_social_providers": [],
    "aws_cognito_signup_attributes": [
        "EMAIL"
    ],
    "aws_cognito_mfa_configuration": "OFF",
    "aws_cognito_mfa_types": [
        "SMS"
    ],
    "aws_cognito_password_protection_settings": {
        "passwordPolicyMinLength": 8,
        "passwordPolicyCharacters": []
    },
    "aws_cognito_verification_mechanisms": [
        "EMAIL"
    ],
    "aws_cloud_logic_custom": [
        {
            "name": "preGenerateWallet",
            "endpoint": outputsJson.ApiEndpoint,
            "region": outputsJson.Region || "eu-west-2"
        }
    ]
};

export default awsmobile;
