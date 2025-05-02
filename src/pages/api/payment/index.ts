import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const {
    userId, // Untuk user yang login
    name, // Untuk guest
    email, // Untuk guest
    phone, // Untuk guest
    fieldId,
    timeSlotId,
    date,
    price,
    venueName,
    fieldName,
  } = req.body;

  // Validate required fields
  if (!fieldId || !price || !venueName || !fieldName || !date) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  // Validasi: Pastikan salah satu dari userId atau data tamu ada
  const isGuest = !userId;
  if (isGuest && (!name || !email || !phone)) {
    return res.status(400).json({
      success: false,
      message: "Data tamu (name, email, phone) wajib diisi",
    });
  }

  try {
    ////////         CEK VALIDITY    //////////////////////////////
    const field = await prisma.field.findUnique({
      where: { id: fieldId },
      include: {
        timeSlots: true,
      },
    });

    if (!field) {
      return res
        .status(404)
        .json({ success: false, message: "Lapangan tidak ditemukan" });
    }

    const timeSlot = field.timeSlots.find((ts) => ts.id === timeSlotId);

    if (!timeSlot) {
      return res
        .status(404)
        .json({ success: false, message: "Time slot tidak ditemukan" });
    }

    if (price !== timeSlot.price + 5000) {
      // 5000 adalah biaya transaksi
      return res.status(400).json({
        success: false,
        message: "Harga tidak valid",
      });
    }

    ///////////////////////////////////////////////////////////////////////

    // Ambil data user dari database jika user login
    let userData: { name: string; email: string; phone?: string } | null = null;
    if (userId) {
      try {
        userData = (await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true, phone: true },
        })) as { name: string; email: string; phone?: string } | null;

        if (!userData) {
          return res
            .status(404)
            .json({ success: false, message: "User tidak ditemukan" });
        }

        if (!userData.email) {
          return res
            .status(400)
            .json({ success: false, message: "Email user tidak ditemukan" });
        }
      } catch (error: any) {
        console.error("Gagal mengambil data user:", error);
        return res.status(500).json({
          success: false,
          message: "Gagal mengambil data user",
          error: error.message,
        });
      }
    }

    // Tentukan data untuk Midtrans berdasarkan user atau guest
    const finalName = userId ? userData!.name : name!;
    const finalEmail = userId ? userData!.email : email!;
    const finalPhone = userId ? userData!.phone : phone;

    // Generate a unique order ID
    const orderId = `order-${uuidv4()}`;

    // Prepare transaction data for Midtrans
    const transactionData = {
      transaction_details: {
        order_id: orderId,
        gross_amount: price,
      },
      item_details: [
        {
          id: fieldId,
          price: timeSlot.price,
          quantity: 1,
          name: `${venueName} - ${fieldName}`,
          category: "Booking",
          merchant_name: "ArenaKu",
        },
        {
          id: "transaction_fee",
          price: 5000,
          quantity: 1,
          name: "Biaya Transaksi",
          category: "Transaction Fee",
          merchant_name: "ArenaKu",
        },
      ],
      customer_details: {
        first_name: finalName,
        email: finalEmail,
        phone: finalPhone,
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/status/${orderId}`,
      },
    };

    // Kirim data transaksi ke Midtrans Snap API using the custom axios instance
    const response = await axios.post(
      "https://app.sandbox.midtrans.com/snap/v1/transactions",
      transactionData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString(
              "base64"
            ),
        },
      }
    );

    const snapToken = response.data.token;

    return res.status(200).json({
      success: true,
      snapToken,
      orderId,
    });
  } catch (error: any) {
    console.error("Payment error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment transaction",
      error: error.message || "Unknown error",
    });
  }
}
