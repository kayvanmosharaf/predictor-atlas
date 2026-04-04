import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource.js";
import { data } from "./data/resource.js";
import { predictionAnalyzer } from "./functions/prediction-analyzer/resource.js";

const backend = defineBackend({
  auth,
  data,
  predictionAnalyzer,
});

const { cfnUserPoolClient } = backend.auth.resources.cfnResources;
cfnUserPoolClient.explicitAuthFlows = [
  ...((cfnUserPoolClient.explicitAuthFlows as string[]) || []),
  "ALLOW_USER_PASSWORD_AUTH",
];

// Pass AppSync API endpoint and key to the Lambda
const { cfnGraphqlApi, cfnApiKey } = backend.data.resources.cfnResources;
backend.predictionAnalyzer.addEnvironment(
  "API_ENDPOINT",
  cfnGraphqlApi.attrGraphQlUrl
);
if (cfnApiKey) {
  backend.predictionAnalyzer.addEnvironment(
    "API_KEY",
    cfnApiKey.attrApiKey
  );
}
