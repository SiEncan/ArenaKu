import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { Venue } from "@/types/venue";

async function getAllVenue(req: NextApiRequest, res: NextApiResponse) {
  try {
    const venues = await prisma.venue.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        description: true,
        imageUrls: true,
        fields: {
          select: {
            type: true,
            timeSlots: {
              select: {
                price: true,
              },
              orderBy: {
                price: "asc",
              },
            },
          },
        },
      },
    });

    const formatted = venues.map((venue: Venue) => {
      const fieldMap: { [type: string]: number[] } = {};

      venue.fields.forEach((field) => {
        if (field.timeSlots.length > 0) {
          if (!fieldMap[field.type]) {
            fieldMap[field.type] = [];
          }
          fieldMap[field.type].push(...field.timeSlots.map((slot) => slot.price));
        }
      });

      const fieldTypes = Object.entries(fieldMap).map(([type, prices]) => ({
        type,
        minPrice: Math.min(...prices),
      }));

      return {
        id: venue.id,
        name: venue.name,
        address: venue.address,
        description: venue.description,
        imageUrls: venue.imageUrls,
        fieldTypes,
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Gagal mengambil data venue" });
  }
}

async function createVenue(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, address, description, imageUrls, ownerId } = req.body;

    // Validasi input
    if (!name || !address || !ownerId || !imageUrls.length) {
      return res.status(400).json({ error: "Semua field wajib diisi!" });
    }

    // Menyimpan venue baru
    const newVenue = await prisma.venue.create({
      data: {
        name,
        address,
        description,
        imageUrls,
        ownerId, // memastikan ownerId sesuai dengan ID pengguna yang sedang login
      },
    });

    // Mengirimkan response sukses
    return res.status(201).json(newVenue);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Gagal menambahkan venue" });
  }
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return getAllVenue(req, res);
  if (req.method === 'POST') return createVenue(req, res);
  return res.status(405).json({ error: "Method not allowed" });
}