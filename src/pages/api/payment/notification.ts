import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import "log-timestamp";
import crypto from "crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const body = req.body;

  try {
    const { order_id, transaction_status, settlement_time, status_code, gross_amount, signature_key } = body;

    console.log("[Midtrans Notification]", body);

    // Verifikasi signature key dari Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error("MIDTRANS_SERVER_KEY is not set in environment variables");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Hitung signature key: SHA512(order_id + status_code + gross_amount + server_key)
    const stringToHash = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const calculatedSignature = crypto
      .createHash("sha512")
      .update(stringToHash)
      .digest("hex");

    // Bandingkan signature key yang dihitung dengan signature_key dari Midtrans
    if (calculatedSignature !== signature_key) {
      console.error("Invalid signature key: ", { calculatedSignature, receivedSignature: signature_key });
      return res.status(403).json({ message: "Invalid signature key" });
    }

    // Cari booking berdasarkan order_id, termasuk relasi field, timeSlot, dan user
    const booking = await prisma.booking.findFirst({
      where: { orderId: order_id },
      include: {
        field: {
          include: {
            venue: true, // Sertakan venue di dalam field
          },
        },
        timeSlot: true, // Sertakan timeSlot
        user: true, // Sertakan user untuk mendapatkan email pengguna jika ada
      },
    });

    if (!booking) {
      return res.status(200).json({ message: "Notification received, booking not found (possibly deleted)" });
    }

    if (
      transaction_status === "settlement" ||
      transaction_status === "capture"
    ) {
      // Update booking menjadi PAID
      const updatedBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: "PAID",
          paidAt: settlement_time ? new Date(settlement_time) : new Date(),
        },
        include: {
          field: {
            include: {
              venue: true,
            },
          },
          timeSlot: true,
          user: true, // Sertakan user di data yang diperbarui
        },
      });

      // Kirim email bukti booking
      try {
        const emailResponse = await fetch("http://localhost:3000/api/send-success-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ booking: updatedBooking }),
        });
        

        const emailResult = await emailResponse.json();
        if (!emailResult.success) {
          console.error("Failed to send booking receipt email:", emailResult.message);
        } else {
          console.log("Booking receipt email sent successfully");
        }
      } catch (emailError) {
        console.error("Error sending booking receipt email:", emailError);
        // Tidak mengembalikan error ke client agar notifikasi Midtrans tetap dianggap sukses
      }
    } else if (transaction_status === "pending") {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: "PENDING",
        },
      });
    } else if (
      transaction_status === "expire" ||
      transaction_status === "cancel"
    ) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: "CANCELLED",
        },
      });
    }

    return res.status(200).json({ message: "Notification processed" });
  } catch (error) {
    console.error("Midtrans notification error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}