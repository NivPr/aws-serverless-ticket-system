const apigateway = require('aws-cdk-lib/aws-apigateway');
const cognito = require('aws-cdk-lib/aws-cognito');
require('dotenv').config();
function createAuthorizer(scope) {
  const userPool = cognito.UserPool.fromUserPoolId(scope, 'MyUserPool', process.env.USER_POOL_ID);
  return new apigateway.CognitoUserPoolsAuthorizer(scope, 'MyCognitoAuthorizer', {
    cognitoUserPools: [userPool],
  });
}

module.exports = { createAuthorizer };
