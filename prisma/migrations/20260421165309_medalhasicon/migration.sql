/*
  Warnings:

  - Added the required column `icon` to the `Medalha` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Medalha" ADD COLUMN     "icon" TEXT NOT NULL;
