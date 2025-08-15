const lambda = require('aws-cdk-lib/aws-lambda');

function createTicketFunc(scope) {
  return ticketFunc =  new lambda.Function(scope, 'TicketFunc', {
    runtime: lambda.Runtime.NODEJS_18_X,
    handler: 'index.handler',
    code: lambda.Code.fromAsset('ticket_lambda_func'),
  });
}

module.exports = { createTicketFunc };