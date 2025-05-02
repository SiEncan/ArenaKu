import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "../../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "OWNER") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const venues = await prisma.venue.findMany({
      where: {
        ownerId: session.user.id,
      },
      include: {
        fields: {
          include: {
            timeSlots: true
          },
        },
      },
    });

    res.status(200).json({ venues });
  } catch (error) {
    console.error("Error fetching venues:", error);
    res.status(500).json({ error: "Server error" });
  }
}