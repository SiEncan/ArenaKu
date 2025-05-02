"use client";

import MainLayout from "@/components/layouts/MainLayout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CreditCard,
  ArrowLeft,
  Download,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useBooking } from "@/context/BookingContext";

// Define booking type with all necessary fields
type Booking = {
  id: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  orderId: string;
  paidAt: string | null;
  createdAt: string;
  totalPrice: number;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  date: string;
  snapToken: string;
  userId?: string; // Optional userId if booking is made by a logged-in user
  data?: {
    name: string;
    email: string;
    phone: string;
  }; // Data user (fetched separately if userId exists)
  field: {
    id: string;
    name: string;
    venue: {
      name: string;
    };
  };
  timeSlot?: {
    id: string;
    startTime: string;
    endTime: string;
  } | null;
};

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: unknown) => void;
    };
  }
}

const PaymentStatusPage = () => {
  const router = useRouter();
  const { orderId } = router.query;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const { clearDraftBookingId } = useBooking();

  // Function to fetch booking and user data
  const fetchBookingData = async (id: string) => {
    try {
      setLoading(true);
      // Fetch booking data
      const res = await fetch(`/api/bookings/${id}`);
      const bookingData = await res.json();

      if (!bookingData.data) {
        throw new Error("Booking data not found");
      }

      let updatedBooking: Booking = bookingData.data;

      // If userId exists, fetch user data
      if (bookingData.data.userId) {
        const userRes = await fetch(`/api/users/${bookingData.data.userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const userData = await userRes.json();

        if (userData.success) {
          updatedBooking = {
            ...updatedBooking,
            data: {
              name: userData.data.name,
              email: userData.data.email,
              phone: userData.data.phone,
            },
          };
        }
      }

      setBooking(updatedBooking);
    } catch (error) {
      console.error("Failed to fetch booking data", error);
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId && typeof orderId === "string") {
      fetchBookingData(orderId);
    }
  }, [orderId]);

  const refreshBookingData = async () => {
    if (!orderId || typeof orderId !== "string") return;
    await fetchBookingData(orderId); // Reuse the same fetch function to ensure user data is fetched
  };

  const checkPaymentStatus = async () => {
    if (!orderId || typeof orderId !== "string") return;
    setCheckingStatus(true);

    try {
      const res = await fetch(`/api/payment/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        await refreshBookingData();
      }
    } catch (error) {
      console.error("Failed to check payment status", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const openMidtransPayment = () => {
    if (!booking?.snapToken || !window.snap) {
      console.error("Midtrans Snap not loaded or snapToken not available");
      return;
    }

    window.snap.pay(booking.snapToken, {
      onSuccess: () => {
        clearDraftBookingId();
        refreshBookingData();
      },
      onPending: () => {
        refreshBookingData();
      },
      onError: (result: unknown) => {
        console.error("Payment Error:", result);
      },
      onClose: () => {
        console.log("Customer closed the payment popup without finishing payment");
      },
    });
  };

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

  const getStatusConfig = () => {
    if (!booking) return {};

    switch (booking.status) {
      case "PAID":
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          bgColor: "bg-green-500",
          textColor: "text-green-600",
          bgLight: "bg-green-100",
          title: "Pembayaran Berhasil!",
          subtitle: "Terima kasih, booking Anda telah dikonfirmasi.",
          statusText: "LUNAS",
          buttonColor: "bg-green-500 hover:bg-green-600",
        };
      case "PENDING":
        return {
          icon: <AlertTriangle className="h-16 w-16 text-yellow-500" />,
          bgColor: "bg-yellow-500",
          textColor: "text-yellow-600",
          bgLight: "bg-yellow-100",
          title: "Menunggu Pembayaran",
          subtitle: "Silakan selesaikan pembayaran Anda untuk mengkonfirmasi booking.",
          statusText: "MENUNGGU",
          buttonColor: "bg-yellow-500 hover:bg-yellow-600",
        };
      case "CANCELLED":
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          bgColor: "bg-red-500",
          textColor: "text-red-600",
          bgLight: "bg-red-100",
          title: "Booking Dibatalkan",
          subtitle: "Booking ini telah dibatalkan.",
          statusText: "DIBATALKAN",
          buttonColor: "bg-red-500 hover:bg-red-600",
        };
      default:
        return {
          icon: <AlertTriangle className="h-16 w-16 text-gray-500" />,
          bgColor: "bg-gray-500",
          textColor: "text-gray-600",
          bgLight: "bg-gray-100",
          title: "Status Tidak Diketahui",
          subtitle: "Status booking tidak dapat ditentukan.",
          statusText: booking.status,
          buttonColor: "bg-gray-500 hover:bg-gray-600",
        };
    }
  };

  const statusConfig = getStatusConfig();

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[1000px] flex flex-col justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-semibold">Memuat informasi booking...</p>
        </div>
      </MainLayout>
    );
  }

  if (!booking) {
    return (
      <MainLayout>
        <div className="min-h-screen flex flex-col justify-center items-center p-8">
          <div className="text-center max-w-md">
            <div className="bg-red-100 p-6 rounded-lg mb-6">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Booking Tidak Ditemukan</h2>
              <p className="text-gray-700">
                Maaf, kami tidak dapat menemukan informasi booking dengan ID tersebut.
              </p>
            </div>
            <button
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center mx-auto transition-colors"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          {/* Status Animation */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-24 h-24 ${statusConfig.bgLight} rounded-full mb-4`}>
              {statusConfig.icon}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{statusConfig.title}</h1>
            <p className="text-gray-600 mt-2">{statusConfig.subtitle}</p>

            {booking.status === "PENDING" && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                <button
                  onClick={checkPaymentStatus}
                  disabled={checkingStatus}
                  className={`px-6 py-2 ${statusConfig.buttonColor} cursor-pointer text-white rounded-lg flex items-center justify-center transition-colors`}
                >
                  {checkingStatus ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Memeriksa Status...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-5 w-5" />
                      Periksa Status Pembayaran
                    </>
                  )}
                </button>
                <button
                  onClick={openMidtransPayment}
                  className="sm:hidden px-9.5 py-2 cursor-pointer border border-green-300 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Lanjutkan Pembayaran
                </button>
              </div>
            )}
          </div>

          {/* Receipt Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className={`${statusConfig.bgColor} p-6 text-white`}>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Detail Booking</h2>
                  <p className="opacity-90">#{booking.orderId}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-90">Status</div>
                  <div className={`inline-block px-3 py-1 rounded-full bg-white ${statusConfig.textColor} font-medium text-sm`}>
                    {statusConfig.statusText}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 divide-y divide-gray-200">
              <div className="py-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Informasi Booking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <Calendar className={`h-5 w-5 ${statusConfig.textColor} mr-3 mt-0.5`} />
                    <div>
                      <p className="text-sm text-gray-500">Tanggal Booking</p>
                      <p className="font-medium">{booking.date ? formatDate(booking.date) : "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className={`h-5 w-5 ${statusConfig.textColor} mr-3 mt-0.5`} />
                    <div>
                      <p className="text-sm text-gray-500">Waktu</p>
                      <p className="font-medium">
                        {booking.timeSlot
                          ? `${booking.timeSlot.startTime} - ${booking.timeSlot.endTime}`
                          : "Tidak tersedia"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CreditCard className={`h-5 w-5 ${statusConfig.textColor} mr-3 mt-0.5`} />
                    <div>
                      <p className="text-sm text-gray-500">Total Pembayaran</p>
                      <p className={`font-bold text-xl ${statusConfig.textColor}`}>
                        Rp{booking.totalPrice.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className={`h-5 w-5 ${statusConfig.textColor} mr-3 mt-0.5`} />
                    <div>
                      <p className="text-sm text-gray-500">Waktu Pembayaran</p>
                      <p className="font-medium">
                        {booking.paidAt
                          ? formatDate(booking.paidAt) + ", " + formatTime(booking.paidAt)
                          : "Belum dibayar"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Informasi Lapangan</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {booking.field ? (
                    <div className="flex items-center">
                      <div className={`${statusConfig.bgLight} rounded-lg p-3 mr-4`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-6 w-6 ${statusConfig.textColor}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-gray-800">
                          {booking.field.venue?.name || "Venue"}
                        </h4>
                        <p className="text-sm font-semibold text-gray-500">
                          Lapangan: {booking.field.name}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">Informasi lapangan tidak tersedia</p>
                  )}
                </div>
              </div>

              <div className="py-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Informasi Pemesan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start">
                    <User className={`h-5 w-5 ${statusConfig.textColor} mr-3 mt-0.5`} />
                    <div>
                      <p className="text-sm text-gray-500">Nama</p>
                      <p className="font-medium">{booking.guestName || booking.data?.name || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className={`h-5 w-5 ${statusConfig.textColor} mr-3 mt-0.5`} />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{booking.guestEmail || booking.data?.email || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className={`h-5 w-5 ${statusConfig.textColor} mr-3 mt-0.5`} />
                    <div>
                      <p className="text-sm text-gray-500">Telepon</p>
                      <p className="font-medium">{booking.guestPhone || booking.data?.phone || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                className={`w-full sm:w-auto px-6 py-3 ${statusConfig.buttonColor} cursor-pointer text-white rounded-lg flex items-center justify-center transition-colors`}
                onClick={() => router.push("/")}
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Kembali ke Beranda
              </button>

              {booking.status === "PAID" && (
                <button
                  className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center justify-center transition-colors"
                  onClick={() => window.print()}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Unduh Bukti Pembayaran
                </button>
              )}

              {booking.status === "PENDING" && (
                <button
                  onClick={openMidtransPayment}
                  className="w-full sm:w-auto hidden sm:flex px-6 py-3 cursor-pointer border border-green-300 bg-green-500 hover:bg-green-600 text-white rounded-lg items-center justify-center transition-colors"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Lanjutkan Pembayaran
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 text-center text-gray-500 text-sm">
            {booking.status === "PAID" ? (
              <>
                <p>Bukti pembayaran ini telah dikirim ke email Anda.</p>
                <p className="mt-1">Jika ada pertanyaan, silakan hubungi customer service kami.</p>
              </>
            ) : booking.status === "PENDING" ? (
              <>
                <p>Silakan selesaikan pembayaran Anda dalam 24 jam.</p>
                <p className="mt-1">
                  Booking akan otomatis dibatalkan jika pembayaran tidak dilakukan.
                </p>
              </>
            ) : (
              <p>
                Jika Anda memiliki pertanyaan tentang pembatalan ini, silakan hubungi customer service kami.
              </p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentStatusPage;