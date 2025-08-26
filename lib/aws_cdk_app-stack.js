const cdk = require('aws-cdk-lib');
const { createTicketFunc,createAuthFunc} = require('./lambda_func_builder');
const { createApiGateway } = require('../api_gateway/tickets-api-gateway');
const { createAuthApiGateway } = require('../api_gateway/auth-api-gateway');
const { loadAndAttachPolicy } = require('./utils/attachPolicy');
require('dotenv').config();
class AwsCdkAppStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const lambdaFunction = createTicketFunc(this);
    const authFunc = createAuthFunc(this);

loadAndAttachPolicy(lambdaFunction,"ticket_func_permissions.json");
loadAndAttachPolicy(authFunc, "auth_func_permissions.json");

    const api = createApiGateway(this, lambdaFunction);
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
    });

    const auth_api = createAuthApiGateway(this, authFunc);
    new cdk.CfnOutput(this, 'authApiUrl', {
      value: auth_api.url,
    });
  }


}

module.exports = { AwsCdkAppStack };

