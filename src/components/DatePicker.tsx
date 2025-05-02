import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { CalendarDays } from "lucide-react";

export default function BookingDatePicker(props: { selectedDate: Date; onChange: (date: Date) => void; today: Date }) {
  const { selectedDate, onChange, today } = props;
  const [open, setOpen] = useState(false);
  const [displayedMonth, setDisplayedMonth] = useState(selectedDate);
  const buttonRef = useRef(null);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);

  useEffect(() => {
    if (selectedDate) {
      setDisplayedMonth(selectedDate);
    }
  }, [selectedDate]);

  return (
    <div className="relative inline-block text-left">
      {/* Tombol Calendar */}
      <div className="flex items-center">
        <button
          ref={buttonRef}
          onClick={() => setOpen(!open)}
          className="p-2 rounded hover:bg-gray-100 transition cursor-pointer"
        >
          <CalendarDays size={28} className="text-gray-600" />
        </button>
      </div>

      {/* Floating DayPicker */}
      {open && (
        <div className="items-end font-semibold flex flex-col sm:absolute z-10 mt-2 sm:left-1/2 sm:-translate-x-1/2 bg-white rounded-lg shadow-lg p-4">
          <DayPicker
            disabled={{ before: today, after: maxDate }}
            mode="single"
            required
            selected={selectedDate ? new Date(selectedDate) : today}
            onSelect={(newDate: Date) => {
              onChange(newDate);
            }}
            month={displayedMonth}
            onMonthChange={setDisplayedMonth}  
            modifiersClassNames={{
              selected: "bg-green-500 text-white rounded-md",
              today: "text-green-500 font-bold",
            }}
          />
          <button
            onClick={() => setOpen(false)}
            className="bg-green-500 hover:bg-green-600 transition cursor-pointer text-white font-bold rounded-md px-4 py-2"
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
}
