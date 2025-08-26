const fs = require('fs');
const path = require('path');
const iam = require('aws-cdk-lib/aws-iam');


function loadAndAttachPolicy(lambdaFunction, folder, fileName) {
  const policyPath = path.join(__dirname, folder, fileName);
  const policyJson = JSON.parse(fs.readFileSync(policyPath, 'utf8'));

  if (!policyJson || !Array.isArray(policyJson.Statement)) {
    throw new Error("Invalid policy JSON: missing or malformed 'Statement' array");
  }

  policyJson.Statement.forEach(stmt => {
    const policyStatement = iam.PolicyStatement.fromJson(stmt);
    lambdaFunction.addToRolePolicy(policyStatement);
  });
}

module.exports = { loadAndAttachPolicy };