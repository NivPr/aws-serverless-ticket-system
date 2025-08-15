const cdk = require('aws-cdk-lib');
const { createTicketFunc } = require('./lambda_func_builder');
const { createApiGateway } = require('./api-gateway');
const fs = require('fs');
const path = require('path');
const iam = require('aws-cdk-lib/aws-iam');

class AwsCdkAppStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const lambdaPolicyJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'permissions', 'ticket_func_permissions.json')));
    const lambdaFunction = createTicketFunc(this);
    lambdaPolicyJson.Statement.forEach(stmt => {
      lambdaFunction.addToRolePolicy(iam.PolicyStatement.fromJson(stmt));
    });
    const api = createApiGateway(this, lambdaFunction);

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
    });
  }
}

module.exports = { AwsCdkAppStack };

