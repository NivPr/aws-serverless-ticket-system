const fs = require('fs');
const path = require('path');
const iam = require('aws-cdk-lib/aws-iam');

function loadAndAttachPolicy(lambdaFunction, fileName) {
  const policyPath = path.join(__dirname, '..', 'permissions', fileName);
  const policyJson = JSON.parse(fs.readFileSync(policyPath, 'utf8'));

  if (!policyJson || !Array.isArray(policyJson.Statement)) {
    throw new Error("Invalid policy JSON: missing or malformed 'Statement' array");
  }

  policyJson.Statement.forEach(stmt => {
    lambdaFunction.addToRolePolicy(iam.PolicyStatement.fromJson(stmt));
  });
}

module.exports = { loadAndAttachPolicy };
