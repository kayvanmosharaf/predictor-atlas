import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource.js";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as cdk from "aws-cdk-lib";

const backend = defineBackend({
  auth,
});

const { cfnUserPoolClient } = backend.auth.resources.cfnResources;
cfnUserPoolClient.explicitAuthFlows = [
  ...((cfnUserPoolClient.explicitAuthFlows as string[]) || []),
  "ALLOW_USER_PASSWORD_AUTH",
];

// Aurora Serverless v2 (PostgreSQL)
const auroraStack = backend.createStack("AuroraStack");

const vpc = new ec2.Vpc(auroraStack, "AuroraVpc", {
  maxAzs: 2,
  natGateways: 0,
});

const dbSecurityGroup = new ec2.SecurityGroup(auroraStack, "AuroraSecurityGroup", {
  vpc,
  description: "Allow PostgreSQL access to Aurora cluster",
  allowAllOutbound: true,
});

dbSecurityGroup.addIngressRule(
  ec2.Peer.anyIpv4(),
  ec2.Port.tcp(5432),
  "Allow PostgreSQL from anywhere (credentials required)"
);

const dbCluster = new rds.DatabaseCluster(auroraStack, "AuroraCluster", {
  engine: rds.DatabaseClusterEngine.auroraPostgres({
    version: rds.AuroraPostgresEngineVersion.VER_15_8,
  }),
  serverlessV2MinCapacity: 0.5,
  serverlessV2MaxCapacity: 4,
  writer: rds.ClusterInstance.serverlessV2("writer", {
    publiclyAccessible: true,
  }),
  vpc,
  vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
  securityGroups: [dbSecurityGroup],
  defaultDatabaseName: "predictoratlas",
  enableDataApi: true,
  removalPolicy: cdk.RemovalPolicy.RETAIN,
});

// Output connection info as stack outputs
new cdk.CfnOutput(auroraStack, "AuroraClusterArn", {
  value: dbCluster.clusterArn,
  description: "Aurora cluster ARN for RDS Data API",
});

new cdk.CfnOutput(auroraStack, "AuroraSecretArn", {
  value: dbCluster.secret?.secretArn ?? "",
  description: "Aurora secret ARN for credentials",
});

new cdk.CfnOutput(auroraStack, "AuroraEndpoint", {
  value: dbCluster.clusterEndpoint.hostname,
  description: "Aurora cluster endpoint",
});
