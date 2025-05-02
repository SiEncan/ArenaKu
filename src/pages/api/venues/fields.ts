// /pages/api/venues/fields.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { venueId } = req.query;

  if (!venueId) {
    return res.status(400).json({ error: 'venueId is required' });
  }

  try {
    // Ambil venue berdasarkan ID dan include lapangan-lapangan yang terkait
    const venue = await prisma.venue.findUnique({
      where: {
        id: venueId as string, // pastikan venueId sesuai dengan parameter yang dikirimkan
      },
      include: {
        fields: true, // Mengambil semua lapangan yang terhubung dengan venue
      },
    });

    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    return res.status(200).json(venue.fields); // Mengembalikan daftar lapangan
  } catch (error) {
    console.error('Error fetching fields:', error);
    return res.status(500).json({ error: 'Error fetching fields' });
  }
}
