import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

async function getFieldById(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  try {
    const field = await prisma.field.findUnique({
      where: { id: String(id) },
      include: {
        timeSlots: true,
      },
    });

    if (!field) {
      return res.status(404).json({ error: 'Lapangan tidak ditemukan' });
    }

    return res.status(200).json(field);
  } catch (err) {
    console.error('Error fetching field:', err);
    return res.status(500).json({ error: 'Gagal mengambil lapangan' });
  }
}

async function updateFieldById(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  try {
    const data = req.body;

    // Ambil semua slot lama dari database
    const existingSlots = await prisma.timeSlot.findMany({
      where: { fieldId: String(id) },
    });

    const existingSlotMap = new Map(existingSlots.map(slot => [slot.id, slot]));

    const incomingSlots = data.timeSlots;

    const updatePromises = [];
    const createSlots = [];
    const incomingIds: string[] = [];

    for (const slot of incomingSlots) {
      if (slot.fieldId) {
        // slot lama, cek apakah perlu diupdate
        incomingIds.push(slot.id);
        const existingSlot = existingSlotMap.get(slot.id);
        if (
          existingSlot &&
          (
            existingSlot.day !== slot.day ||
            existingSlot.startTime !== slot.startTime ||
            existingSlot.endTime !== slot.endTime ||
            existingSlot.price !== slot.price
          )
        ) {
          // Kalau ada perubahan, update
          updatePromises.push(
            prisma.timeSlot.update({
              where: { id: slot.id },
              data: {
                day: slot.day,
                startTime: slot.startTime,
                endTime: slot.endTime,
                price: slot.price,
              },
            })
          );
        }
      } else {
        // slot baru
        createSlots.push({
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
          price: slot.price,
          fieldId: id,
        });
      }
    }

    // Slot yang dihapus = slot yang ada di database tapi tidak dikirim ulang
    const deleteSlotIds = existingSlots
      .map(slot => slot.id)
      .filter(existingId => !incomingIds.includes(existingId));

    // Update nama field
    const updateFieldPromise = prisma.field.update({
      where: { id: String(id) },
      data: {
        name: data.name,
      },
    });

    // Jalankan semua update, create, delete secara paralel
    await Promise.all([
      ...updatePromises,
      prisma.timeSlot.createMany({ data: createSlots, skipDuplicates: true }),
      prisma.timeSlot.deleteMany({
        where: { id: { in: deleteSlotIds } },
      }),
      updateFieldPromise,
    ]);

    const updatedField = await prisma.field.findUnique({
      where: { id: String(id) },
      include: { timeSlots: true },
    });

    return res.status(200).json(updatedField);
  } catch (err) {
    console.error('Error updating field:', err);
    return res.status(500).json({ error: 'Gagal memperbarui lapangan' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return getFieldById(req, res);
  if (req.method === 'PUT') return updateFieldById(req, res);
  return res.status(405).json({ error: "Method not allowed" });
}