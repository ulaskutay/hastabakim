-- CreateTable
CREATE TABLE IF NOT EXISTS "hizmetler" (
    "id" TEXT NOT NULL,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "ikon" TEXT NOT NULL DEFAULT 'FiUser',
    "sira" INTEGER NOT NULL DEFAULT 0,
    "durum" TEXT NOT NULL DEFAULT 'aktif',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hizmetler_pkey" PRIMARY KEY ("id")
);

