import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface BookingContextType {
  draftBookingId: string | null;
  setDraftBookingId: (id: string | null) => void;
  clearDraftBookingId: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  // Inisialisasi draftBookingId dari localStorage
  const [draftBookingId, setDraftBookingId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("draftBookingId") || null;
    }
    return null;
  });

  // Simpan draftBookingId ke localStorage setiap kali berubah
  useEffect(() => {
    if (draftBookingId) {
      localStorage.setItem("draftBookingId", draftBookingId);
    } else {
      localStorage.removeItem("draftBookingId");
    }
  }, [draftBookingId]);

  const clearDraftBookingId = () => {
    setDraftBookingId(null);
  };

  return (
    <BookingContext.Provider
      value={{ draftBookingId, setDraftBookingId, clearDraftBookingId }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};