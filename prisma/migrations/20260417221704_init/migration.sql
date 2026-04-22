-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "steamId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meta" (
    "id" TEXT NOT NULL,
    "jogo" TEXT NOT NULL,
    "objetivo" TEXT NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "donoId" TEXT NOT NULL,

    CONSTRAINT "Meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DadosProgresso" (
    "id" TEXT NOT NULL,
    "horaInicial" INTEGER NOT NULL,
    "horaFinal" INTEGER NOT NULL,
    "horaAtual" INTEGER NOT NULL,
    "trofeuInicial" INTEGER NOT NULL,
    "trofeuFinal" INTEGER NOT NULL,
    "trofeuAtual" INTEGER NOT NULL,
    "metaId" TEXT NOT NULL,

    CONSTRAINT "DadosProgresso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medalha" (
    "id" TEXT NOT NULL,
    "objetivo" TEXT NOT NULL,
    "conquistada" BOOLEAN NOT NULL DEFAULT false,
    "donoId" TEXT NOT NULL,

    CONSTRAINT "Medalha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_steamId_key" ON "User"("steamId");

-- AddForeignKey
ALTER TABLE "Meta" ADD CONSTRAINT "Meta_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DadosProgresso" ADD CONSTRAINT "DadosProgresso_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "Meta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medalha" ADD CONSTRAINT "Medalha_donoId_fkey" FOREIGN KEY ("donoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
