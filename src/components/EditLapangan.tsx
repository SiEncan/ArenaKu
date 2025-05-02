// components/EditLapangan.tsx
import { Dialog } from "@headlessui/react";
import React, { useState } from "react";

const fieldTypes = [
  "Futsal",
  "Mini Soccer",
  "Badminton",
  "Basketball",
  "Tennis",
  "Volley",
  "Padel",
];

type Field = {
  id: string;
  name: string;
  description: string;
  type: string;
  surface: string;
  imageUrls: string[];
  timeSlots: { startTime: string; endTime: string; price: number }[];
};
interface EditLapanganProps {
  field: Field;
  onSubmit: (updatedField: Field) => void;
}

export default function EditLapangan({ field, onSubmit }: EditLapanganProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(field.name);
  const [type, setType] = useState(field.type || "");
  const [surface, setSurface] = useState(field.surface || "");
  const [timeSlots, setTimeSlots] = useState(
    field.timeSlots || [{ startTime: "", endTime: "", price: 0 }]
  );

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = { ...field, name, type, surface, timeSlots };
    onSubmit(updatedData);
    handleClose();
  };  

  // Reset form saat dialog dibuka
  React.useEffect(() => {
    if (isOpen) {
      setName(field.name);
      setType(field.type || "");
      setSurface(field.surface || "");
      setTimeSlots(field.timeSlots || []);
    }
  }, [isOpen, field]);

  const handleSlotChange = (
    index: number,
    key: "startTime" | "endTime" | "price",
    value: string | number
  ) => {
    const updatedSlots = [...timeSlots];
    updatedSlots[index][key] = value;
    setTimeSlots(updatedSlots);
  };
  
  const handleAddSlot = () => {
    setTimeSlots([
      ...timeSlots,
      { startTime: "", endTime: "", price: 0 }
    ]);
  };
  
  const handleRemoveSlot = (index: number) => {
    const updatedSlots = [...timeSlots];
    updatedSlots.splice(index, 1);
    setTimeSlots(updatedSlots);
  };  

  return (
    <>
      <button
        onClick={handleOpen}
        className="mt-2 px-4 py-2 text-sm text-white bg-orange-500 rounded hover:bg-orange-700 transition-all transition-200"
      >
        Edit Lapangan
      </button>

      <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded bg-white p-6 shadow-xl">
            <Dialog.Title className="text-lg font-bold mb-4 text-black">Edit Lapangan</Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black">Nama Lapangan</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 border px-3 py-2 rounded border-gray-200 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black">Jenis</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full mt-1 border px-3 py-2 rounded border-gray-200 text-gray-900"
                >
                {fieldTypes.map((typeOption, index) => (
                  <option key={index} value={typeOption}>
                    {typeOption}
                  </option>
                ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black">Permukaan</label>
                <input
                  type="text"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  className="w-full mt-1 border px-3 py-2 rounded border-gray-200 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-black">Slot Waktu</label>
                {timeSlots.map((slot, index) => (
                  <div key={index} className="flex gap-2 items-center mb-2">
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) =>
                        handleSlotChange(index, "startTime", e.target.value)
                      }
                      className="w-1/3 border px-2 py-1 rounded border-gray-200 placeholder-gray-400 text-gray-900"
                      required
                    />
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) =>
                        handleSlotChange(index, "endTime", e.target.value)
                      }
                      className="w-1/3 border px-2 py-1 rounded border-gray-200 placeholder-gray-400 text-gray-900"
                      required
                    />
                    <input
                      type="number"
                      value={slot.price}
                      onChange={(e) =>
                        handleSlotChange(index, "price", parseInt(e.target.value) || 0)
                      }
                      className="w-1/4 border px-2 py-1 rounded border-gray-200 placeholder-gray-400 text-gray-900"
                      placeholder="Harga"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(index)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      ❌
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="text-sm text-blue-600 hover:underline mt-2"
                >
                  + Tambah Slot
                </button>
              </div>


              <div className="text-right pt-2">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 rounded border"
                  onClick={handleClose}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
