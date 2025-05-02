import { useEffect, useState } from "react";
import SideBar from "@/components/layouts/sidebar";
import { requireOwnerRole } from "@/lib/requireOwnerRole";
import { GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import TambahLapangan from "@/components/TambahLapangan";
import { Venue } from "@/types/venue";
import { Field } from "@/types/field";
import Link from "next/link";
import Image from 'next/image';
import { formatCurrency } from "@/utils/formatCurrency";

function KelolaVenue() {
  const { data: session } = useSession(); // Mengambil data session
  const [isModalOpen, setIsModalOpen] = useState(false);


  const [venueData, setVenueData] = useState({
    name: "",
    address: "",
    description: "",
    imageUrls: [""],
  })

  const [venues, setVenues] = useState<Venue[]>([]);
  const [expandedVenueId, setExpandedVenueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index?: number) => {
    const { name, value } = e.target;
    if (name === "imageUrls" && typeof index === "number") {
      const newImages = [...venueData.imageUrls];
      newImages[index] = value;
      setVenueData({ ...venueData, imageUrls: newImages });
    } else {
      setVenueData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addImageField = () => {
    setVenueData((prev) => ({
      ...prev,
      imageUrls: [...prev.imageUrls, ""],
    }));
  };

  const removeImageField = (index: number) => {
    const newImages = [...venueData.imageUrls];
    newImages.splice(index, 1);
    setVenueData((prev) => ({
      ...prev,
      imageUrls: newImages,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      alert("Anda harus login terlebih dahulu!");
      return;
    }

    try {
      const res = await fetch("/api/venues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...venueData,
          ownerId: session.user.id, // Menambahkan ownerId dari session
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambahkan venue");

      setVenueData({ name: "", address: "", description: "", imageUrls: [""] });
      setIsModalOpen(false);
      alert("Venue berhasil ditambahkan!");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddLapangan = async (fieldData: Field, venueId: string) => {

    const data = {
      name: fieldData.name,
      description: fieldData.description,
      type: fieldData.type,
      surface: fieldData.surface,
      imageUrls: fieldData.imageUrls,
      venueId: venueId,  // venueId disertakan di sini
      timeSlots: fieldData.timeSlots,
    };

    try {
      const response = await fetch("/api/fields", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Lapangan berhasil ditambahkan:", result);
      } else {
        console.error("Gagal menambahkan lapangan:", result.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await fetch("/api/venues/owned");
        const data = await res.json();
        setVenues(data.venues);
        console.log(data.venues)
      } catch (err) {
        console.error("Gagal fetch venue", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  const toggleExpanded = (venueId: string) => {
    setExpandedVenueId((prev) => (prev === venueId ? null : venueId));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SideBar />
      <div className="flex-1 p-8 bg-white m-8 shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4 text-black">Kelola Venue</h1>
        {/* Tombol Tambah Venue */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Tambah Venue
        </button>

        {/* Floating Form */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-green-600 p-6 rounded-lg w-full max-w-md shadow-lg relative backdrop-blur-md">
              <h2 className="text-xl font-bold mb-4">Tambah Venue</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1">Nama Venue</label>
                  <input
                    type="text"
                    name="name"
                    value={venueData.name}
                    onChange={handleChange}
                    required
                    className="w-full border px-4 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Alamat</label>
                  <input
                    type="text"
                    name="address"
                    value={venueData.address}
                    onChange={handleChange}
                    required
                    className="w-full border px-4 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Deskripsi</label>
                  <textarea
                    name="description"
                    value={venueData.description}
                    onChange={handleChange}
                    className="w-full border px-4 py-2 rounded"
                  />
                </div>

                {/* Image URLs Input */}
                <div>
                  <label className="block mb-1">Image URLs</label>
                  {venueData.imageUrls.map((url, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        name="imageUrls"
                        value={url}
                        onChange={(e) => handleChange(e, index)}
                        className="w-full border px-4 py-2 rounded"
                        placeholder="https://example.com/image.jpg"
                      />
                      {venueData.imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="px-2 text-red-500"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageField}
                    className="text-sm text-blue-600 mt-1"
                  >
                    + Tambah Gambar
                  </button>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Simpan
                  </button>
                </div>
              </form>

              {/* Close Icon (X) */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <p className="mb-4 text-gray-600 mt-2 font-semibold">Lihat dan kelola venue serta lapangan yang kamu miliki.</p>

        {loading ? (
          <p>Memuat data...</p>
        ) : venues.length === 0 ? (
          <p>Belum ada venue. Tambahkan venue terlebih dahulu.</p>
        ) : (
          venues.map((venue) => (
            <div key={venue.id} className="border-2 rounded-lg shadow-lg mb-6 p-4">
              <h2 className="text-xl font-semibold text-black">{venue.name}</h2>
              <p className="text-gray-800">{venue.description}</p>
              <p className="text-gray-400 text-sm">📍 {venue.address}</p>

              {/* Gambar Venue */}
              {venue.imageUrls.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <div className="flex space-x-4">
                    {venue.imageUrls.map((url, idx) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={idx}
                        src={url}
                        alt={`Venue image ${idx + 1}`}
                        className="h-40 w-64 object-cover rounded-lg shadow-md"
                      />
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => toggleExpanded(venue.id)}
                className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                {expandedVenueId === venue.id ? "Sembunyikan Lapangan" : "Lihat Lapangan"}
              </button>

              {/* Tombol Tambah Lapangan */}
              <TambahLapangan
                onSubmit={(fieldData: Field) => handleAddLapangan(fieldData, venue.id)} // Memanggil handleAddLapangan ketika menambah lapangan
              />
              {expandedVenueId === venue.id && (
                <div className="mt-4 space-y-6">
                {venue.fields.length === 0 ? (
                  <p className="text-gray-400">Belum ada lapangan di venue ini.</p>
                ) : (
                  venue.fields.map((field) => (
                    <div key={field.id} className="border rounded-xl p-4 shadow flex gap-4">
                      {/* Gambar di kiri */}
                      {field.imageUrls && field.imageUrls.length > 0 && (
                        <div className="w-1/5">
                          {field.imageUrls.map((url, index) => (
                            <Image
                              key={index}
                              src={url}
                              width={400}
                              height={200}
                              className="h-full w-full object-cover rounded-lg shadow"
                              alt={field.name}
                            />
                          ))}
                        </div>
                      )}
              
                      {/* Informasi di kanan */}
                      <div className="flex-1 flex flex-col">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{field.name}</h3>
                          <p className="text-sm text-gray-700 mt-1">Jenis: {field.type}</p>
                          {field.surface && (
                            <p className="text-sm text-gray-600">Permukaan: {field.surface}</p>
                          )}
                        </div>
              
                        {/* Slot Waktu */}
                        <div className="mt-4 flex flex-wrap gap-3">
                          {field.timeSlots.map((slot, index) => (
                            <div
                              key={index}
                              className="w-32 p-3 rounded-lg text-center border bg-white border-gray-300 text-gray-700 hover:shadow"
                              >
                              <div className="text-sm font-medium">
                                {slot.startTime} - {slot.endTime}
                              </div>
                              <div className="text-base mt-1 font-semibold">
                                {formatCurrency(slot.price)}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Tombol Edit Kecil */}
                        <div className="mt-4 text-right">
                          <Link href={`/owner/edit-lapangan/${field.id}`}>
                            <button
                              className="mt-2 px-4 py-2 text-sm text-white bg-orange-500 rounded hover:bg-orange-700 transition-all transition-200"
                            >
                              Edit Lapangan
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>  
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session || session.user.role !== "OWNER") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default requireOwnerRole(KelolaVenue);