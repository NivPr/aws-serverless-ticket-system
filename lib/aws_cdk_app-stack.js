const cdk = require('aws-cdk-lib');
const { createTicketFunc, createAuthFunc } = require('./lambda_func_builder');
const { createApiGateway } = require('../api_gateway/tickets-api-gateway');
const { createAuthApiGateway } = require('../api_gateway/auth-api-gateway');
const { loadAndAttachPolicy } = require('./utils/attachPolicy');
require('dotenv').config();

class AwsCdkAppStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create Lambda functions
    const ticketLambda = createTicketFunc(this);
    const authLambda = createAuthFunc(this);

    // Attach IAM policies to Lambda functions
    loadAndAttachPolicy(ticketLambda, 'ticket_func_permissions.json');
    loadAndAttachPolicy(authLambda, 'auth_func_permissions.json');

    // Create API Gateway for the ticket Lambda function
    const ticketApi = createApiGateway(this, ticketLambda);
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: ticketApi.url,
    });

    // Create API Gateway for the auth Lambda function
    const authApi = createAuthApiGateway(this, authLambda);
    new cdk.CfnOutput(this, 'AuthApiUrl', {
      value: authApi.url,
    });
  }
}

module.exports = { AwsCdkAppStack };


