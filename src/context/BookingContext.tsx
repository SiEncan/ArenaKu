// BookingContext.tsx
import { createContext, useContext, useState, useEffect } from "react";

interface BookingContextType {
  draftBookingId: string | null;
  setDraftBookingId: (id: string) => void;
  clearDraftBookingId: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [draftBookingId, setDraftBookingIdState] = useState<string | null>(null);

  useEffect(() => {
    // Ambil draftBookingId dan createdAt dari localStorage saat aplikasi dimuat
    const storedBooking = localStorage.getItem("draftBooking");
    if (storedBooking) {
      const { id, createdAt } = JSON.parse(storedBooking);
      const now = Date.now();
      const expirationTime = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

      // Jika draftBookingId sudah kadaluarsa, hapus
      if (now - createdAt > expirationTime) {
        localStorage.removeItem("draftBooking");
      } else {
        setDraftBookingIdState(id);
      }
    }
  }, []);

  const setDraftBookingId = (id: string) => {
    setDraftBookingIdState(id);
    // Simpan draftBookingId beserta timestamp
    localStorage.setItem("draftBooking", JSON.stringify({ id, createdAt: Date.now() }));
  };

  const clearDraftBookingId = () => {
    setDraftBookingIdState(null);
    localStorage.removeItem("draftBooking");
  };

  return (
    <BookingContext.Provider value={{ draftBookingId, setDraftBookingId, clearDraftBookingId }}>
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