import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }

  const { orderId } = req.body;
  

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: "orderId are required",
    });
  }

  const booking = await prisma.booking.findFirst({
    where: { orderId },
  });

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  try {
    // 1. Cek status transaksi dari Midtrans
    const midtransRes = await axios.get(
      `https://api.sandbox.midtrans.com/v2/${orderId}/status`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.MIDTRANS_SERVER_KEY + ":"
          ).toString("base64")}`,
        },
      }
    );

    const status = midtransRes.data.transaction_status;

    if (status === "capture" || status === "settlement") {
      // 2. Kalau sukses, update booking jadi PAID
      await prisma.booking.update({
        where: { id: booking.id },
        data: { orderId, status: "PAID" },
      });
    } else if (status === "pending") {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          orderId,
          status: "PENDING",
        },
      });
    } 

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error validating payment:", error);
    return res.status(500).json({ success: false });
  }
}
