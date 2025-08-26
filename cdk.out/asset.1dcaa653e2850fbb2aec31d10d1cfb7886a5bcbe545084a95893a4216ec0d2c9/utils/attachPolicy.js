const fs = require('fs');
const path = require('path');
const iam = require('aws-cdk-lib/aws-iam');

/**
 * Loads a policy JSON file from the 'permissions' folder at project root,
 * and attaches it to the given Lambda function.
 *
 * @param {import('aws-cdk-lib/aws-lambda').Function} lambdaFunction - The Lambda function
 * @param {string} fileName - The name of the policy JSON file
 */
function loadAndAttachPolicy(lambdaFunction, fileName) {
  const projectRoot = path.resolve(__dirname, '../../'); // adjust if needed
  const policyPath = path.join(projectRoot, 'permissions', fileName);

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

