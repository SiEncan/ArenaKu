import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { DayOfWeek } from "@prisma/client";

const getDayName = (dateStr: string): DayOfWeek => {
  const days: DayOfWeek[] = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  return days[new Date(dateStr).getDay()];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { date, fieldId } = req.query;

  if (!date || !fieldId) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const dayName = getDayName(date as string);

    const [timeSlots, activeBookings] = await Promise.all([
      prisma.timeSlot.findMany({
        where: {
          day: dayName,
          fieldId: fieldId as string,
        },
        orderBy: {
          startTime: "asc",
        },
      }),
      prisma.booking.findMany({
        where: {
          date: new Date(date as string),
          fieldId: fieldId as string,
          status: {
            in: ["PAID", "PENDING"],
          },
        },
        select: {
          timeSlotId: true,
        },
      }),
    ]);
    
    const bookedTimeSlotIds = activeBookings
      .map((b) => b.timeSlotId)
      .filter((id): id is string => id !== null);
    
    const availability = timeSlots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: slot.price,
      status: bookedTimeSlotIds.includes(slot.id) ? "BOOKED" : "AVAILABLE",
    }));
    

    return res.status(200).json({ slots: availability });
  } catch (error) {
    console.error("Error checking availability:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}