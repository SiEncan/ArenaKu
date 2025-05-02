import prisma from "@/lib/prisma"; // atau sesuai path prisma kamu
import { subMinutes } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { userId, guestEmail } = req.body;

  if (!userId && !guestEmail) {
    return res.status(400).json({ success: false, message: "Missing userId or guestEmail" });
  }

  try {
    const fifteenMinutesAgo = subMinutes(new Date(), 15);

    // Cari booking PENDING terbaru (mau expired atau belum)
    const pendingBooking = await prisma.booking.findFirst({
      where: {
        AND: [
          userId ? { userId } : { guestEmail },
          { status: "PENDING" },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        field: {
          select: {
            name: true,
            venue: {
              select: {
                name: true,
              },
            },
          },
        },
        timeSlot: {
          select: {
            price: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    if (pendingBooking) {
      const bookingCreatedAt = new Date(pendingBooking.createdAt);

      if (bookingCreatedAt < fifteenMinutesAgo) {
        // Kalau expired, update jadi CANCELLED
        await prisma.booking.update({
          where: { id: pendingBooking.id },
          data: { status: "CANCELLED" },
        });

        return res.status(200).json({
          success: false,
          message: "Booking expired and cancelled.",
        });
      } else {
        // Masih aktif
        return res.status(200).json({
          success: true,
          booking: pendingBooking,
        });
      }
    } else {
      return res.status(200).json({
        success: false,
        message: "No pending booking found",
      });
    }
  } catch (error) {
    console.error("Check pending booking error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}