const apigateway = require('aws-cdk-lib/aws-apigateway');
const logs = require('aws-cdk-lib/aws-logs');

function createAuthApiGateway(scope, authLambda) {
  const logGroup = new logs.LogGroup(scope, 'UserApiAccessLogs');

  const api = new apigateway.RestApi(scope, 'UserApi', {
    restApiName: 'User Service',
    description: 'This service handles user authentication.',
    cloudWatchRole: true,
    deployOptions: {
      stageName: 'dev',
      loggingLevel: apigateway.MethodLoggingLevel.INFO,
      dataTraceEnabled: true,
      metricsEnabled: true,
      accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
      accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
        caller: true,
        httpMethod: true,
        ip: true,
        protocol: true,
        requestTime: true,
        resourcePath: true,
        responseLength: true,
        status: true,
        user: true,
      }),
    },
    defaultCorsPreflightOptions: {
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: ['POST', 'OPTIONS'],
    },
  });

  const auth = api.root.addResource('auth');
  const signup = auth.addResource('signUp');
  const login = auth.addResource('login');
  const verify = auth.addResource('verifyCode');

  signup.addMethod('POST', new apigateway.LambdaIntegration(authLambda));
  login.addMethod('POST', new apigateway.LambdaIntegration(authLambda));
  verify.addMethod('POST', new apigateway.LambdaIntegration(authLambda));

  return api;
}

module.exports = { createAuthApiGateway };