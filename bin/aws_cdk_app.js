#!/usr/bin/env node
const cdk = require('aws-cdk-lib');
const { AwsCdkAppStack } = require('../lib/aws_cdk_app-stack');

const app = new cdk.App();

// שם הבראנץ' נשלח מה-GitHub Action
const branch = process.env.BRANCH_NAME || 'dev';

// הפיכת שם הבראנץ' לבטוח לשימוש כ-stack name
const safeBranchName = branch.replace(/[^a-zA-Z0-9-]/g, '-');

if (branch === 'main') {
  // פרודקשן
  new AwsCdkAppStack(app, 'ProdStack', {
    env: { account: '1234567890', region: 'eu-west-1' },
  });
} else {
  // כל branch אחר יקבל stack ניסיוני ייחודי
  new AwsCdkAppStack(app, `TestStack-${safeBranchName}`, {
    env: { account: '1234567890', region: 'eu-west-1' },
  });
}
