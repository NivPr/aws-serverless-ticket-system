
const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  ConfirmSignUpCommand
} = require("@aws-sdk/client-cognito-identity-provider");
const REGION = process.env.REGION;
const CLIENT_ID = process.env.CLIENT_ID;
const crypto = require('crypto');
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

  const command = new ConfirmSignUpCommand({
    ClientId: CLIENT_ID,
    SecretHash: secretHash,
    Username: username,
    ConfirmationCode: confirmationCode,
  });

  return client.send(command);
}

module.exports = { 
  calculateSecretHash, 
  signUp, 
  signIn, 
  confirmSignUp 
};

