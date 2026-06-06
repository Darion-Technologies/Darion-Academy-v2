ALTER TYPE "CertificateStatus" ADD VALUE IF NOT EXISTS 'ISSUING';
ALTER TYPE "CertificateStatus" ADD VALUE IF NOT EXISTS 'FAILED';

CREATE TYPE "CertificateTemplateStatus" AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TABLE "CertificateTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CertificateTemplateStatus" NOT NULL DEFAULT 'ACTIVE',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "primaryColor" TEXT NOT NULL DEFAULT '#143c72',
    "accentColor" TEXT NOT NULL DEFAULT '#1764c0',
    "backgroundColor" TEXT NOT NULL DEFAULT '#f7f9fc',
    "textColor" TEXT NOT NULL DEFAULT '#10213b',
    "fontFamily" TEXT NOT NULL DEFAULT 'Arial',
    "headingFontFamily" TEXT NOT NULL DEFAULT 'Georgia',
    "borderStyle" TEXT NOT NULL DEFAULT 'DOUBLE',
    "borderWidth" INTEGER NOT NULL DEFAULT 2,
    "textAlign" TEXT NOT NULL DEFAULT 'CENTER',
    "title" TEXT NOT NULL DEFAULT 'Certificate of Completion',
    "presentationText" TEXT NOT NULL DEFAULT 'This certificate is proudly presented to',
    "completionText" TEXT NOT NULL DEFAULT 'for successfully completing',
    "showScore" BOOLEAN NOT NULL DEFAULT true,
    "showCompletionDate" BOOLEAN NOT NULL DEFAULT true,
    "showCertificateId" BOOLEAN NOT NULL DEFAULT true,
    "showQrCode" BOOLEAN NOT NULL DEFAULT true,
    "signerName" TEXT,
    "signerTitle" TEXT,
    "logoUrl" TEXT,
    "signatureUrl" TEXT,
    "backgroundUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CertificateTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CertificateTemplate_name_key" ON "CertificateTemplate"("name");

ALTER TABLE "Course" ADD COLUMN "certificateTemplateId" TEXT;

DROP INDEX IF EXISTS "Certificate_enrollmentId_key";

ALTER TABLE "Certificate"
    ADD COLUMN "templateId" TEXT,
    ADD COLUMN "issuerId" UUID,
    ADD COLUMN "revokedById" UUID,
    ADD COLUMN "replacesId" TEXT,
    ADD COLUMN "templateSnapshot" JSONB,
    ADD COLUMN "failureReason" TEXT,
    ADD COLUMN "revokedReason" TEXT,
    ADD COLUMN "revokedAt" TIMESTAMP(3),
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "Certificate_enrollmentId_idx" ON "Certificate"("enrollmentId");
CREATE INDEX "Certificate_status_idx" ON "Certificate"("status");

ALTER TABLE "Course" ADD CONSTRAINT "Course_certificateTemplateId_fkey"
    FOREIGN KEY ("certificateTemplateId") REFERENCES "CertificateTemplate"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_templateId_fkey"
    FOREIGN KEY ("templateId") REFERENCES "CertificateTemplate"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_issuerId_fkey"
    FOREIGN KEY ("issuerId") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_revokedById_fkey"
    FOREIGN KEY ("revokedById") REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_replacesId_fkey"
    FOREIGN KEY ("replacesId") REFERENCES "Certificate"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
