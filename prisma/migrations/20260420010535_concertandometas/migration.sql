/*
  Warnings:

  - You are about to drop the column `donoId` on the `Meta` table. All the data in the column will be lost.
  - Added the required column `donoSteamId` to the `Meta` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Meta" DROP CONSTRAINT "Meta_donoId_fkey";

-- AlterTable
ALTER TABLE "Meta" DROP COLUMN "donoId",
ADD COLUMN     "donoSteamId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Meta" ADD CONSTRAINT "Meta_donoSteamId_fkey" FOREIGN KEY ("donoSteamId") REFERENCES "User"("steamId") ON DELETE RESTRICT ON UPDATE CASCADE;
