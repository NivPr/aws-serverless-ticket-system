const apigateway = require('aws-cdk-lib/aws-apigateway');
const cognito = require('aws-cdk-lib/aws-cognito');

function createAuthorizer(scope) {
  const userPool = cognito.UserPool.fromUserPoolId(scope, 'MyUserPool', 'eu-west-1_dqNuol3Fx');
  return new apigateway.CognitoUserPoolsAuthorizer(scope, 'MyCognitoAuthorizer', {
    cognitoUserPools: [userPool],
  });
}

module.exports = { createAuthorizer };
