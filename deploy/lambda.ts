import { CloudwatchEventRule } from "@cdktf/provider-aws/lib/cloudwatch-event-rule";
import { CloudwatchEventTarget } from "@cdktf/provider-aws/lib/cloudwatch-event-target";
import { CloudwatchLogGroup } from "@cdktf/provider-aws/lib/cloudwatch-log-group";
import {
  DataAwsIamPolicyDocument,
  type DataAwsIamPolicyDocumentStatement,
} from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";
import { DataAwsLambdaFunction } from "@cdktf/provider-aws/lib/data-aws-lambda-function";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamRolePolicy } from "@cdktf/provider-aws/lib/iam-role-policy";
import {
  LambdaFunction,
  type LambdaFunctionConfig,
} from "@cdktf/provider-aws/lib/lambda-function";
import { LambdaPermission } from "@cdktf/provider-aws/lib/lambda-permission";
import { AssetType, TerraformAsset } from "cdktf";
import type { Construct } from "constructs";

export type LambdaOptions = Omit<
  LambdaFunctionConfig,
  "role" | "sourceCodeHash" | "handler"
> & {
  policy: DataAwsIamPolicyDocumentStatement[];
};

export const lambda = (
  stack: Construct,
  id: string,
  options: LambdaOptions,
) => {
  const role = new IamRole(stack, `${id}-role`, {
    name: `${options.functionName}-role`,
    assumeRolePolicy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: "sts:AssumeRole",
          Principal: { Service: "lambda.amazonaws.com" },
        },
      ],
    }),
  });

  const policy = new DataAwsIamPolicyDocument(stack, `${id}-policy-data`, {
    statement: [
      {
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ],
        resources: ["*"],
      },
      ...options.policy,
    ],
  });

  new IamRolePolicy(stack, `${id}-policy`, {
    role: role.name,
    policy: policy.json,
  });

  const asset = new TerraformAsset(stack, `${id}-asset`, {
    path: `${__dirname}/../dist`,
    type: AssetType.ARCHIVE,
  });

  new CloudwatchLogGroup(stack, `${id}-log-group`, {
    name: `/aws/lambda/${options.functionName}`,
    retentionInDays: 30,
  });

  const lambda = new LambdaFunction(stack, `${id}-function`, {
    ...options,
    filename: asset.path,
    sourceCodeHash: asset.assetHash,
    handler: `${options.filename}.handler`,
    role: role.arn,
  });

  return lambda;
};

export const lambdaSchedule = (
  stack: Construct,
  id: string,
  options: {
    name: string;
    functionName: string;
    schedule: string;
  },
) => {
  const lambda = new DataAwsLambdaFunction(stack, `${id}-lambda`, {
    functionName: options.functionName,
  });

  const rule = new CloudwatchEventRule(stack, `${id}-schedule`, {
    name: options.name,
    scheduleExpression: options.schedule,
  });

  new CloudwatchEventTarget(stack, `${id}-target`, {
    rule: rule.name,
    arn: lambda.arn,
  });

  new LambdaPermission(stack, `${id}-permission`, {
    action: "lambda:InvokeFunction",
    functionName: lambda.functionName,
    principal: "events.amazonaws.com",
    sourceArn: rule.arn,
  });
};
