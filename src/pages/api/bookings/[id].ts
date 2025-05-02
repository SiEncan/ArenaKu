import prisma from "../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    if (!id) {
      return res.status(400).json({ error: "id diperlukan" });
    }

    try {
      if ((id as string).includes("order")) {
        const booking = await prisma.booking.findFirst({
          where: { orderId: id as string },
          include: {
            field: {
              include: {
                venue: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            timeSlot: true,
          },
        });
        if (!booking) {
          return res.status(404).json({ error: "Booking tidak ditemukan." });
        }

        return res.status(200).json({ success: true, data: booking });
      } else {
        const booking = await prisma.booking.findFirst({
          where: { id: id as string },
          include: {
            field: {
              include: {
                venue: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            timeSlot: true,
          },
        });
        if (!booking) {
          return res.status(404).json({ error: "Booking tidak ditemukan." });
        }

        return res.status(200).json({ success: true, data: booking });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error." });
    }
  } else if (req.method === "DELETE") {
    try {
      await prisma.booking.deleteMany({
        where: {
          id: id as string,
        },
      });
      res
        .status(200)
        .json({ success: true, message: "Booking deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to delete booking", error });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
