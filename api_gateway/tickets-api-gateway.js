const apigateway = require('aws-cdk-lib/aws-apigateway');
const logs = require('aws-cdk-lib/aws-logs');
const { createAuthorizer } = require('../cognitoAuthorizer');


function createApiGateway(scope, lambdaFunction) {
  const authorizer =  createAuthorizer(scope);
  const logGroup = new logs.LogGroup(scope, 'ApiAccessLogs');

  const api = new apigateway.RestApi(scope, 'MyApi', {
    restApiName: 'My Service',
    description: 'This service serves tickets.',
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
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
  });

  const tickets = api.root.addResource('tickets');
  const addTicket = tickets.addResource('addTicket');
  const editTicket = tickets.addResource('editTicket')
  const deleteTicket = tickets.addResource('delete');
  const searchTicket = tickets.addResource('searchByTitle');
  const singleTicket = tickets.addResource('{id}');

  addTicket.addMethod('POST', new apigateway.LambdaIntegration(lambdaFunction), {
    authorizer,
    authorizationType: apigateway.AuthorizationType.COGNITO,
  });

  editTicket.addMethod('PUT', new apigateway.LambdaIntegration(lambdaFunction), {
    authorizer,
    authorizationType: apigateway.AuthorizationType.COGNITO,
  });

  searchTicket.addMethod('GET', new apigateway.LambdaIntegration(lambdaFunction), {
    authorizer,
    authorizationType: apigateway.AuthorizationType.COGNITO,
  });

  deleteTicket.addMethod('DELETE', new apigateway.LambdaIntegration(lambdaFunction), {
    authorizer,
    authorizationType: apigateway.AuthorizationType.COGNITO,
  });

  singleTicket.addMethod('GET', new apigateway.LambdaIntegration(lambdaFunction), {
    authorizer,
    authorizationType: apigateway.AuthorizationType.COGNITO,
  });

  return api;
}

module.exports = { createApiGateway };
