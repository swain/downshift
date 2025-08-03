import { DynamodbTable } from "@cdktf/provider-aws/lib/dynamodb-table";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { TlsProvider } from "@cdktf/provider-tls/lib/provider";
import { App, S3Backend, TerraformStack } from "cdktf";
import type { Construct } from "constructs";
import { vercelAuth } from "./vercel-auth";

export class InfraStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, "aws", {
      region: "us-east-1",
      profile: "downshift-admin",
      defaultTags: [{ tags: { Project: "downshift" } }],
    });

    new TlsProvider(this, "tls");

    new S3Backend(this, {
      profile: "downshift-admin",
      bucket: "downshift-tf-state",
      region: "us-east-1",
      key: "downshift",
    }).addOverride("use_lockfile", true);

    const table = new DynamodbTable(this, "tracked", {
      name: "messages",
      billingMode: "PAY_PER_REQUEST",
      hashKey: "id",
      attribute: [{ name: "id", type: "S" }],
      streamEnabled: true,
      streamViewType: "NEW_AND_OLD_IMAGES",
      ttl: { enabled: true, attributeName: "ttl" },
    });

    vercelAuth(this, [
      {
        actions: ["dynamodb:PutItem"],
        resources: [table.arn],
      },
    ]);
  }
}

const app = new App();
new InfraStack(app, "downshift");
app.synth();
