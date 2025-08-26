const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  ConfirmSignUpCommand,
  AdminGetUserCommand
} = require("@aws-sdk/client-cognito-identity-provider");
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const crypto = require('crypto');
const REGION = process.env.REGION;
const CLIENT_ID = process.env.CLIENT_ID;
const USER_POOL_ID = process.env.USER_POOL_ID;
const CLIENT_SECRET = process.env.USER_POOL_ID;
const ddbClient = new DynamoDBClient({ region: REGION });

const client = new CognitoIdentityProviderClient({ region: REGION });
function calculateSecretHash(username, clientId, clientSecret) {
  const message = username + clientId;
  const hmac = crypto.createHmac('sha256', clientSecret);
  hmac.update(message);
  return hmac.digest('base64');
}

async function signUp(username, password, email, secretHash) {
  const command = new SignUpCommand({
    ClientId: CLIENT_ID,
    Username: username,
    Password: password,
    SecretHash: secretHash,
    UserAttributes: [{ Name: "email", Value: email }],
  });

  return client.send(command);
}

async function createUserRecordInDynamoDB(userId, email) {
  const command = new PutItemCommand({
    TableName: "ticketAppUsers",
    Item: {
      userId: { S: userId },
      email: { S: email },
      createdAt: { S: new Date().toISOString() }
    }
  });

  try {
    await ddbClient.send(command);
    console.log("User added successfully");
  } catch (err) {
    console.error("DynamoDB error:", err);
  }
}



async function signIn(username, password, secretHash) {
  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
      SECRET_HASH: secretHash
    },
  });
  return client.send(command);
}

async function confirmSignUp(username, confirmationCode) {
  const secretHash = calculateSecretHash(username, CLIENT_ID, CLIENT_SECRET);

  const getUserCommand = new AdminGetUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: username
  });
  const userData = await client.send(getUserCommand);

  const userId = userData.UserAttributes.find(attr => attr.Name === 'sub')?.Value;
  const email = userData.UserAttributes.find(attr => attr.Name === 'email')?.Value;

  await createUserRecordInDynamoDB(userId, email);

  const command = new ConfirmSignUpCommand({
    ClientId: CLIENT_ID,
    SecretHash: secretHash,
    Username: username,
    ConfirmationCode: confirmationCode,
  });

  return client.send(command);
}

exports.handler = async (event) => {
  try {
    const httpMethod = event.httpMethod || event.requestContext?.http?.method;
    const path = event.path || event.rawPath;
    const body = event.body ? JSON.parse(event.body) : {};

    console.log("DEBUG:", { httpMethod, path });

  
    switch (true) {
      case httpMethod === "POST" && path.endsWith("/auth/signUp"):
        {
          const { username, password, email } = body;
          if (!username || !password || !email) {
            return {
              statusCode: 400,
              body: JSON.stringify({ message: "Missing username, password or email" }),
            };
          }
          const secretHash = calculateSecretHash(username, CLIENT_ID, CLIENT_SECRET);
          const result = await signUp(username, password, email, secretHash);
          return {
            statusCode: 200,
            body: JSON.stringify({ message: "SignUp successful", data: result }),
          };
        }

      case httpMethod === "POST" && path.endsWith("/auth/login"):
        {
          const { username, password } = body;
          if (!username || !password) {
            return {
              statusCode: 400,
              body: JSON.stringify({ message: "Missing username or password" }),
            };
          }
          const secretHash = calculateSecretHash(username, CLIENT_ID, CLIENT_SECRET);
          const result = await signIn(username, password, secretHash);
          return {
            statusCode: 200,
            body: JSON.stringify({ message: "SignIn successful", data: result.AuthenticationResult }),
          };
        }

      case httpMethod === "POST" && path.endsWith("/auth/verifyCode"):
        {
          const { username, confirmationCode } = body;
          if (!username || !confirmationCode) {
            return {
              statusCode: 400,
              body: JSON.stringify({ message: "Missing username or confirmationCode" }),
            };
          }
          const result = await confirmSignUp(username, confirmationCode);
          return {
            statusCode: 200,
            body: JSON.stringify({ message: "ConfirmSignUp successful", data: result }),
          };
        }

      default:
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Route not found" }),
        };
    }
  } catch (error) {
    console.error("Error in handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error.message || "Unknown error",
      }),
    };
  }
};
