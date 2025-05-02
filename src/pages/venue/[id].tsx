import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Venue } from "@/types/venue";
import {
  MapPin,
  Clock,
  ArrowLeft,
  Star,
  Search,
  ChevronDownCircle,
} from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import MainLayout from "@/components/layouts/MainLayout";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useBooking } from "@/context/BookingContext";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { TimeSlot } from "@/types/field";
import BookingDatePicker from "@/components/DatePicker";
import { formatDate, formatDateToDay } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";
import { calculateDuration } from "@/utils/calculateDuration";
import SportTypeDropdown from "@/components/SportTypeDropdown";
export default function VenueDetail() {
  const [openImage, setOpenImage] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const router = useRouter();
  const { id } = router.query;
  const [venue, setVenue] = useState<Venue>();
  const [filters, setFilters] = useState({
    sportType: "",
    surface: "",
  });
  const { setDraftBookingId } = useBooking();

  const [isFieldLoading, setIsFieldLoading] = useState(true);
  const [isSearchTimeSlot, setIsSearchTimeSlot] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isJadwalOpened, setIsJadwalOpened] = useState<{
    [key: string]: boolean;
  }>({});

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [fields, setFields] = useState({});

  const datesScroll = [...Array(7)].map((_, idx) => {
    const newDate = new Date();
    newDate.setDate(today.getDate() + idx);
    return newDate;
  });

  useEffect(() => {
    if (!id) return;

    const fetchVenueDetails = async () => {
      const response = await fetch(`/api/venues/${id}`);
      const data = await response.json();
      setVenue(data);
    };

    fetchVenueDetails();
  }, [id]);

  useEffect(() => {
    if (!venue || !selectedDate) return;

    const fetchAllAvailability = async () => {
      setIsSearchTimeSlot(true);
      const formattedDate = formatDate(selectedDate);

      try {
        const results = await Promise.all(
          venue.fields.map(async (field) => {
            const response = await fetch(
              `/api/bookings/availability?date=${formattedDate}&fieldId=${field.id}`
            );
            const data = await response.json();
            return { ...field, slots: data.slots };
          })
        );

        setFields(results);
      } catch (error) {
        console.error("Gagal mengambil semua availability:", error);
      } finally {
        setIsFieldLoading(false);
        setIsSearchTimeSlot(false);
      }
    };

    fetchAllAvailability();
  }, [venue, selectedDate]);

  const filteredFields = Object.values(fields).filter((field) => {
    const matchesType =
      filters.sportType === "" || field.type === filters.sportType;
    return matchesType;
  });

  const toggleJadwal = (id: string) => {
    setIsJadwalOpened((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const handleBooking = async () => {
    if (
      !selectedTime ||
      !selectedTime.id ||
      !selectedDate ||
      !selectedField ||
      !venue
    ) {
      alert("Harap pilih lapangan, tanggal, dan slot waktu terlebih dahulu.");
      return;
    }
  
    try {
      // Siapkan data untuk booking DRAFT
      const bookingData = {
        fieldId: selectedField.id,
        timeSlotId: selectedTime.id,
        date: formatDate(selectedDate),
        status: "DRAFT",
        totalPrice: selectedTime.price + 5000, // Tambahkan biaya transaksi
      };
  
      // Panggil endpoint untuk membuat booking DRAFT
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });
  
      const result = await res.json();
  
      if (!result.success) {
        alert(result.message || "Gagal membuat booking sementara");
        return;
      }
  
      setDraftBookingId(result.booking.id); // Update context bookingId

      // Arahkan ke halaman checkout
      router.push("/checkout");
    } catch (error: any) {
      console.error("Error creating draft booking:", error);
      alert("Terjadi kesalahan saat membuat booking sementara: " + error.message);
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <header className="bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/cari-venue"
              className="text-gray-700 hover:text-green-600 transition cursor-pointer"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">
              Back to Browse Venue
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {!venue ? (
          <>
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {/* Skeleton Loader for Main Image */}
              <div className="relative md:col-span-2 aspect-[5/3] animate-pulse">
                <div className="h-full w-full bg-gray-300 rounded-l-lg"></div>
              </div>

              {/* Skeleton Loader for Thumbnail Images */}
              <div className="hidden md:flex flex-col gap-2 h-full">
                {[0, 1].map((idx) => (
                  <div
                    key={idx}
                    className="relative flex-1 w-full animate-pulse"
                  >
                    <div
                      className={`h-full w-full bg-gray-300 ${
                        idx === 0 ? "rounded-tr-md" : "rounded-br-md"
                      }`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skeleton Loader for Venue Info */}
            <div className="mb-8">
              <h2 className="text-2xl mb-4 font-bold text-gray-800 animate-pulse">
                <div className="h-8 w-32 bg-gray-300 rounded-md"></div>
              </h2>
              <div className="flex items-center text-gray-600 mb-2 animate-pulse">
                <div className="h-5 w-5 bg-gray-300 rounded-full mr-2"></div>
                <div className="h-5 w-32 bg-gray-300 rounded-md"></div>
              </div>

              <div className="border-b border-gray-300 mb-4"></div>

              <p className="text-gray-700 mb-4 h-6 w-72 bg-gray-300 rounded-md animate-pulse"></p>

              {/* Skeleton for Facilities */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-2">
                  <div className="h-6 w-32 bg-gray-300 rounded-md"></div>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[...Array(3)].map((_, idx) => (
                    <div
                      key={idx}
                      className="h-6 w-24 bg-gray-300 rounded-full animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skeleton Loader for Filter Section */}
            <div className="bg-gray-50 rounded-md py-4 animate-pulse">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Skeleton Loader for Sport Type Filter */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="h-12 w-full bg-gray-300 rounded-md"></div>
                  </div>

                  {/* Skeleton Loader for Surface Filter */}
                  <div className="relative flex-1">
                    <div className="h-12 w-full bg-gray-300 rounded-md"></div>
                  </div>

                  {/* Skeleton Loader for Reset Filter Button */}
                  <div className="h-12 w-32 bg-gray-300 rounded-md"></div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {/* Gambar besar di kiri */}
              <div className="relative md:col-span-2 aspect-[5/3]">
                <Image
                  src={venue.imageUrls[0]}
                  alt="Main"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 50vw"
                  className="object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                  onClick={() => {
                    setImageIndex(0);
                    setOpenImage(true);
                  }}
                  priority
                />
              </div>

              {/* Thumbnail kecil di kanan */}
              <div className="hidden md:flex flex-col gap-2 h-full">
                {[0, 1].map((idx) => (
                  <div key={idx} className="relative flex-1 w-full">
                    <Image
                      src={venue.imageUrls[idx + 1]}
                      alt={`Thumbnail ${idx + 2}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 50vw"
                      className={`object-cover cursor-pointer hover:opacity-80 transition ${
                        idx === 0 ? "rounded-tr-md" : "rounded-br-md"
                      }`}
                      onClick={() => {
                        setImageIndex(idx + 1);
                        setOpenImage(true);
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Lightbox */}
              <Lightbox
                open={openImage}
                close={() => setOpenImage(false)}
                index={imageIndex}
                slides={venue.imageUrls.map((img) => ({ src: img }))}
                plugins={[Thumbnails]}
              />
            </div>

            {/* Venue Info */}
            <div className="mb-8">
              <h2 className="text-2xl mb-4 font-bold text-gray-800">
                {venue.name}
              </h2>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin size={18} className="mr-2" />
                <span>{venue.address}</span>
              </div>

              <div className="border- border-gray-300"></div>

              <p className="text-gray-700 mb-4">{venue.description}</p>

              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-2">Fasilitas:</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    Musholla
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    Parkir Motor
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-md py-4 shadow-lg border border-gray-100 my-5">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                  <div className="flex-1 flex flex-row gap-2 w-full">
                    <div className="flex flex-row gap-2 overflow-x-auto scrollbar-hide w-full max-w-full md:max-w-[300px] lg:max-w-[500px] xl:max-w-[750px]">
                      {datesScroll.map((date, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedDate(date)}
                          className={`min-w-[5rem] md:min-w-[6rem] h-16 flex flex-col items-center justify-center rounded-lg cursor-pointer transition ${
                            formatDate(selectedDate) === formatDate(date)
                              ? "bg-green-500 text-white shadow-md"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <div className="text-center">
                            <h1 className="text-base font-semibold">
                              {formatDateToDay(date).split(",")[0]}
                            </h1>
                            <h1 className="text-lg font-semibold">
                              {formatDateToDay(date, { month: "short" })
                                .split(" ")
                                .slice(1, 3)
                                .join(" ")}
                            </h1>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Calendar Icon */}
                    <div className="flex items-center pl-4 border-l border-gray-300">
                      <BookingDatePicker
                        selectedDate={selectedDate}
                        onChange={setSelectedDate}
                        today={today}
                      />
                    </div>
                  </div>

                  {/* Sport Dropdown */}
                  <div className="relative flex-2 w-full md:max-w-[300px]">
                    <SportTypeDropdown
                      filters={filters}
                      setFilters={setFilters}
                    />
                  </div>

                  {/* Reset Filter Button */}
                  <button
                    onClick={() => {
                      setFilters({ sportType: "", surface: "" });
                      setSelectedDate(today);
                    }}
                    className="w-full cursor-pointer md:max-w-[150px] px-4 py-2 justify-center items-center text-white rounded-lg bg-red-500 hover:bg-red-600 transition flex flex-1"
                  >
                    <Search size={18} className="inline mr-2" />
                    Reset Filter
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Lapangan Section */}
        {isFieldLoading ? (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Daftar Lapangan
            </h2>

            {/* Skeleton Loader for Date */}
            <div className="mb-6">
              <p className="h-6 w-40 bg-gray-300 rounded-md animate-pulse"></p>
            </div>

            {/* Skeleton Loader for Fields */}
            <div className="space-y-6">
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden animate-pulse"
                >
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row">
                      {/* Skeleton for Image */}
                      <div className="lg:w-2/6 w-full lg:pr-4 lg:border-r border-b lg:border-b-0 border-gray-300 pb-4 lg:pb-0">
                        <div className="h-50 md:h-80 lg:h-60 bg-gray-300 rounded-lg"></div>
                      </div>

                      {/* Skeleton for Info & Jadwal */}
                      <div className="lg:w-4/6 w-full lg:pl-4 pt-4 lg:pt-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="h-6 w-32 bg-gray-300 rounded-md mb-2"></div>
                            <div className="h-4 w-24 bg-gray-300 rounded-md"></div>
                          </div>
                          <div className="text-right">
                            <div className="h-6 w-16 bg-gray-300 rounded-md mb-2"></div>
                            <div className="h-4 w-20 bg-gray-300 rounded-md"></div>
                          </div>
                        </div>

                        <div className="h-4 w-64 bg-gray-300 rounded-md mt-2"></div>

                        {/* Skeleton for Jadwal Button */}
                        <div className="p-4 bg-gray-50 mt-4">
                          <button className="w-full md:w-40 md:h-10 h-12 bg-gray-300 rounded-lg animate-pulse"></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Daftar Lapangan
            </h2>

            <div className="mb-6">
              <p className="text-gray-700 font-bold text-lg mb-4">
                {formatDateToDay(selectedDate)}
              </p>
            </div>

            <div className="space-y-6">
              {filteredFields.length === 0 && (
                <p className="text-gray-500 italic">
                  Venue ini belum memiliki cabor yang Anda pilih.
                </p>
              )}
              {filteredFields.map((field: any) => {
                const processedSlots = field.slots.map((slot: TimeSlot) => {
                  const slotStartTimeToday = new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate(),
                    parseInt(slot.startTime.split(":")[0]),
                    parseInt(slot.startTime.split(":")[1])
                  );
                  const isSlotPast = today > slotStartTimeToday;
                  const isSlotAvailable =
                    slot.status === "AVAILABLE" && !isSlotPast;
                  const duration = calculateDuration(
                    slot.startTime,
                    slot.endTime
                  );

                  return {
                    ...slot,
                    isSlotAvailable,
                    duration,
                  };
                });

                const availableCount = processedSlots.filter(
                  (slot) => slot.isSlotAvailable
                ).length;

                let priceRange: string;
                if (field.slots.length === 0) {
                  priceRange = "Tidak Tersedia";
                } else {
                  const prices = field.slots.map(
                    (slot: TimeSlot) => slot.price
                  );
                  // Mendapatkan harga minimum dan maksimum
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);

                  // Format rentang harga
                  priceRange =
                    minPrice === maxPrice
                      ? `Rp ${minPrice.toLocaleString()}`
                      : `Rp ${minPrice.toLocaleString()} - Rp ${maxPrice.toLocaleString()}`;
                }

                return (
                  <div
                    key={field.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex flex-col lg:flex-row">
                        {/* Gambar */}
                        <div className="lg:w-2/6 w-full lg:pr-4 lg:border-r border-b lg:border-b-0 border-gray-300 pb-4 lg:pb-0">
                          <Image
                            src={field.imageUrls[0]}
                            alt={field.name}
                            width={800}
                            height={600}
                            className="rounded-lg object-cover w-full h-auto"
                          />
                        </div>

                        {/* Info & Jadwal */}
                        <div className="lg:w-4/6 w-full lg:pl-4 pt-4 lg:pt-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-base lg:text-xl text-gray-800">
                                {field.name}
                              </h3>
                              <p className="text-gray-600 text-sm lg:text-base">
                                {field.type} • {field.surface}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="block text-green-700 font-bold text-sm lg:text-base">
                                {priceRange}
                              </span>
                            </div>
                          </div>

                          <p className="text-gray-700 mt-2 text-sm lg:text-base">
                            {field.description}
                          </p>

                          {/* Jadwal */}
                          <div className="p-4 bg-gray-50 mt-4 ">
                            <button onClick={() => toggleJadwal(field.id)}>
                              <div className="bg-green-500 hover:bg-green-600 transition cursor-pointer text-white font-semibold py-2 px-3 rounded-lg text-sm md:text-base flex items-center justify-between">
                                {isSearchTimeSlot ? (
                                  <div className="flex justify-center w-full">
                                    <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent" />
                                  </div>
                                ) : (
                                  <>
                                    {availableCount} jadwal tersedia
                                    <ChevronDownCircle
                                      className={`ml-2 transition-transform duration-300 ${
                                        isJadwalOpened[field.id]
                                          ? "rotate-180"
                                          : "rotate-0"
                                      }`}
                                      size={18}
                                    />
                                  </>
                                )}
                              </div>
                            </button>
                            <AnimatePresence initial={false}>
                              {isJadwalOpened[field.id] && (
                                <motion.div
                                  key="jadwal"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    ease: "easeInOut",
                                  }}
                                  className="overflow-hidden mt-4"
                                >
                                  {processedSlots.length === 0 && (
                                    <p className="mt-4 text-gray-600 text-sm md:text-base">
                                      Tidak ada jadwal tersedia.
                                    </p>
                                  )}
                                  <div className="grid grid-cols-2 mt-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                    {isSearchTimeSlot ? (
                                      <div className="flex justify-center w-full mt-4">
                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                                      </div>
                                    ) : (
                                      <>
                                        {processedSlots.map((slot) => (
                                          <button
                                            key={slot.id}
                                            className={`py-2 px-3 cursor-pointer rounded-lg text-center text-xs sm:text-sm font-medium ${
                                              slot.isSlotAvailable
                                                ? selectedTime?.startTime ===
                                                    slot.startTime &&
                                                  selectedField?.id === field.id
                                                  ? "bg-green-600 text-white"
                                                  : "transition bg-white border border-gray-200 text-gray-700 hover:bg-green-500 hover:border-gray-400 hover:text-white"
                                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            }`}
                                            disabled={!slot.isSlotAvailable}
                                            onClick={() => {
                                              setSelectedField(field);
                                              setSelectedTime(slot);
                                              if (!isSidebarOpen) {
                                                setIsSidebarOpen(true);
                                              }
                                            }}
                                          >
                                            <div className="font-medium text-xs sm:text-sm">
                                              <div className="flex items-center justify-center gap-1">
                                                <Clock size={12} />{" "}
                                                {slot.duration} Menit
                                              </div>
                                            </div>
                                            <div className="font-bold text-sm sm:text-lg">
                                              {slot.startTime} - {slot.endTime}
                                            </div>
                                            <div className="font-semibold text-sm sm:text-base">
                                              {slot.status !== "AVAILABLE"
                                                ? "Booked"
                                                : formatCurrency(slot.price)}
                                            </div>
                                          </button>
                                        ))}
                                      </>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedTime && (
          <button
            className={`fixed cursor-pointer hidden lg:block bottom-5 transition-all duration-300 p-3 bg-green-500 text-white rounded-full shadow-lg z-50 
            ${
              isSidebarOpen
                ? "right-[calc(33.3333%+1.25rem)] xl:right-[calc(25%+1.25rem)] 2xl:right-[calc(16.6667%+1.25rem)]"
                : "right-5"
            }
          `}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? "Tutup" : "Buka"} Booking Info
          </button>
        )}

        {/* Booking Button */}
        {selectedTime && selectedField && (
          <div
            className={`fixed bottom-0 left-0 lg:left-auto right-0 bg-white shadow-lg py-4 px-6 border-t border-gray-200 lg:w-1/3 xl:w-1/4 2xl:w-1/6 lg:h-full lg:flex lg:items-end lg:justify-end transition-transform duration-300 ease-in-out ${
              isSidebarOpen
                ? "transform translate-x-0"
                : "transform translate-x-full"
            }`}
          >
            <div className="container mx-auto max-w-4xl px-4 lg:px-0 lg:w-full">
              <div className="flex mb-2 flex-row items-end justify-between">
                <div className="lg:w-2/3">
                  <h4 className="font-semibold text-gray-800 text-lg lg:text-xl">
                    {selectedField.name}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {formatDateToDay(selectedDate)} • {selectedTime.startTime} -{" "}
                    {selectedTime.endTime}
                  </p>
                </div>
                <div className="lg:w-1/3 text-right">
                  <span className="font-bold text-green-700 text-xl">
                    Rp {selectedTime.price.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <button
                onClick={handleBooking}
                className="w-full py-3 cursor-pointer bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition duration-300"
              >
                Lanjutkan Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
