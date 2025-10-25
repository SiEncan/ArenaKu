"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  LogOut,
  ChevronRight,
} from "lucide-react";

import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { signOut } from "next-auth/react";
import MainLayout from "@/components/layouts/MainLayout";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated") {
      setLoading(false);
    }
  }, [status, router]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  // @ts-expect-error karena di db tidak ada image
  const userImage = session?.user?.image;
  const userName = session?.user?.name || "Pengguna";
  const userEmail = session?.user?.email || "email@example.com";
  const userRole = session?.user?.role || "Customer";

  // Contoh data riwayat booking (dalam aplikasi nyata, ini akan diambil dari database)
  const bookingHistory = [
    { id: "B001", date: "2023-05-15", field: "Lapangan A", status: "Selesai" },
    { id: "B002", date: "2023-06-20", field: "Lapangan B", status: "Selesai" },
    {
      id: "B003",
      date: "2023-07-10",
      field: "Lapangan A",
      status: "Dibatalkan",
    },
  ];

  // Contoh data booking mendatang
  const upcomingBookings = [
    {
      id: "B004",
      date: "2025-05-20",
      time: "15:00-17:00",
      field: "Lapangan C",
      status: "Dikonfirmasi",
    },
    {
      id: "B005",
      date: "2025-06-01",
      time: "09:00-11:00",
      field: "Lapangan A",
      status: "Menunggu Pembayaran",
    },
  ];

  return (
    <MainLayout>
      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-600"></div>
            <p className="text-green-800">Memuat profil...</p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profil Pengguna */}
              <Card className="md:col-span-1 border-green-100">
                <CardHeader className="flex flex-col items-center text-center pb-2">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-green-100">
                      {userImage ? (
                        <Image
                          src={userImage}
                          alt={userName}
                          fill
                        />
                      ) : (
                        <AvatarFallback className="bg-green-100 text-green-700">
                          <User className="h-12 w-12" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white border-green-200 hover:bg-green-50 hover:text-green-700"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit profil</span>
                    </Button>
                  </div>
                  <CardTitle className="mt-4 text-xl font-bold text-green-800">
                    {userName}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                  >
                    {userRole}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Separator className="my-2" />
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-green-700">
                      <Mail className="h-5 w-5 text-green-600" />
                      <span className="text-sm">{userEmail}</span>
                    </div>
                    <div className="flex items-center gap-3 text-green-700">
                      <Phone className="h-5 w-5 text-green-600" />
                      <span className="text-sm">+62 812 3456 7890</span>
                    </div>
                    <div className="flex items-center gap-3 text-green-700">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Jakarta, Indonesia</span>
                    </div>
                    <div className="flex items-center gap-3 text-green-700">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Bergabung sejak Mei 2023</span>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full border-green-200 text-green-700 bg-white hover:bg-green-100 hover:text-green-800"
                      onClick={() => router.push("/profile/edit")}
                    >
                      Edit Profil
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-100"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </CardFooter>
              </Card>

              {/* Informasi Booking */}
              <Card className="md:col-span-2 border-green-100">
                <CardHeader>
                  <CardTitle className="text-green-800">
                    Informasi Booking
                  </CardTitle>
                  <CardDescription>
                    Lihat riwayat dan jadwal booking lapangan Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-green-600">
                      <TabsTrigger
                        value="upcoming"
                        className="data-[state=active]:bg-white data-[state=active]:text-green-700"
                      >
                        Mendatang
                      </TabsTrigger>
                      <TabsTrigger
                        value="history"
                        className="data-[state=active]:bg-white data-[state=active]:text-green-700"
                      >
                        Riwayat
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="upcoming" className="pt-4">
                      {upcomingBookings.length > 0 ? (
                        <div className="space-y-4">
                          {upcomingBookings.map((booking) => (
                            <div
                              key={booking.id}
                              className="flex items-center justify-between p-4 rounded-lg border border-green-100 hover:bg-green-50 transition-colors"
                            >
                              <div className="space-y-1">
                                <div className="font-medium text-green-800">
                                  {booking.field}
                                </div>
                                <div className="text-sm text-green-600">
                                  {booking.date} • {booking.time}
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`
                                  ${
                                    booking.status === "Dikonfirmasi"
                                      ? "bg-green-100 text-green-700 border-green-200"
                                      : ""
                                  }
                                  ${
                                    booking.status === "Menunggu Pembayaran"
                                      ? "bg-amber-100 text-amber-700 border-amber-200"
                                      : ""
                                  }
                                `}
                                >
                                  {booking.status}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-800 hover:bg-green-100"
                              >
                                <ChevronRight className="h-5 w-5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="h-12 w-12 mx-auto text-green-300" />
                          <p className="mt-2 text-green-600">
                            Anda belum memiliki booking mendatang
                          </p>
                          <Button
                            className="mt-4 bg-green-600 hover:bg-green-700"
                            onClick={() => router.push("/booking")}
                          >
                            Booking Sekarang
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="history" className="pt-4">
                      {bookingHistory.length > 0 ? (
                        <div className="space-y-4">
                          {bookingHistory.map((booking) => (
                            <div
                              key={booking.id}
                              className="flex items-center justify-between p-4 rounded-lg border border-green-100 hover:bg-green-50 transition-colors"
                            >
                              <div className="space-y-1">
                                <div className="font-medium text-green-800">
                                  {booking.field}
                                </div>
                                <div className="text-sm text-green-600">
                                  {booking.date}
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`
                                  ${
                                    booking.status === "Selesai"
                                      ? "bg-slate-100 text-slate-700 border-slate-200"
                                      : ""
                                  }
                                  ${
                                    booking.status === "Dibatalkan"
                                      ? "bg-red-100 text-red-700 border-red-200"
                                      : ""
                                  }
                                `}
                                >
                                  {booking.status}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-800 hover:bg-green-100"
                              >
                                <ChevronRight className="h-5 w-5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="h-12 w-12 mx-auto text-green-300" />
                          <p className="mt-2 text-green-600">
                            Anda belum memiliki riwayat booking
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
