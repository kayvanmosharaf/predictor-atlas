import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  /**
   * A prediction market / scenario that users can forecast on.
   * Examples: "2026 US Midterm Elections", "Global Recession by 2027", "NBA Finals 2026 Winner"
   */
  Prediction: a
    .model({
      title: a.string().required(),
      description: a.string().required(),
      category: a.enum(["POLITICS", "ECONOMICS", "SPORTS", "GEOPOLITICS", "TECHNOLOGY", "OTHER"]),
      status: a.enum(["OPEN", "CLOSED", "RESOLVED"]),
      visibility: a.enum(["PRIVATE", "PUBLIC"]),
      resolutionDate: a.string(),
      resolvedOutcome: a.string(),
      imageUrl: a.string(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.publicApiKey().to(["read"]),
      allow.groups(["admin"]),
    ]),

  /**
   * A possible outcome for a prediction (e.g., "Democrats win", "Republicans win").
   * Each prediction can have multiple outcomes.
   */
  Outcome: a
    .model({
      predictionId: a.string().required(),
      label: a.string().required(),
      description: a.string(),
      nashEquilibriumScore: a.float(),
      probability: a.float(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.publicApiKey().to(["read"]),
      allow.groups(["admin"]),
    ]),

  /**
   * A user's forecast/vote on a specific outcome.
   */
  Forecast: a
    .model({
      predictionId: a.string().required(),
      outcomeId: a.string().required(),
      confidence: a.float().required(),
      reasoning: a.string(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.groups(["admin"]),
    ]),

  /**
   * Game theory analysis for a prediction — stores the strategic model parameters.
   */
  GameTheoryModel: a
    .model({
      predictionId: a.string().required(),
      players: a.string().required(),
      payoffMatrix: a.string().required(),
      nashEquilibria: a.string().required(),
      dominantStrategies: a.string(),
      analysis: a.string().required(),
    })
    .authorization((allow) => [
      allow.publicApiKey(),
      allow.groups(["admin"]),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
