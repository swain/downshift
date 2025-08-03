import {
  DataAwsIamPolicyDocument,
  type DataAwsIamPolicyDocumentStatement,
} from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";
import { IamOpenidConnectProvider } from "@cdktf/provider-aws/lib/iam-openid-connect-provider"; // For OIDC
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamRolePolicy } from "@cdktf/provider-aws/lib/iam-role-policy";
import { dataTlsCertificate } from "@cdktf/provider-tls";
import type { Construct } from "constructs";

export const vercelAuth = (
  scope: Construct,
  policy: DataAwsIamPolicyDocumentStatement[],
) => {
  const teamSlug = "swain-projects";
  const issuer = `https://oidc.vercel.com/${teamSlug}`;
  const audience = `https://vercel.com/${teamSlug}`;

  const cert = new dataTlsCertificate.DataTlsCertificate(scope, "vercel-cert", {
    url: issuer,
  });

  const oidc = new IamOpenidConnectProvider(scope, "vercel", {
    url: issuer,
    clientIdList: [audience],
    thumbprintList: [cert.certificates.get(0).sha1Fingerprint],
  });

  const role = new IamRole(scope, "vercel-role", {
    name: "vercel-deploy-role",
    assumeRolePolicy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { Federated: oidc.arn },
          Action: "sts:AssumeRoleWithWebIdentity",
          Condition: {
            StringEquals: {
              [`oidc.vercel.com/${teamSlug}:aud`]: audience,
            },
            StringLike: {
              [`oidc.vercel.com/${teamSlug}:sub`]: `owner:${teamSlug}:project:downshift:environment:production`,
            },
          },
        },
      ],
    }),
    // For demo purposes give it S3 read-only. Replace as needed.
    inlinePolicy: [
      {
        name: "s3Read",
        policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: ["s3:GetObject", "s3:ListBucket"],
              Resource: ["arn:aws:s3:::my-bucket", "arn:aws:s3:::my-bucket/*"],
            },
          ],
        }),
      },
    ],
  });

  const policyDocument = new DataAwsIamPolicyDocument(scope, "vercel-policy", {
    statement: policy,
  });

  new IamRolePolicy(scope, "vercel-role-policy", {
    role: role.name,
    policy: policyDocument.json,
  });
};
