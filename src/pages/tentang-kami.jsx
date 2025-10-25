import Image from "next/image"
import Link from "next/link"
import { MapPin, Mail, Phone, Clock, CheckCircle, Users, Trophy, Calendar } from "lucide-react"
import MainLayout from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function TentangKami() {
  return (
    <MainLayout>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-green-600 to-green-800 py-20 text-white">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-black/30"></div>
            {/* <Image
              src="https://picsum.photos/1200/600"
              alt="Lapangan olahraga"
              fill
              className="object-cover"
              priority
            /> */}
          </div>
          <div className="container relative mx-auto px-4 text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">Tentang Kami</h1>
            <p className="mx-auto max-w-2xl text-lg text-white/90">
              Menyediakan lapangan olahraga berkualitas untuk semua kebutuhan aktivitas Anda
            </p>
          </div>
        </section>

        {/* Visi & Misi */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-6 text-3xl font-bold text-green-800">Visi & Misi Kami</h2>
              <div className="mb-8 space-y-6 text-gray-700">
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-green-700">Visi</h3>
                  <p>
                    Menjadi platform booking lapangan olahraga terdepan yang menghubungkan masyarakat dengan fasilitas
                    olahraga berkualitas, mendorong gaya hidup aktif dan sehat di seluruh Indonesia.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-green-700">Misi</h3>
                  <ul className="list-inside list-disc space-y-2 text-left">
                    <li>Menyediakan akses mudah ke berbagai fasilitas olahraga berkualitas</li>
                    <li>Membantu pengelola lapangan meningkatkan okupansi dan efisiensi operasional</li>
                    <li>Mendorong masyarakat untuk hidup lebih aktif dan sehat melalui olahraga</li>
                    <li>Menciptakan komunitas olahraga yang inklusif dan mendukung</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cerita Kami */}
        <section className="bg-green-50 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-12 md:grid-cols-2 md:items-center">
                <div>
                  <h2 className="mb-4 text-3xl font-bold text-green-800">Cerita Kami</h2>
                  <p className="mb-4 text-gray-700">
                    Berawal dari kesulitan mencari dan memesan lapangan olahraga, kami mendirikan platform ini pada tahun
                    2023 dengan tujuan sederhana: membuat olahraga lebih mudah diakses oleh semua orang.
                  </p>
                  <p className="mb-4 text-gray-700">
                    Sebagai pecinta olahraga, kami sering mengalami frustrasi saat mencoba memesan lapangan - panggilan
                    telepon yang tidak terjawab, ketidakjelasan ketersediaan, dan proses pembayaran yang rumit. Kami tahu
                    pasti ada cara yang lebih baik.
                  </p>
                  <p className="text-gray-700">
                    Sekarang, kami bangga telah membantu ribuan orang menemukan dan memesan lapangan olahraga dengan
                    mudah, serta membantu pemilik lapangan meningkatkan bisnis mereka melalui platform digital yang
                    intuitif.
                  </p>
                </div>
                <div className="relative h-[400px] overflow-hidden rounded-xl">
                  <Image src="https://picsum.photos/600/400" alt="Tim kami" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Keunggulan Kami */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-green-800">Keunggulan Kami</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <CheckCircle className="h-10 w-10 text-green-600" />,
                  title: "Kemudahan Booking",
                  description: "Proses booking yang cepat dan mudah, hanya dalam beberapa klik",
                },
                {
                  icon: <Users className="h-10 w-10 text-green-600" />,
                  title: "Berbagai Jenis Lapangan",
                  description: "Pilihan lapangan yang beragam untuk berbagai jenis olahraga",
                },
                {
                  icon: <Trophy className="h-10 w-10 text-green-600" />,
                  title: "Kualitas Terjamin",
                  description: "Semua lapangan telah melalui proses verifikasi kualitas",
                },
                {
                  icon: <Calendar className="h-10 w-10 text-green-600" />,
                  title: "Fleksibilitas Jadwal",
                  description: "Lihat ketersediaan real-time dan pilih jadwal yang sesuai",
                },
              ].map((feature, index) => (
                <Card key={index} className="border-green-100">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className="mb-4 rounded-full bg-green-100 p-3">{feature.icon}</div>
                    <h3 className="mb-2 text-xl font-semibold text-green-800">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Tim Kami */}
        <section className="bg-green-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-green-800">Tim Kami</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "Ahmad Rizki",
                  role: "Founder & CEO",
                  image: "/placeholder.svg?height=300&width=300",
                  bio: "Pecinta olahraga dan teknologi dengan visi mendemokratisasi akses ke fasilitas olahraga.",
                },
                {
                  name: "Siti Nuraini",
                  role: "Chief Technology Officer",
                  image: "/placeholder.svg?height=300&width=300",
                  bio: "Ahli teknologi dengan pengalaman lebih dari 10 tahun dalam pengembangan platform digital.",
                },
                {
                  name: "Budi Santoso",
                  role: "Head of Operations",
                  image: "/placeholder.svg?height=300&width=300",
                  bio: "Berpengalaman dalam manajemen operasional dan pengembangan bisnis di industri olahraga.",
                },
              ].map((member, index) => (
                <div key={index} className="overflow-hidden rounded-lg bg-white shadow-md">
                  <div className="relative h-64 w-full">
                    <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="mb-1 text-xl font-semibold text-green-800">{member.name}</h3>
                    <p className="mb-3 text-sm font-medium text-green-600">{member.role}</p>
                    <p className="text-gray-600">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Kontak & Lokasi */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-green-800">Hubungi Kami</h2>
            <div className="mx-auto rounded-xl bg-white p-8 shadow-md">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-xl font-semibold text-green-700">Informasi Kontak</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="mr-3 h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Alamat</p>
                        <p className="text-gray-600">Jl. Sudirman No. 123, Jakarta Pusat, 10220</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="mr-3 h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-gray-600">info@arenaku.com</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="mr-3 h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Telepon</p>
                        <p className="text-gray-600">+62 812 3456 7890</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="mr-3 h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Jam Operasional</p>
                        <p className="text-gray-600">Senin - Jumat: 09.00 - 17.00 WIB</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="mb-4 text-xl font-semibold text-green-700">Kirim Pesan</h3>
                  <form className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Nama Anda"
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email Anda"
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Pesan Anda"
                        rows={4}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                      ></textarea>
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700">Kirim Pesan</Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
    </MainLayout>
  )
}
