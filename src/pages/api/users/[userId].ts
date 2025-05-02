import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Metode tidak diizinkan" });
  }

  const { userId } = req.query;
  const isBookingTrue = req.query.isBookingTrue === "True";


  // Validasi userId
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ success: false, message: "userId diperlukan dan harus berupa string" });
  }

  try {
    // Ambil data user dari database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        bookings: isBookingTrue,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    console.error("Gagal mengambil data user:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data user",
      error: error.message || "Kesalahan tidak diketahui",
    });
  }
}