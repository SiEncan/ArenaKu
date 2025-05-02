import SideBar from "@/components/layouts/sidebar";
import SlotManagement from "@/components/SlotManagement";
import { Field } from "@/types/field";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const fieldTypes = [
  "Futsal",
  "Mini Soccer",
  "Badminton",
  "Basketball",
  "Tennis",
  "Volley",
  "Padel",
];

export default function EditLapanganPage() {
  const router = useRouter();
  const { id } = router.query;

  const [field, setField] = useState<Field | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [surface, setSurface] = useState("");
  const [timeSlots, setTimeSlots] = useState<Field['timeSlots']>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetch(`/api/fields/${id}`)
        .then((res) => res.json())
        .then((data: Field) => {
          setField(data);
          setName(data.name);
          setDescription(data.description);
          setType(data.type || "");
          setSurface(data.surface || "");
          setTimeSlots(data.timeSlots || []);
          setImageUrls(data.imageUrls || []);
        });
    }
  }, [id]);

  const handleImageChange = (index: number, value: string) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };
  
  const addImage = () => {
    setImageUrls([...imageUrls, ""]);
  };
  
  const removeImage = (index: number) => {
    const updated = [...imageUrls];
    updated.splice(index, 1);
    setImageUrls(updated);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const updatedData = { name, description, type, surface, timeSlots };

    const res = await fetch(`/api/fields/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });

    if (res.ok) {
      alert("Lapangan berhasil diperbarui!");
      router.push("/owner/kelola-venue");
    } else {
      alert("Gagal memperbarui lapangan.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideBar />
        {!field ? (
          <div className="flex justify-center items-center w-full"> {/* Wrapper untuk center */}
            <div className="flex justify-center w-full h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-start w-full"> {/* Wrapper untuk center dan mulai dr atas */}
            <div className="w-full max-w-7xl overflow-auto px-8 py-8 bg-white shadow-lg rounded-lg mx-8 my-8">
              <h1 className="text-2xl font-bold mb-6 text-black">Edit Lapangan</h1>
              <form onSubmit={handleSubmit} className="space-y-6 overflow-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="pr-0 lg:pr-6 space-y-3">
                    {/* Gambar */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Gambar Lapangan</label>
                      {imageUrls.map((url, index) => (
                        <div key={index} className="flex items-center gap-4 mb-2">
                          {url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={url}
                              alt={`Preview ${index}`}
                              className="w-1/3 object-cover rounded"
                            />
                          )}
                          <input
                            type="text"
                            className="w-full border px-3 py-2 rounded text-gray-800"
                            value={url}
                            onChange={(e) => handleImageChange(index, e.target.value)}
                            placeholder="Link gambar (URL)"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Hapus
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addImage}
                        className="mt-2 text-sm text-blue-600 hover:underline"
                      >
                        + Tambah Gambar
                      </button>
                    </div>

                    {/* Nama Lapangan */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Nama Lapangan</label>
                      <input
                        type="text"
                        className="w-full border px-3 py-2 rounded text-gray-800"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    {/* Deskripsi Lapangan */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Deskripsi</label>
                      <textarea
                        className="w-full border px-3 py-2 rounded text-gray-800"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        placeholder="Masukkan deskripsi lapangan..."
                      />
                    </div>

                    {/* Jenis */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Jenis</label>
                      <select
                        className="w-full border px-3 py-2 rounded text-gray-800"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                      >
                        <option value="">Pilih Jenis</option>
                        {fieldTypes.map((ftype) => (
                          <option key={ftype} value={ftype}>
                            {ftype}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Permukaan */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Permukaan</label>
                      <input
                        type="text"
                        className="w-full border px-3 py-2 rounded text-gray-800"
                        value={surface}
                        onChange={(e) => setSurface(e.target.value)}
                      />
                    </div>

                    
                  </div>
                  <div className="mt-6 lg:mt-0 lg:pl-6 lg:border-l lg:border-gray-300">
                    <SlotManagement timeSlots={timeSlots} setTimeSlots={setTimeSlots} />
                  </div>
                  
                </div>
                <div className="space-x-4">
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 transition duration-100 text-white px-6 py-2 rounded"
                    >
                    Simpan Perubahan
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="bg-red-500 hover:bg-red-700 transition duration-100 text-white px-6 py-2 rounded"
                    >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}