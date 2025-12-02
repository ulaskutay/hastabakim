-- CreateTable
CREATE TABLE "kategoriler" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "renk" TEXT NOT NULL DEFAULT '#3B82F6',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kategoriler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hastalar" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "email" TEXT,
    "yas" INTEGER NOT NULL,
    "adres" TEXT,
    "kategoriId" TEXT NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'aktif',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hastalar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personel" (
    "id" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "email" TEXT,
    "pozisyon" TEXT NOT NULL,
    "sertifika" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'aktif',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "personel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "randevular" (
    "id" TEXT NOT NULL,
    "hastaId" TEXT NOT NULL,
    "personelId" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL,
    "saat" TEXT NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'planlandi',
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "randevular_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "hastalar" ADD CONSTRAINT "hastalar_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "kategoriler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "randevular" ADD CONSTRAINT "randevular_hastaId_fkey" FOREIGN KEY ("hastaId") REFERENCES "hastalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "randevular" ADD CONSTRAINT "randevular_personelId_fkey" FOREIGN KEY ("personelId") REFERENCES "personel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
