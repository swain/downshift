import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoTable } from "@lifeomic/dynamost";
import z from "zod";

export const table = new DynamoTable(
  DynamoDBDocument.from(new DynamoDBClient()),
  z.object({ id: z.string(), description: z.string() }),
  {
    tableName: "messages",
    keys: { hash: "id", range: undefined },
    secondaryIndexes: {},
  },
);
