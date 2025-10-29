const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  ConfirmSignUpCommand
} = require("@aws-sdk/client-cognito-identity-provider");
const crypto = require('crypto');

function calculateSecretHash(username, clientId, clientSecret) {
  const message = username + clientId;
  const hmac = crypto.createHmac('sha256', clientSecret);
  hmac.update(message);
  return hmac.digest('base64');
}

function createCognitoClient(region) {
  return new CognitoIdentityProviderClient({ region });
}

async function signUp(client, username, password, email, clientId, clientSecret) {
  const secretHash = calculateSecretHash(username, clientId, clientSecret);
  const command = new SignUpCommand({
    ClientId: clientId,
    Username: username,
    Password: password,
    SecretHash: secretHash,
    UserAttributes: [{ Name: "email", Value: email }],
  });

  return client.send(command);
}

async function signIn(client, username, password, clientId, clientSecret) {
  const secretHash = calculateSecretHash(username, clientId, clientSecret);
  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
      SECRET_HASH: secretHash
    },
  });
  return client.send(command);
}

async function confirmSignUp(client, username, confirmationCode, clientId, clientSecret) {
  const secretHash = calculateSecretHash(username, clientId, clientSecret);
  const command = new ConfirmSignUpCommand({
    ClientId: clientId,
    SecretHash: secretHash,
    Username: username,
    ConfirmationCode: confirmationCode,
  });

  return client.send(command);
}

module.exports = {
  calculateSecretHash,
  createCognitoClient,
  signUp,
  signIn,
  confirmSignUp
};
