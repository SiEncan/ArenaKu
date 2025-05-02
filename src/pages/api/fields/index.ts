import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";  // Pastikan Anda sudah mengonfigurasi Prisma di proyek Anda

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const { name, description, type, surface, imageUrls, venueId, timeSlots } = req.body;

      // Validasi data yang diterima
      if (!name || !type || !venueId) {
        return res.status(400).json({ error: "Nama, jenis lapangan, dan venueId wajib diisi" });
      }

      // Menambahkan lapangan baru ke database
      const newField = await prisma.field.create({
        data: {
          name,
          description,
          type,
          surface,
          imageUrls,
          venueId,
          timeSlots: {
            create: timeSlots.map((slot: { startTime: string, endTime: string, price: number }) => ({
              startTime: slot.startTime,
              endTime: slot.endTime,
              price: slot.price,
            })),
          },
        },
      });      

      return res.status(200).json(newField);  // Mengembalikan lapangan yang baru ditambahkan
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Gagal menambahkan lapangan" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
};

export default handler;