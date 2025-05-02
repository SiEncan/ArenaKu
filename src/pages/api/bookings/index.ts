import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Metode tidak diizinkan" });
  }

  try {
    const {
      fieldId,
      timeSlotId,
      date,
      status,
      totalPrice,
      snapToken,
      orderId,
    } = req.body;

    // Validasi input dasar
    if (!fieldId || !timeSlotId || !date || !status) {
      return res.status(400).json({ success: false, message: "Input tidak lengkap: fieldId, timeSlotId, date, dan status diperlukan" });
    }

    // Validasi fieldId dan timeSlotId
    const field = await prisma.field.findUnique({
      where: { id: fieldId },
      include: {
        timeSlots: {
          where: { id: timeSlotId },
        },
      },
    });

    if (!field) {
      return res.status(404).json({ success: false, message: "Lapangan tidak ditemukan" });
    }

    if (!field.timeSlots || field.timeSlots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "timeSlotId tidak valid untuk lapangan ini",
      });
    }

    // Ambil harga dari timeSlot
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
      select: { price: true, startTime: true, endTime: true },
    });

    if (!timeSlot) {
      return res.status(404).json({ success: false, message: "Slot waktu tidak ditemukan" });
    }

    // Hitung ulang totalPrice di server
    const biayaTransaksi = 5000; // Harus sesuai dengan yang digunakan di frontend
    const calculatedTotalPrice = timeSlot.price + biayaTransaksi;

    if (totalPrice !== calculatedTotalPrice) {
      return res.status(400).json({
        success: false,
        message: "Harga tidak valid",
      });
    }

    // Buat booking
    const booking = await prisma.booking.create({
      data: {
        fieldId,
        timeSlotId,
        date: new Date(date),
        totalPrice: calculatedTotalPrice,
        status,
        snapToken,
        orderId,
      },
      include: {
        field: {
          include: {
            venue: true,
          },
        },
        timeSlot: true,
      },
    });

    return res.status(200).json({
      success: true,
      booking: {
        id: booking.id,
        venueName: booking.field.venue.name,
        fieldName: booking.field.name,
        fieldId: booking.fieldId,
        timeSlotId: booking.timeSlotId,
        date: booking.date,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        price: booking.totalPrice - biayaTransaksi, // Harga tanpa biaya transaksi
        status: booking.status,
        snapToken: booking.snapToken,
        orderId: booking.orderId,
      },
    });
  } catch (error: unknown) {
    console.error("Error creating booking:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal membuat booking",
      error: error instanceof Error ? error.message : "Kesalahan tidak diketahui",
    });
  }
}