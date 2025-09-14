-- CreateTable
CREATE TABLE "Payment" (
    "transactionId" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("transactionId")
);

-- CreateIndex
CREATE INDEX "Payment_linkId_idx" ON "Payment"("linkId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
