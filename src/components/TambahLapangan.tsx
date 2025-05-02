import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Field } from "@/types/field";

const fieldTypes = [
  "Futsal",
  "Mini Soccer",
  "Badminton",
  "Basketball",
  "Tennis",
  "Volley",
  "Padel",
];

export default function TambahLapangan({ onSubmit }: { onSubmit: (fieldData: Field) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [fieldData, setFieldData] = useState<Field>({
    name: "",
    description: "",
    type: "Futsal",
    surface: "",
    imageUrls: [""],
    timeSlots: [],
  });

  const addTimeSlot = () => {
    setFieldData((prev) => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { startTime: "", endTime: "", price: 0 }],
    }));
  };

  const removeSlotByIndex = (index: number) => {
    const updatedSlots = [...fieldData.timeSlots];
    updatedSlots.splice(index, 1);
    setFieldData({ ...fieldData, timeSlots: updatedSlots });
  };  

  const handleSlotChange = (
    index: number,
    field: "startTime" | "endTime" | "price",
    value: string
  ) => {
    const updated = [...fieldData.timeSlots];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[index] as any)[field] = value;
    if (field === "price") {
      updated[index][field] = parseInt(value, 10); // pastikan price jadi number
    } else {
      updated[index][field] = value;
    }
    setFieldData({ ...fieldData, timeSlots: updated });
  };

  const handleSubmit = () => {
    if (!fieldData.name || !fieldData.description || !fieldData.surface || fieldData.timeSlots.length === 0) {
      alert("Harap lengkapi semua field.");
      return;
    }
    onSubmit(fieldData);
    setIsOpen(false);
    setFieldData({
      name: "",
      description: "",
      type: "Futsal",
      surface: "",
      imageUrls: [""],
      timeSlots: [],
    });
  };
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-3 ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Tambah Lapangan
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg max-w-xl w-full p-6 shadow-lg overflow-y-auto max-h-[90vh]">
            <Dialog.Title className="text-lg text-gray-700 font-bold mb-4">Tambah Lapangan</Dialog.Title>

            <input
              type="text"
              placeholder="Nama Lapangan"
              value={fieldData.name}
              onChange={(e) => setFieldData({ ...fieldData, name: e.target.value })}
              className="w-full border border-gray-200 p-2 mb-2 rounded placeholder-gray-400 text-gray-900"
            />
            <textarea
              placeholder="Deskripsi"
              value={fieldData.description}
              onChange={(e) => setFieldData({ ...fieldData, description: e.target.value })}
              className="w-full border border-gray-200 p-2 mb-2 rounded placeholder-gray-400 text-gray-900"
            />
            <select
              value={fieldData.type}
              onChange={(e) => setFieldData({ ...fieldData, type: e.target.value })}
              className="w-full border border-gray-200 p-2 mb-2 rounded placeholder-gray-400 text-gray-900"
            >
              {fieldTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Permukaan"
              value={fieldData.surface}
              onChange={(e) => setFieldData({ ...fieldData, surface: e.target.value })}
              className="w-full border border-gray-200 p-2 mb-2 rounded placeholder-gray-400 text-gray-900"
            />
            <input
              type="text"
              placeholder="URL Gambar (pisahkan dengan koma)"
              value={fieldData.imageUrls.join(",")}
              onChange={(e) => setFieldData({ ...fieldData, imageUrls: e.target.value.split(",") })}
              className="w-full border border-gray-200 p-2 mb-2 rounded placeholder-gray-400 text-gray-900"
            />

            <div className="mb-2">
              <h3 className="font-semibold mb-1 text-gray-700">Isi Jadwal:</h3>
              {fieldData.timeSlots.map((slot, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => handleSlotChange(i, "startTime", e.target.value)}
                    className="border p-1 rounded w-1/3 border-gray-200 placeholder-gray-400 text-gray-900"
                  />
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => handleSlotChange(i, "endTime", e.target.value)}
                    className="border p-1 rounded w-1/3 border-gray-200 placeholder-gray-400 text-gray-900"
                  />
                  <input
                    type="number"
                    placeholder="Harga"
                    value={slot.price}
                    onChange={(e) => handleSlotChange(i, "price", e.target.value)}
                    className="border p-1 rounded w-1/3 border-gray-200 placeholder-gray-400 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => removeSlotByIndex(i)}
                    className="text-red-500 hover:text-red-700 text-sm ml-1"
                    title="Hapus Slot"
                  >
                    ❌
                  </button>
                </div>
              ))}
              <button
                onClick={addTimeSlot}
                className="text-sm text-blue-600 hover:underline"
              >
                + Tambah Jadwal
              </button>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
