-- CreateEnum
CREATE TYPE "Category" AS ENUM ('POLITICS', 'ECONOMICS', 'SPORTS', 'GEOPOLITICS', 'TECHNOLOGY', 'OTHER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('OPEN', 'CLOSED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "Category" NOT NULL DEFAULT 'OTHER',
    "status" "Status" NOT NULL DEFAULT 'OPEN',
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "resolutionDate" TEXT,
    "resolvedOutcome" TEXT,
    "imageUrl" TEXT,
    "owner" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outcome" (
    "id" TEXT NOT NULL,
    "predictionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "nashEquilibriumScore" DOUBLE PRECISION,
    "probability" DOUBLE PRECISION,
    "owner" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Outcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Forecast" (
    "id" TEXT NOT NULL,
    "predictionId" TEXT NOT NULL,
    "outcomeId" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "reasoning" TEXT,
    "owner" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Forecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameTheoryModel" (
    "id" TEXT NOT NULL,
    "predictionId" TEXT NOT NULL,
    "players" TEXT NOT NULL,
    "payoffMatrix" TEXT NOT NULL,
    "nashEquilibria" TEXT NOT NULL,
    "dominantStrategies" TEXT,
    "analysis" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameTheoryModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prediction_owner_idx" ON "Prediction"("owner");

-- CreateIndex
CREATE INDEX "Prediction_visibility_status_idx" ON "Prediction"("visibility", "status");

-- CreateIndex
CREATE INDEX "Outcome_predictionId_idx" ON "Outcome"("predictionId");

-- CreateIndex
CREATE INDEX "Forecast_predictionId_idx" ON "Forecast"("predictionId");

-- CreateIndex
CREATE INDEX "Forecast_owner_idx" ON "Forecast"("owner");

-- CreateIndex
CREATE UNIQUE INDEX "Forecast_owner_outcomeId_key" ON "Forecast"("owner", "outcomeId");

-- CreateIndex
CREATE UNIQUE INDEX "GameTheoryModel_predictionId_key" ON "GameTheoryModel"("predictionId");

-- AddForeignKey
ALTER TABLE "Outcome" ADD CONSTRAINT "Outcome_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "Prediction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Forecast" ADD CONSTRAINT "Forecast_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "Prediction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Forecast" ADD CONSTRAINT "Forecast_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameTheoryModel" ADD CONSTRAINT "GameTheoryModel_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "Prediction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
