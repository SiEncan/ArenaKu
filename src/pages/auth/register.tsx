"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, User, Mail, Phone, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "", // Tambahkan confirmPassword
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State untuk toggle confirm password
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validasi confirm password
    if (formData.password !== formData.confirmPassword) {
      setError("Password dan Konfirmasi Password tidak cocok");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }), // Kirim hanya data yang diperlukan ke API
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan saat registrasi");
      }

      // Pendaftaran berhasil, arahkan ke halaman login
      router.push("/auth/login");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        // Handle non-error values
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="w-full max-w-md">
        <Card className="border-green-100 shadow-lg">
        <CardFooter className="flex justify-between items-center">
            <Button
              variant="outline"
              className="text-green-600 hover:bg-green-100 bg-white border-green-200 hover:text-green-700 cursor-pointer"
              onClick={() => router.push("/")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </CardFooter>
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <User className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-green-800">Daftar Akun</CardTitle>
            <CardDescription className="text-center text-green-600">
              Buat akun untuk mulai booking lapangan
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-green-700">
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-green-500" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    className="pl-10 border-green-200 focus-visible:ring-green-500"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-green-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-green-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    className="pl-10 border-green-200 focus-visible:ring-green-500"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-green-700">
                  Nomor Telepon
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-green-500" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="08123456789"
                    className="pl-10 border-green-200 focus-visible:ring-green-500"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-green-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-green-500" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 border-green-200 focus-visible:ring-green-500"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute right-3 top-2.5 text-green-500 hover:text-green-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    <span className="sr-only">{showPassword ? "Sembunyikan password" : "Tampilkan password"}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-green-700">
                  Konfirmasi Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-green-500" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 border-green-200 focus-visible:ring-green-500"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleShowConfirmPassword}
                    className="absolute right-3 top-2.5 text-green-500 hover:text-green-700"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    <span className="sr-only">{showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}</span>
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Mendaftar...
                  </>
                ) : (
                  "Daftar"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col">
            <p className="text-center text-sm text-green-700">
              Sudah punya akun?{" "}
              <Link href="/auth/login" className="font-medium text-green-600 hover:text-green-800 hover:underline">
                Masuk di sini
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}