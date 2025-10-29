require('dotenv').config();
const lambda = require('aws-cdk-lib/aws-lambda');

function createTicketFunc(scope) {
  return ticketFunc =  new lambda.Function(scope, 'TicketFunc', {
    runtime: lambda.Runtime.NODEJS_18_X,
    handler: 'index.handler',
    code: lambda.Code.fromAsset('lambda_functions/ticket_lambda_func'),
  });
}

function createAuthFunc(scope) {
  return authFunc =  new lambda.Function(scope, 'AuthFunc', {
    runtime: lambda.Runtime.NODEJS_18_X,
    handler: 'index.handler',
    code: lambda.Code.fromAsset('lambda_functions/auth_lambda_func'),
    environment : {
      CLIENT_ID: process.env.CLIENT_ID,
      REGION: process.env.REGION,
      USER_POOL_ID: process.env.USER_POOL_ID,
      CLIENT_SECRET: process.env.CLIENT_SECRET,
    }
  });
}

module.exports = { createTicketFunc, createAuthFunc };