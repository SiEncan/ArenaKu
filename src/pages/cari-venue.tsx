import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FieldSummary } from "@/types/field";
import { Venue } from "@/types/venue";
import MainLayout from "@/components/layouts/MainLayout";
import Image from "next/image";

const BookingLapangan = () => {
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    const fetchVenues = async () => {
      const response = await fetch("/api/venues");
      const data = await response.json();
      setVenues(data);
    };

    fetchVenues();
  }, []);

  return (
    <MainLayout>
      <section className="py-20 bg-gradient-to-br from-green-400 to-green-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Temukan dan Booking Lapangan Olahraga Favoritmu</h2>
          <p className="text-lg text-white mb-8">ArenaKu memudahkan kamu untuk cari, lihat jadwal, dan booking lapangan dengan cepat.</p>
          <a href="#booking" className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition">
            Mulai Booking Sekarang
          </a>
        </div>
      </section>

      <section id="features" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Daftar Venue</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.length === 0 ? 
                <>
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition duration-200 animate-pulse"
                    >
                      {/* Skeleton for Image */}
                      <div className="overflow-hidden rounded-t-2xl">
                        <div className="h-48 w-full bg-gray-300 rounded-t-2xl"></div>
                      </div>
                
                      {/* Skeleton for Content */}
                      <div className="p-4">
                        {/* Skeleton for Venue Name */}
                        <div className="h-6 w-3/4 bg-gray-300 rounded-md mb-4"></div>
                
                        {/* Skeleton for Venue Address */}
                        <div className="h-4 w-1/2 bg-gray-300 rounded-md mb-2"></div>
                
                        {/* Skeleton for Field Types */}
                        <div className="space-y-2 mb-4">
                          {[...Array(2)].map((_, index) => (
                            <div key={index} className="flex items-center">
                              <div className="h-4 w-32 bg-gray-300 rounded-md mr-2"></div>
                              <div className="h-4 w-12 bg-gray-300 rounded-md"></div>
                            </div>
                          ))}
                        </div>
                
                        {/* Skeleton for Description */}
                        <div className="h-6 w-3/4 bg-gray-300 rounded-md mb-4"></div>
                
                        {/* Skeleton for Field Types and Pricing */}
                        <div className="mt-3 space-y-1 shadow-sm rounded-lg p-2">
                          {[...Array(2)].map((_, index) => (
                            <div key={index} className="h-6 w-full bg-gray-300 rounded-md mb-2"></div>
                          ))}
                        </div>
                
                        {/* Skeleton for "Lihat Detail" Link */}
                        <div className="h-4 w-32 bg-gray-300 rounded-md mt-4"></div>
                      </div>
                    </div>
                  ))}
                </>
              :
                <>
                  {venues.map((venue) => (
                    <Link
                      href={`/venue/${venue.id}`}
                      key={venue.id}
                      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition duration-200"
                    >
                      {/* Gambar */}
                      <div className="overflow-hidden rounded-t-2xl">
                        <Image
                          src={venue.imageUrls[0]}
                          width={500}
                          height={500}
                          alt={venue.name}
                          className="transform hover:scale-110 transition duration-300"
                        />
                      </div>

                      {/* Konten */}
                      <div className="p-4">
                        <h2 className="font-bold text-2xl text-gray-800">{venue.name}</h2>
                        <p className="font-medium text-gray-800">Kota {venue.address}</p>

                        {venue.fieldTypes.map((field, index) => (
                          <div
                            key={field.type}
                            className="text-sm text-gray-700 flex inline-block"
                          >
                            <span className="font-medium">{field.type}</span>
                            {index < venue.fieldTypes.length - 1 && (
                              <span className="mx-2 text-black font-black">·</span>
                            )}
                          </div>
                        ))}

                        <p className="my-2 text-sm text-gray-600 line-clamp-2">{venue.description}</p>

                        {/* Jenis Lapangan dan Harga Terendah */}
                        <div className="mt-3 space-y-1 shadow-sm rouded-lg p-2 rounded">
                          {venue.fieldTypes.map((field : FieldSummary) => (
                            <div key={field.type} className="text-sm text-gray-700">
                              <span className="font-bold text-base">{field.type}</span> mulai dari{" "}
                              <span className="text-gray-800 text-xl font-bold">
                                Rp{field.minPrice.toLocaleString("id-ID")}
                              </span>{" "}
                              /sesi
                            </div>
                          ))}
                        </div>
                        <h1
                          className="inline-block text-sm text-blue-600 hover:underline mt-2"
                        >
                          Lihat Detail →
                        </h1>
                      </div>
                    </Link>
                  ))}
                </>
              }
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default BookingLapangan;