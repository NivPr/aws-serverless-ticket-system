#!/usr/bin/env node
const cdk = require('aws-cdk-lib');
const { AwsCdkAppStack } = require('../lib/aws_cdk_app-stack');

const app = new cdk.App();
new AwsCdkAppStack(app, 'AwsCdkAppStack');
