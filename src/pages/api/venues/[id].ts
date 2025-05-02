// pages/api/venues/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma"; // pastikan prisma sudah di-set up

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      // Mengambil venue berdasarkan ID
      const venue = await prisma.venue.findUnique({
        where: { id: String(id) },
        include: {
          fields: true
        },
      });

      if (!venue) {
        return res.status(404).json({ error: "Venue tidak ditemukan" });
      }

      return res.status(200).json(venue);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Gagal mengambil data venue" });
    }
  } else {
    return res.status(405).json({ error: "Metode tidak diizinkan" });
  }
}