import Image from 'next/image';
import { MapPin } from "lucide-react";
import Link from 'next/link';
import MainLayout from '@/components/layouts/MainLayout';

export default function Home() {
  return (
    <MainLayout>
      <section className="text-white py-20 bg-gradient-to-br from-green-400 to-green-700">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Booking Lapangan Olahraga Jadi Lebih Mudah</h1>
              <p className="text-xl mb-8">Temukan dan pesan lapangan dari berbagai venue terbaik di satu platform</p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link className="px-6 py-3 bg-white text-green-500 font-bold rounded-lg hover:bg-gray-100 transition text-center" href={'/cari-venue'}>
                  Cari Lapangan
                </Link>
                <a href="#" className="px-6 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white transition hover:text-green-500 text-center">Daftarkan Lapangan!</a>
              </div>
            </div>
            <div className="md:w-1/2">
              <Image src="https://cdn.rri.co.id/berita/Purwokerto/o/1724229043991-A24P0825/gxl4424bu8jw00y.jpeg" alt="Lapangan olahraga" className="rounded-xl shadow-xl" width={600} height={400} loading="lazy"></Image>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Temukan Venue Terbaik</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Jelajahi berbagai pilihan venue dengan fasilitas terbaik di kota Anda</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="venue-card bg-white rounded-xl shadow-md overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(46,204,113,0.2)]">
              <div className="relative w-full h-48">
                <Image
                  src="https://asset.ayo.co.id/image/venue/172009282780127.image_cropper_0F59B8B3-B7A9-44D0-9B44-146AD110E7C6-2736-000002E04E0B4B13_large.jpg"
                  alt="Venue Sport Center"
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">Sport Center Jakarta</h3>
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Futsal</span>
                </div>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="mr-2 w-5 h-5 text-gray-600" />
                  <span>Jakarta Selatan</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-500 line-through">Rp150.000</span>
                    <span className="text-green-600 font-bold ml-2">Rp120.000/jam</span>
                  </div>
                  <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Lihat Detail</a>
                </div>
              </div>
              </div>
              
              <div className="venue-card bg-white rounded-xl shadow-md overflow-hidden transition duration-300">
                <div className="relative w-full h-48">
                  <Image
                    src="https://asset.ayo.co.id/image/venue/173209549865027.image_cropper_DAD55499-EB67-453E-AFC9-5FD6CEF70D19-15871-000005A48322D2F3_large.jpg"
                    alt="Venue Badminton Hall"
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">Badminton Hall Bandung</h3>
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Badminton</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="mr-2 w-5 h-5 text-gray-600" />
                    <span>Bandung</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-500 line-through">Rp100.000</span>
                      <span className="text-green-600 font-bold ml-2">Rp80.000/jam</span>
                    </div>
                    <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Lihat Detail</a>
                  </div>
                </div>
              </div>
              
              <div className="venue-card bg-white rounded-xl shadow-md overflow-hidden transition duration-300">
                <div className="relative w-full h-48">
                  <Image
                    src="https://asset.ayo.co.id/image/venue/171696773166888.image_cropper_1716967712028_large.jpg"
                    alt="Venue Tennis Court"
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">Tennis Court Surabaya</h3>
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Tennis</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="mr-2 w-5 h-5 text-gray-600" />
                    <span>Surabaya</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-500 line-through">Rp200.000</span>
                      <span className="font-bold ml-2">Rp150.000/jam</span>
                    </div>
                    <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">Lihat Detail</a>
                  </div>
                </div>
              </div>
          </div>
            
          <div className="text-center mt-12">
            <a href="#" className="inline-block px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition">Lihat Semua Venue</a>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Cara Booking Lapangan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Hanya perlu 3 langkah mudah untuk memesan lapangan favorit Anda</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Cari Venue</h3>
              <p className="text-gray-600">Temukan venue dan lapangan sesuai lokasi dan jenis olahraga yang Anda inginkan</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Pilih Jadwal</h3>
              <p className="text-gray-600">Pilih tanggal dan jam yang tersedia untuk booking lapangan</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Bayar & Selesai</h3>
              <p className="text-gray-600">Lakukan pembayaran dan dapatkan konfirmasi booking langsung</p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}