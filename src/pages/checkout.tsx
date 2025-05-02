import MainLayout from "@/components/layouts/MainLayout";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateToDay } from "@/utils/formatDate";
import { Dialog } from "@headlessui/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useBooking } from "@/context/BookingContext";
import {
  CreditCard,
  Phone,
  Mail,
  ArrowLeft,
  Calendar,
  Clock,
  Building,
  User,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

const CheckoutPage = () => {
  const router = useRouter();

  const { data: session } = useSession();
  const user = session?.user;
  const { draftBookingId, clearDraftBookingId } = useBooking();

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [showDeleteConfirmationDialog, setShowDeleteConfirmationDialog] =
    useState(false);
  const [snapTokenButton, setSnapTokenButton] = useState<string | null>(null);
  const [displayContinuePayment, setDisplayContinuePayment] = useState(false);
  const [globalOrderId, setGlobalOrderId] = useState<string | null>(null);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showResendVerificationModal, setShowResendVerificationModal] =
    useState(false);
  const [showEmailConfirmationDialog, setShowEmailConfirmationDialog] =
    useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [lastSentTime, setLastSentTime] = useState<number | null>(null);
  const [hasSentInitialCode, setHasSentInitialCode] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const [timeLeft, setTimeLeft] = useState(600);
  const [resendCount, setResendCount] = useState(0);
  const [firstResendTime, setFirstResendTime] = useState<number | null>(null);
  const MAX_RESENDS = 2;
  const RESEND_WINDOW = 10 * 60 * 1000;

  const biayaTransaksi = 5000;

  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const isProcessingRef = useRef(false); // Gunakan useRef untuk menyimpan flag

  useEffect(() => {
    // Hentikan eksekusi jika sudah diproses
    if (isProcessingRef.current) {
      return;
    }

    if (!draftBookingId && !isProcessingRef.current && !errorModal) {
      setErrorModal("Tidak ada booking yang aktif. Silakan buat booking baru.");
      return;
    }

    const fetchBookingData = async () => {
      try {
        const res = await fetch(`/api/bookings/${draftBookingId}`);
        const result = await res.json();

        if(!draftBookingId) {
          setErrorModal("Tidak ada booking yang aktif. Silakan buat booking baru.");
          return;
        }

        if (!result.success) {
          setErrorModal(result.message || "Gagal mengambil data booking");
          return;
        }

        if (
          result.data.status === "PAID" ||
          (result.data.status === "CANCELLED" && result.data.orderId)
        ) {
          clearDraftBookingId();
          isProcessingRef.current = true; // Tandai bahwa proses selesai
          setRedirectUrl(`/payment/status/${result.data.orderId}`);
          setErrorModal(
            result.data.status === "PAID"
              ? "Pembayaran Anda telah berhasil! Anda akan diarahkan ke halaman status pembayaran."
              : "Booking telah dibatalkan. Anda akan diarahkan ke halaman status pembayaran."
          );
        } else if (result.data.status === "CANCELLED" && !result.data.orderId) {
          toast.error("Booking telah dibatalkan.");
          clearDraftBookingId();
          isProcessingRef.current = true; // Tandai bahwa proses selesai
          setErrorModal("Booking telah dibatalkan.");
        } else {
          setBookingData(result.data);
          setDisplayContinuePayment(result.data.status === "PENDING");
          setSnapTokenButton(result.data.snapToken);
          setGlobalOrderId(result.data.orderId);

          if (result.data.guestEmail) {
            setGuestEmail(result.data.guestEmail);
            setGuestName(result.data.guestName || "");
            setGuestPhone(result.data.guestPhone || "");
          }
        }
      } catch (error: unknown) {
        console.error("Error fetching booking data:", error);
        setErrorModal("Terjadi kesalahan saat mengambil data booking");
      } finally {
        if (!isProcessingRef.current) {
          setFetchingData(false);
        }
      }
    };

    fetchBookingData();
  }, [draftBookingId, router, clearDraftBookingId, errorModal]);

  useEffect(() => {
    if (!showVerificationModal || !lastSentTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastSentTime) / 1000);
      const remaining = 600 - elapsed;
      setTimeLeft(remaining > 0 ? remaining : 0);

      if (remaining <= 0) {
        clearInterval(interval);
        setShowVerificationModal(false);
        alert("Kode verifikasi telah kadaluarsa. Silakan minta kode baru.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [showVerificationModal, lastSentTime]);

  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!firstResendTime || resendCount === 0) return;

    const timeSinceFirstResend = Date.now() - firstResendTime;
    if (timeSinceFirstResend >= RESEND_WINDOW) {
      setResendCount(0);
      setFirstResendTime(null);
    }
  }, [firstResendTime, resendCount]);

  const handleDeleteBookingAndBack = async () => {
    setShowDeleteConfirmationDialog(false);
    setShowPendingDialog(false);

    const bookingIdToDelete = pendingBookingId ?? draftBookingId;

    if (bookingIdToDelete) {
      try {
        const res = await fetch(`/api/bookings/${bookingIdToDelete}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await res.json();
        if (!result.success) {
          console.error(
            "Failed to delete booking from backend:",
            result.message
          );
          alert("Gagal menghapus booking dari server. Silakan coba lagi.");
          return;
        }
      } catch (error) {
        console.error("Error deleting booking from backend:", error);
        alert("Terjadi kesalahan saat menghapus booking dari server.");
        return;
      }
    }

    setPendingBookingId(null);
    setDisplayContinuePayment(false);
    setGlobalOrderId(null);
    setSnapTokenButton(null);

    if (pendingBookingId) {
      // Jika menghapus booking lama, lanjutkan dengan booking baru
      if (draftBookingId) {
        try {
          const res = await fetch(`/api/bookings/${draftBookingId}`);
          const result = await res.json();
          if (result.success) {
            setBookingData(result.data); // Perbarui bookingData dengan data booking baru
            createBookingWithData(result.data); // lanjut dengan booking baru
          } else {
            setBookingData(null);
            alert("Gagal mengambil data booking baru. Silakan coba lagi.");
            return;
          }
        } catch (error) {
          console.error("Error fetching new booking data:", error);
          setBookingData(null);
          alert("Terjadi kesalahan saat mengambil data booking baru.");
          return;
        }
      }
    } else {
      // Jika tidak ada booking lama, hapus draftBookingId dan kembali
      clearDraftBookingId();
      setBookingData(null);
      router.back();
    }
  };

  const confirmDeleteBooking = () => {
    setShowDeleteConfirmationDialog(true);
  };

  const checkPendingBooking = async () => {
    const payload = user ? { userId: user.id } : { guestEmail: guestEmail };

    if (!payload.userId && !payload.guestEmail) {
      return;
    }

    try {
      const res = await fetch("/api/bookings/check-pending-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success && result.booking) {
        setPendingBookingId(result.booking.id)
        setGlobalOrderId(result.booking.orderId);
        setSnapTokenButton(result.booking.snapToken);
        setDisplayContinuePayment(true);
        setShowPendingDialog(true);
        setBookingData(result.booking);
      } else {
        createBookingWithData(bookingData);
      }
    } catch (error) {
      console.error("Error checking pending booking:", error);
    }
  };

  const handleConfirmEmail = async () => {
    if (
      (user && !user.email) ||
      (!user && (!guestName || !guestEmail || !guestPhone))
    ) {
      alert("Harap lengkapi semua informasi pemesan sebelum melanjutkan.");
      return;
    }

    try {
      const slotRes = await fetch("/api/check-slot-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fieldId: bookingData.fieldId,
          timeSlotId: bookingData.timeSlotId,
          date: bookingData.date,
        }),
      });

      const slotData = await slotRes.json();

      if (!slotData.success) {
        alert("Gagal memeriksa ketersediaan slot. Silakan coba lagi.");
        return;
      }

      if (!slotData.available) {
        alert(slotData.message);

        clearDraftBookingId();
        router.back();
        return;
      }
    } catch (error: unknown) {
      console.error("Error checking slot availability:", error);
      alert(
        "Terjadi kesalahan saat memeriksa ketersediaan slot. Silakan coba lagi."
      );
      return;
    }

    if (displayContinuePayment) {
      setShowPendingDialog(true);
      return;
    }

    if (!hasSentInitialCode) {
      setShowEmailConfirmationDialog(true);
    } else {
      setShowVerificationModal(true);
    }
  };

  const sendVerificationEmail = async () => {
    const email = user?.email || guestEmail;

    if (!email) {
      alert("Email tidak ditemukan atau tidak valid");
      setShowEmailConfirmationDialog(false);
      return;
    }

    setIsSendingVerification(true);

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const res = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setLastSentTime(Date.now());
        setHasSentInitialCode(true);
        setShowVerificationModal(true);
        setShowEmailConfirmationDialog(false);
        setTimeLeft(600);
      } else {
        alert(result.message || "Gagal mengirim email verifikasi.");
      }
    } catch (error) {
      console.error("Error sending verification email:", error);
      alert("Terjadi kesalahan saat mengirim email verifikasi.");
    } finally {
      setIsSendingVerification(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode) {
      alert("Harap masukkan kode verifikasi.");
      return;
    }

    const email = user?.email || guestEmail;
    if (!email) {
      alert("Email tidak ditemukan atau tidak valid");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setShowVerificationModal(false);
        setVerificationCode("");
        await checkPendingBooking();
      } else {
        alert(result.message || "Kode verifikasi salah. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      alert("Terjadi kesalahan saat verifikasi.");
    } finally {
      setIsVerifying(false);
    }
  };

  const resendVerificationCode = async () => {
    const email = user?.email || guestEmail;
    if (!email) {
      alert("Email tidak ditemukan atau tidak valid");
      return;
    }

    if (lastSentTime) {
      const timeElapsed = Date.now() - lastSentTime;
      const oneMinuteInMs = 60 * 1000;
      if (timeElapsed < oneMinuteInMs) {
        const secondsRemaining = Math.ceil(
          (oneMinuteInMs - timeElapsed) / 1000
        );
        alert(
          `Silakan tunggu ${secondsRemaining} detik sebelum mengirim kode baru.`
        );
        return;
      }
    }

    if (resendCount >= MAX_RESENDS) {
      alert(
        "Anda telah mencapai batas pengiriman ulang. Silakan coba lagi setelah 10 menit."
      );
      return;
    }

    if (resendCount === 0) {
      setFirstResendTime(Date.now());
    }
    setTimeLeft(600);
    setResendCount((prev) => prev + 1);
    setVerificationCode("");
    await sendVerificationEmail();
    setShowResendVerificationModal(true);
  };

  const createBookingWithData = async (bookingData: any) => {    
    setLoading(true);
    let snapToken = "";
    let orderId = "";

    try {
      const bookingRes = await fetch(`/api/bookings/${bookingData.id}`);
      const bookingResult = await bookingRes.json();

      if (!bookingResult.success || bookingResult.data.status !== "DRAFT") {
        throw new Error("Booking tidak valid atau sudah diproses");
      }

      const paymentData = user
        ? {
            userId: user.id,
            fieldId: bookingData.fieldId,
            price: bookingData.totalPrice,
            venueName: bookingData.field.venue.name,
            fieldName: bookingData.field.name,
            timeSlotId: bookingData.timeSlotId,
            date: bookingData.date,
          }
        : {
            name: guestName,
            email: guestEmail,
            phone: guestPhone,
            fieldId: bookingData.fieldId,
            price: bookingData.totalPrice,
            venueName: bookingData.field.venue.name,
            fieldName: bookingData.field.name,
            timeSlotId: bookingData.timeSlotId,
            date: bookingData.date,
          };

      const paymentRes = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const paymentResult = await paymentRes.json();

      if (!paymentResult.success) {
        throw new Error("Gagal memulai pembayaran");
      }

      snapToken = paymentResult.snapToken;
      orderId = paymentResult.orderId;

      const userData = user
        ? {
            userId: user.id,
          }
        : {
            guestName: guestName,
            guestEmail: guestEmail,
            guestPhone: guestPhone,
          };

      const bookingPayload = {
        ...userData,
        bookingId: bookingData.id,
        status: "PENDING",
        snapToken,
        orderId,
      };

      const updateRes = await fetch("/api/bookings/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingPayload),
      });

      const updateResult = await updateRes.json();
      if (!updateResult.success) {
        throw new Error(
          updateResult.message || "Gagal memperbarui status booking"
        );
      }

      handlePayment(snapToken, orderId);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      alert("Terjadi kesalahan saat membuat booking: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (snapToken: string, orderId: string) => {
    try {
      setSnapTokenButton(snapToken);
      setGlobalOrderId(orderId);
      setDisplayContinuePayment(true);

      window.snap.pay(snapToken, {
        onSuccess: async function () {
          await fetch(`/api/payment/confirm`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId,
            }),
          });
          clearDraftBookingId();
          router.push(`/payment/status/${orderId}`);
        },
        onPending: async function () {
          await fetch(`/api/payment/confirm`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId,
            }),
          });
          router.push(`/payment/status/${orderId}`);
        },
        onError: function (res: any) {
          console.error("Payment Error:", res);
        },
        onClose: function () {
          router.push(`/payment/status/${orderId}`);
        },
      });
    } catch (error) {
      console.error("Payment error:", error);
      alert("Terjadi error saat memproses pembayaran.");
    }
  };

  const continuePayment = async () => {
    try {
      if (snapTokenButton) {
        window.snap.pay(snapTokenButton, {
          onSuccess: async function () {
            await fetch(`/api/payment/confirm`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: globalOrderId,
              }),
            });

            clearDraftBookingId();
            router.push(`/payment/status/${globalOrderId}`);
          },
          onPending: async function () {
            await fetch(`/api/payment/confirm`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: globalOrderId,
              }),
            });
            router.push(`/payment/status/${globalOrderId}`);
          },
          onError: function (res) {
            console.log("Payment Error:", res);
          },
          onClose: function () {
            router.push(`/payment/status/${globalOrderId}`);
          },
        });
      } else {
        alert("Tidak ada transaksi yang bisa dilanjutkan.");
      }
    } catch (error) {
      console.error("Error continue payment:", error);
      alert("Tidak dapat melanjutkan pembayaran.");
    }
  };

  const handleCloseErrorModal = () => {
    if (redirectUrl) {
      router.push(redirectUrl); // Arahkan ke URL yang disimpan
    } else {
      router.back(); // Jika tidak ada redirect URL, kembali
    }
    setErrorModal(null);
    setRedirectUrl(null);
  };

  if (errorModal) {
    return (
      <MainLayout>
        <div className="fixed inset-0 flex items-center justify-center bg-gray-50 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <h2 className="text-xl font-bold text-red-600 mb-2">Informasi</h2>
            <p className="text-gray-700 mb-4">{errorModal}</p>
            <button
              onClick={handleCloseErrorModal}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // if (!bookingData && !fetchingData) {
  //   return (
  //     <MainLayout>
  //       <div className="min-h-[50vh] flex flex-col justify-center items-center p-8">
  //         <div className="text-center max-w-md">
  //           <div className="bg-red-100 p-6 rounded-lg mb-6">
  //             <h2 className="text-2xl font-bold text-red-600 mb-2">
  //               Booking Tidak Ditemukan
  //             </h2>
  //             <p className="text-gray-700">
  //               Maaf, kami tidak dapat menemukan informasi booking dengan ID
  //               tersebut.
  //             </p>
  //           </div>
  //           <button
  //             className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center mx-auto transition-colors"
  //             onClick={() => {
  //               clearDraftBookingId();
  //               router.push("/");
  //             }}
  //           >
  //             <ArrowLeft className="mr-2 h-5 w-5" />
  //             Kembali ke Beranda
  //           </button>
  //         </div>
  //       </div>
  //     </MainLayout>
  //   );
  // }

  return (
    <MainLayout>
      {fetchingData ? (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
            <p className="text-green-800">Memuat Data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-green-500 p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold">Detail Booking</h2>
                      {globalOrderId && (
                        <p className="opacity-90">#{globalOrderId}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm opacity-90">Status</div>
                      <div className="inline-block px-3 py-1 rounded-full bg-white text-green-600 font-medium text-sm">
                        MENUNGGU PEMBAYARAN
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 divide-y divide-gray-200">
                  <div className="py-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Informasi Lapangan
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-green-100 rounded-lg p-3 mr-4">
                          <Building className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-gray-800">
                            {bookingData?.field.venue.name || "Venue"}
                          </h4>
                          <p className="text-sm font-semibold text-gray-500">
                            Lapangan: {bookingData?.field.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Jadwal Booking
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">
                            Tanggal Booking
                          </p>
                          <p className="font-medium">
                            {bookingData?.date
                              ? formatDateToDay(new Date(bookingData.date))
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Waktu</p>
                          <p className="font-medium">
                            {bookingData?.timeSlot.startTime} -{" "}
                            {bookingData?.timeSlot.endTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Rincian Harga
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-600">Harga Lapangan</p>
                        <p className="font-medium">
                          {formatCurrency(
                            bookingData?.totalPrice - biayaTransaksi || 0
                          )}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-gray-600">Biaya Transaksi</p>
                        <p className="font-medium">
                          {formatCurrency(biayaTransaksi)}
                        </p>
                      </div>
                      <div className="border-t border-dashed border-gray-300 my-2 pt-2"></div>
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-lg">
                          Total Pembayaran
                        </p>
                        <p className="font-bold text-xl text-green-600">
                          {formatCurrency(bookingData?.totalPrice || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!user && (
                    <div className="py-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Informasi Pemesan
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-green-500 mr-3" />
                          <div className="flex-1">
                            <input
                              type="text"
                              value={guestName}
                              onChange={(e) => setGuestName(e.target.value)}
                              placeholder="Nama Lengkap"
                              className="w-full border px-3 py-2 rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 text-green-500 mr-3" />
                          <div className="flex-1">
                            <input
                              type="email"
                              value={guestEmail}
                              onChange={(e) => setGuestEmail(e.target.value)}
                              placeholder="Email"
                              className="w-full border px-3 py-2 rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-green-500 mr-3" />
                          <div className="flex-1">
                            <input
                              type="tel"
                              value={guestPhone}
                              onChange={(e) => setGuestPhone(e.target.value)}
                              placeholder="Nomor HP"
                              className="w-full border px-3 py-2 rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button
                    className="w-full sm:w-auto px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                    onClick={() => router.push("/")}
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Kembali ke Beranda
                  </button>

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {displayContinuePayment ? (
                      <>
                        <button
                          onClick={() => {
                            if (globalOrderId) continuePayment();
                          }}
                          disabled={loading}
                          className="w-full sm:w-auto px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                        >
                          {loading ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Memproses...
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-5 w-5" />
                              Lanjutkan Pembayaran
                            </>
                          )}
                        </button>
                        <button
                          onClick={confirmDeleteBooking}
                          className="w-full sm:w-auto px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-5 w-5" />
                          Hapus Booking & Kembali
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleConfirmEmail}
                          disabled={loading}
                          className="w-full sm:w-auto px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                        >
                          {loading ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Memproses...
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-5 w-5" />
                              Bayar Sekarang
                            </>
                          )}
                        </button>
                        <button
                          onClick={confirmDeleteBooking}
                          className="w-full sm:w-auto px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-5 w-5" />
                          Hapus Booking & Kembali
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center text-gray-500 text-sm">
                <p>
                  Pembayaran aman dengan enkripsi SSL dan diproses oleh
                  Midtrans.
                </p>
                <p className="mt-1">
                  Booking akan dikonfirmasi segera setelah pembayaran berhasil.
                </p>
              </div>
            </div>
          </div>

          <Dialog
            open={showEmailConfirmationDialog}
            onClose={() => setShowEmailConfirmationDialog(false)}
            className="relative z-50"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6 space-y-4 shadow-xl">
                <Dialog.Title className="text-xl font-bold text-gray-800">
                  Konfirmasi Email
                </Dialog.Title>
                <Dialog.Description className="text-gray-600">
                  Kode verifikasi akan dikirim ke email berikut:{" "}
                  <span className="font-medium">
                    {user?.email || guestEmail}
                  </span>
                  .
                  <br />
                  Apakah Anda yakin email tersebut sudah benar?
                </Dialog.Description>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowEmailConfirmationDialog(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition cursor-pointer"
                  >
                    Tidak, Ubah Email
                  </button>
                  <button
                    onClick={sendVerificationEmail}
                    disabled={isSendingVerification}
                    className="px-4 py-2 text-white bg-green-500 hover:bg-green-600 rounded-lg transition disabled:opacity-50 flex items-center cursor-pointer"
                  >
                    {isSendingVerification ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white mr-2"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending verification code...
                      </>
                    ) : (
                      "Ya, Kirim Kode"
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>

          <Dialog
            open={showPendingDialog}
            onClose={() => setShowPendingDialog(false)}
            className="relative z-50"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6 space-y-4 shadow-xl">
                <Dialog.Title className="text-xl font-bold text-gray-800">
                  Pembayaran Belum Selesai
                </Dialog.Title>
                <Dialog.Description className="text-gray-600">
                  <span className="mb-3">
                    Anda memiliki transaksi yang belum selesai. Silakan
                    lanjutkan pembayaran untuk melanjutkan.
                  </span>
                  <span className="text-red-500 font-medium">
                    Jika tidak, Anda bisa menghapus booking ini dan kembali.
                  </span>
                </Dialog.Description>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowPendingDialog(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={confirmDeleteBooking}
                    className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition cursor-pointer"
                  >
                    Hapus Booking & Kembali
                  </button>
                  <button
                    onClick={() => {
                      setShowPendingDialog(false);
                      if (globalOrderId) continuePayment();
                    }}
                    className="px-4 py-2 text-white bg-green-500 hover:bg-green-600 rounded-lg transition cursor-pointer"
                  >
                    Lanjutkan Pembayaran
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>

          <Dialog
            open={showDeleteConfirmationDialog}
            onClose={() => setShowDeleteConfirmationDialog(false)}
            className="relative z-50"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6 space-y-4 shadow-xl">
                <Dialog.Title className="text-xl font-bold text-gray-800">
                  Konfirmasi Penghapusan
                </Dialog.Title>
                <Dialog.Description className="text-gray-600">
                  Apakah Anda yakin ingin menghapus booking ini? Tindakan ini
                  tidak dapat dibatalkan.
                </Dialog.Description>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowDeleteConfirmationDialog(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDeleteBookingAndBack}
                    className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>

          <Dialog
            open={showVerificationModal}
            onClose={() => setShowVerificationModal(false)}
            className="relative z-50"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6 space-y-4 shadow-xl">
                <Dialog.Title className="text-xl font-bold text-gray-800">
                  Verifikasi Email
                </Dialog.Title>
                <Dialog.Description className="text-gray-600">
                  Kami telah mengirimkan kode verifikasi 6 digit ke email Anda (
                  {user?.email || guestEmail}).
                  <span className="mt-2 block">
                    Kode berlaku selama{" "}
                    <span className="font-medium text-green-500">
                      {formatTimeLeft(timeLeft)}
                    </span>
                    .
                  </span>
                </Dialog.Description>

                <div className="space-y-4">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Masukkan kode verifikasi"
                    className="w-full border px-3 py-2 rounded-md border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={6}
                  />
                  <div className="flex flex-col sm:flex-row items-start sm:justify-between">
                    <button
                      onClick={resendVerificationCode}
                      disabled={
                        isSendingVerification || resendCount >= MAX_RESENDS
                      }
                      className={`text-blue-500 hover:underline text-sm cursor-pointer ${
                        resendCount >= MAX_RESENDS
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      Kirim ulang kode ({MAX_RESENDS - resendCount} tersisa)
                    </button>
                    <span className="mt-2 sm:mt-0 text-red-500 text-sm">
                      (Cek folder spam jika tidak ada di inbox.)
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowVerificationModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={verifyCode}
                    disabled={isVerifying || timeLeft <= 0}
                    className="px-4 py-2 text-white bg-green-500 hover:bg-green-600 rounded-lg transition disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifying ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Memverifikasi...
                      </div>
                    ) : (
                      "Verifikasi"
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
          <Dialog
            open={showResendVerificationModal}
            onClose={() => setShowResendVerificationModal(false)}
            className="relative z-50"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 space-y-4 shadow-xl">
                <Dialog.Title className="text-xl font-bold text-gray-800">
                  Verifikasi Terkirim
                </Dialog.Title>
                <Dialog.Description className="text-gray-600">
                  Kode verifikasi telah dikirim ke email Anda: (
                  {user?.email || guestEmail})
                </Dialog.Description>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowResendVerificationModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </>
      )}
    </MainLayout>
  );
};

export default CheckoutPage;
