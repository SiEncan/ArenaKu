import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { email, code } = req.body;

  // Validasi input
  if (!email || !code) {
    return res.status(400).json({ success: false, message: "Email dan kode verifikasi diperlukan" });
  }

  try {
    // Bersihkan kode yang sudah kadaluarsa sebelum memproses
    await prisma.verificationCode.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(), // Hapus semua kode yang sudah kadaluarsa
        },
      },
    });

    // Cari kode verifikasi terbaru untuk email ini
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        email,
        code,
        isUsed: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!verificationCode) {
      return res.status(400).json({ success: false, message: "Kode verifikasi tidak valid atau sudah digunakan" });
    }

    // Periksa apakah kode sudah kadaluarsa
    const now = new Date();
    if (now > verificationCode.expiresAt) {
      // Hapus kode yang kadaluarsa
      await prisma.verificationCode.delete({
        where: { id: verificationCode.id },
      });
      return res.status(400).json({ success: false, message: "Kode verifikasi telah kadaluarsa. Silakan minta kode baru." });
    }

    // Hapus kode setelah digunakan
    await prisma.verificationCode.delete({
      where: { id: verificationCode.id },
    });

    res.status(200).json({ success: true, message: "Verifikasi berhasil" });
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat memverifikasi kode" });
  }
}