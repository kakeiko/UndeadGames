/*
  Warnings:

  - You are about to drop the column `donoId` on the `Medalha` table. All the data in the column will be lost.
  - Added the required column `donoSteamId` to the `Medalha` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Medalha" DROP CONSTRAINT "Medalha_donoId_fkey";

-- AlterTable
ALTER TABLE "Medalha" DROP COLUMN "donoId",
ADD COLUMN     "donoSteamId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Medalha" ADD CONSTRAINT "Medalha_donoSteamId_fkey" FOREIGN KEY ("donoSteamId") REFERENCES "User"("steamId") ON DELETE RESTRICT ON UPDATE CASCADE;
