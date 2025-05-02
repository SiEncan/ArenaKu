import {
  MapPin,
  Mail,
  Phone,
  Facebook,
  Instagram,
  Twitter,
  X,
} from "lucide-react";
import Navbar from "@/components/layouts/NavBar";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBooking } from "@/context/BookingContext";
import { Toaster } from "sonner";

type LayoutProps = {
  children: ReactNode;
};

export default function MainLayout({ children }: LayoutProps) {
  const { draftBookingId } = useBooking();
  const [hasBooking, setHasBooking] = useState(false);
  const [isBannerHidden, setIsBannerHidden] = useState(false);
  const pathname = usePathname();

  // Daftar halaman di mana banner TIDAK boleh ditampilkan
  const hideBannerOnPages = ["/checkout", "/payment/status"];

  // Kunci untuk menyimpan status di localStorage
  const BANNER_HIDDEN_KEY = "banner_hidden";

  // Perbarui status banner setiap kali draftBookingId berubah
  useEffect(() => {
    const hasDraftBookingId = !!draftBookingId;
    setHasBooking(hasDraftBookingId);

    if (!hasDraftBookingId) {
      setIsBannerHidden(false);
      localStorage.removeItem(BANNER_HIDDEN_KEY);
    } else {
      const hidden = localStorage.getItem(BANNER_HIDDEN_KEY) === "true";
      setIsBannerHidden(hidden);
    }
  }, [draftBookingId]);

  // Fungsi untuk menutup banner
  const handleCloseBanner = () => {
    setIsBannerHidden(true);
    localStorage.setItem(BANNER_HIDDEN_KEY, "true");
  };

  // Tentukan apakah banner harus ditampilkan berdasarkan path dan status
  const isBannerHiddenOnPage = pathname
    ? hideBannerOnPages.some((page) => pathname.startsWith(page))
    : false;
  const shouldShowBanner =
    hasBooking && !isBannerHidden && !isBannerHiddenOnPage;

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Toaster position="top-right" richColors />

      {/* Navbar */}
      <Navbar />

      {/* Floating Banner untuk melanjutkan pembayaran */}
      {shouldShowBanner && (
        <div className="sticky top-14 md:top-16 z-40 bg-red-600 text-gray-800 py-3 px-6 shadow-lg">
          <div className="container mx-auto flex flex-row justify-between items-center gap-3 md:gap-0 relative">
            <p className="text-sm text-white md:text-base font-semibold text-left">
              Anda memiliki pembayaran yang belum selesai, ingin melanjutkan?
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/checkout"
                className="px-4 py-2 bg-white text-red-600 font-bold rounded-lg hover:bg-gray-100 transition"
              >
                Lanjutkan Pembayaran
              </Link>
              <button
                onClick={handleCloseBanner}
                className="absolute top-3 right-3 static text-white"
                aria-label="Tutup banner"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main>{children}</main>

      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Siap Memulai Booking Lapangan?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Daftar sekarang dan dapatkan akses ke ratusan lapangan olahraga
            terbaik
          </p>
          <a
            href="#"
            className="inline-block px-8 py-3 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 transition"
          >
            Daftar Sekarang
          </a>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ArenaKu</h3>
              <p className="text-gray-400">
                Platform booking lapangan olahraga terbaik di Indonesia
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Tautan Cepat</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Beranda
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Venue
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Tentang Kami
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Kontak
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Kontak Kami</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <Mail className="mr-2 w-5 h-5 text-gray-500" />
                  hello@arenaku.id
                </li>
                <a href="tel:+6281234567890">
                  <li className="flex items-center">
                    <Phone className="mr-2 w-5 h-5 text-gray-500" />
                    +62 812 3456 7890
                  </li>
                </a>
                <li className="flex items-center">
                  <MapPin className="mr-2 w-5 h-5 text-gray-500" />
                  Jakarta, Indonesia
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Ikuti Kami</h4>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-600 transition"
                >
                  <Facebook className="w-5 h-5 text-gray-500" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-600 transition"
                >
                  <Instagram className="w-5 h-5 text-gray-500" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-600 transition"
                >
                  <Twitter className="w-5 h-5 text-gray-500" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 ArenaKu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
