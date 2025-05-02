import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { booking } = req.body;

  if (!booking || booking.status !== "PAID") {
    return res.status(400).json({ success: false, message: "Booking data with status PAID is required" });
  }

  // Tentukan alamat email tujuan: gunakan user.email jika ada, jika tidak gunakan guestEmail
  const recipientEmail = booking.user?.email || booking.guestEmail;
  if (!recipientEmail) {
    return res.status(400).json({ success: false, message: "No recipient email found (neither user.email nor guestEmail)" });
  }

  // Konfigurasi transporter untuk Gmail
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // Format tanggal dan waktu seperti di PaymentStatusPage
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Template HTML untuk email (khusus status PAID)
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bukti Pembayaran Booking</title>
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
          background-color: #22c55e; /* green-500 */
          padding: 20px;
          text-align: center;
          color: #fff;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .header p {
          margin: 5px 0 0;
          opacity: 0.9;
        }
        .status {
          text-align: center;
          padding: 20px;
        }
        .status h2 {
          color: #16a34a; /* green-600 */
          font-size: 28px;
          margin-bottom: 10px;
        }
        .status p {
          color: #666;
          margin-bottom: 20px;
        }
        .status .badge {
          display: inline-block;
          background-color: #16a34a; /* green-600 */
          color: #fff;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: bold;
        }
        .content {
          padding: 20px;
        }
        .section {
          margin-bottom: 20px;
        }
        .section h3 {
          font-size: 18px;
          color: #333;
          margin-bottom: 10px;
        }
        .section .info {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        .section .info svg {
          margin-right: 10px;
          color: #16a34a; /* green-600 */
        }
        .section .info div p {
          margin: 0;
        }
        .section .info div p.label {
          font-size: 14px;
          color: #666;
        }
        .section .info div p.value {
          font-weight: 500;
        }
        .field-info {
          background-color: #f9fafb; /* gray-50 */
          padding: 15px;
          border-radius: 8px;
        }
        .field-info .info {
          display: flex;
          align-items: center;
        }
        .field-info .icon {
          background-color: #dcfce7; /* green-100 */
          padding: 10px;
          border-radius: 8px;
          margin-right: 15px;
        }
        .field-info .icon svg {
          color: #16a34a; /* green-600 */
        }
        .total {
          font-size: 20px;
          font-weight: bold;
          color: #16a34a; /* green-600 */
        }
        .footer {
          background-color: #f9fafb; /* gray-50 */
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>Detail Booking</h1>
          <p>#${booking.orderId}</p>
        </div>

        <!-- Status -->
        <div class="status">
          <h2>Pembayaran Berhasil!</h2>
          <p>Terima kasih, booking Anda telah dikonfirmasi.</p>
          <div class="badge">LUNAS</div>
        </div>

        <!-- Content -->
        <div class="content">
          <!-- Booking Details -->
          <div class="section">
            <h3>Informasi Booking</h3>
            <div class="info">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.5 2h11a2 2 0 012 2v16a2 2 0 01-2 2h-11a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v16h11V4h-11zm4 2h3v2h-3V6zm0 4h3v2h-3v-2zm0 4h3v2h-3v-2z"/>
              </svg>
              <div>
                <p class="label">Tanggal Booking</p>
                <p class="value">${booking.date ? formatDate(booking.date) : "-"}</p>
              </div>
            </div>
            <div class="info">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 110 20 10 10 0 010-20zm0 2a8 8 0 100 16 8 8 0 000-16zm0 2a1 1 0 011 1v5h3a1 1 0 110 2h-4a1 1 0 01-1-1V7a1 1 0 011-1z"/>
              </svg>
              <div>
                <p class="label">Waktu</p>
                <p class="value">${booking.timeSlot ? `${booking.timeSlot.startTime} - ${booking.timeSlot.endTime}` : "Tidak tersedia"}</p>
              </div>
            </div>
            <div class="info">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v12h14V6H5zm2 2h10v2H7V8zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
              </svg>
              <div>
                <p class="label">Total Pembayaran</p>
                <p class="value total">Rp${booking.totalPrice.toLocaleString("id-ID")}</p>
              </div>
            </div>
            <div class="info">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 110 20 10 10 0 010-20zm0 2a8 8 0 100 16 8 8 0 000-16zm0 2a1 1 0 011 1v5h3a1 1 0 110 2h-4a1 1 0 01-1-1V7a1 1 0 011-1z"/>
              </svg>
              <div>
                <p class="label">Waktu Pembayaran</p>
                <p class="value">${booking.paidAt ? formatDate(booking.paidAt) + ", " + formatTime(booking.paidAt) : "Belum dibayar"}</p>
              </div>
            </div>
          </div>

          <!-- Field Details -->
          <div class="section">
            <h3>Informasi Lapangan</h3>
            <div class="field-info">
              ${booking.field ? `
                <div class="info">
                  <div class="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 style="font-weight: bold; font-size: 18px; color: #333;">${booking.field.venue?.name || "Venue"}</h4>
                    <p style="font-size: 14px; font-weight: 500; color: #666;">Lapangan: ${booking.field.name}</p>
                  </div>
                </div>
              ` : `
                <p style="color: #666;">Informasi lapangan tidak tersedia</p>
              `}
            </div>
          </div>

          <!-- Customer Details -->
          <div class="section">
            <h3>Informasi Pemesan</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
              <div class="info">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3.31 0-6 2.69-6 6v2h12v-2c0-3.31-2.69-6-6-6z"/>
                </svg>
                <div>
                  <p class="label">Nama</p>
                  <p class="value">${booking.guestName || booking.user?.name || "-"}</p>
                </div>
              </div>
              <div class="info">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v12h16V6H4zm2 2h12v2H6V8zm0 4h12v2H6v-2z"/>
                </svg>
                <div>
                  <p class="label">Email</p>
                  <p class="value">${recipientEmail}</p>
                </div>
              </div>
              <div class="info">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79a15.1 15.1 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21 11.72 11.72 0 004.62 1.14 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h2.67a1 1 0 011 1 11.72 11.72 0 001.14 4.62 1 1 0 01-.21 1.11l-2.2 2.2z"/>
                </svg>
                <div>
                  <p class="label">Telepon</p>
                  <p class="value">${booking.guestPhone || booking.user?.phone || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>Jika ada pertanyaan, silakan hubungi customer service kami.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Opsi email
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: recipientEmail,
    subject: `Bukti Pembayaran Booking #${booking.orderId}`,
    html: htmlTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Booking receipt email sent" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send booking receipt email" });
  }
}