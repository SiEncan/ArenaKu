import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Metode tidak diizinkan" });
  }

  const {
    bookingId,
    status,
    snapToken,
    orderId,
    userId,
    guestName,
    guestEmail,
    guestPhone,
  } = req.body;

  if (!bookingId) {
    return res.status(400).json({
      success: false,
      message: "bookingId diperlukan",
    });
  }

  if (!userId && (!guestName || !guestEmail || !guestPhone)) {
    return res
      .status(400)
      .json({ success: false, message: "Data user atau guest harus ada" });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking tidak ditemukan" });
    }

    // Validasi status jika disediakan
    if (
      status &&
      status !== "PENDING" &&
      status !== "PAID" &&
      status !== "CANCELLED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Status tidak valid",
      });
    }

    if (status === "PENDING" && booking.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        message: "Booking ini sudah tidak dapat diperbarui ke status PENDING",
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        userId: userId || null,
        guestName: userId ? null : guestName,
        guestEmail: userId ? null : guestEmail,
        guestPhone: userId ? null : guestPhone,
        status: status,
        snapToken: snapToken,
        orderId: orderId,
      },
    });

    return res.status(200).json({
      success: true,
      data: updatedBooking,
    });
  } catch (error: any) {
    console.error("Gagal memperbarui booking:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui booking",
      error: error.message || "Kesalahan tidak diketahui",
    });
  }
}
