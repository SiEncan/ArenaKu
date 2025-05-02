import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: "Email and code are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Format email tidak valid" });
  }

  // Hitung waktu kadaluarsa (10 menit dari sekarang)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit dalam milidetik

  // Simpan kode verifikasi ke database
  try {
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        createdAt: new Date(),
        expiresAt,
        isUsed: false,
      },
    });
  } catch (error) {
    console.error("Error saving verification code to database:", error);
    return res.status(500).json({ success: false, message: "Gagal menyimpan kode verifikasi" });
  }

  // Konfigurasi transporter untuk Gmail
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kode Verifikasi</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background-color: #22c55e;
          padding: 20px;
          text-align: center;
          color: #fff;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 20px;
        }
        .code {
          text-align: center;
          font-size: 32px;
          font-weight: bold;
          color: #16a34a;
          margin: 20px 0;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Kode Verifikasi Anda</h1>
        </div>
        <div class="content">
          <p>Gunakan kode berikut untuk melanjutkan proses verifikasi:</p>
          <div class="code">${code}</div>
          <p>Kode ini hanya berlaku selama 10 menit. Jika Anda tidak meminta kode ini, silakan abaikan email ini.</p>
        </div>
        <div class="footer">
          <p>Email ini dikirim oleh sistem ArenaKu.</p>
          <p>Jika ada pertanyaan, hubungi kami di support@arenaku.com.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const plainText = `
    Gunakan kode berikut untuk melanjutkan proses verifikasi:

    ${code}

    Kode ini hanya berlaku selama 10 menit. Jika Anda tidak meminta kode ini, silakan abaikan email ini.

    Jika ada pertanyaan, hubungi kami di support@arenaku.com.
  `;

  // Opsi email
  const mailOptions = {
    from: `"Arenaku" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Kode Verifikasi Booking Arenaku",
    text: plainText,
    html: htmlTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Kode verifikasi telah dikirim" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error sending email:", error);
    if (error.code === "EENVELOPE" && error.message.includes("No recipients defined")) {
      res.status(400).json({ success: false, message: "Email tidak ditemukan atau tidak valid" });
    } else {
      res.status(500).json({ success: false, message: "Gagal mengirim email verifikasi" });
    }
  }
}