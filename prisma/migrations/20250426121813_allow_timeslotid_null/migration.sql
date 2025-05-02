-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_timeSlotId_fkey";

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "timeSlotId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "TimeSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
