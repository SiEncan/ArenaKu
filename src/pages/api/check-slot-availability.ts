import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Metode tidak diizinkan" });
  }

  const { fieldId, timeSlotId, date } = req.body;

  // Validasi input
  if (!fieldId || !timeSlotId || !date) {
    return res.status(400).json({
      success: false,
      message: "fieldId, timeSlotId, dan date diperlukan",
    });
  }

  try {
    // Ubah date menjadi format yang sesuai untuk query
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    // Cek apakah ada booking dengan status PAID untuk field, timeSlot, dan tanggal yang sama
    const existingBooking = await prisma.booking.findFirst({
      where: {
        fieldId: fieldId,
        timeSlotId: timeSlotId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ["PENDING", "PAID"],
        },
      },
    });

    if (existingBooking) {
      return res.status(200).json({
        success: true,
        available: false,
        message: "Slot sudah dipesan oleh orang lain",
      });
    }

    return res.status(200).json({
      success: true,
      available: true,
      message: "Slot masih tersedia",
    });
  } catch (error: any) {
    console.error("Gagal memeriksa ketersediaan slot:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal memeriksa ketersediaan slot",
      error: error.message || "Kesalahan tidak diketahui",
    });
  }
}