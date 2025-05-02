import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import prisma from "../../../lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password diperlukan");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Email tidak terdaftar");
        }

        if (!user.password) {
          throw new Error("User ini menggunakan login dengan Google. Silakan login dengan Google.");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Password salah");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Jika login dengan Google, simpan atau update user di Prisma
      if (account?.provider === "google" && user.email) {
        try {
          // Cek apakah user sudah ada di database berdasarkan email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Jika user belum ada, buat user baru di Prisma
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name as string,
                phone: null, // Google Auth tidak memberikan nomor telepon
                password: "", // Tidak ada password untuk user Google Auth
                role: "CUSTOMER", // Role default
              },
            });
          }
          user.id = existingUser?.id;
        } catch (error: any) {
          console.error('Gagal menyimpan user dari Google Auth:', error);
          return false; // Batalkan login jika gagal menyimpan ke database
        }
      }
      return true; // Lanjutkan proses login
    },
    async jwt({ token, user }) {
      // Tambahkan data user ke token JWT
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Tambahkan data user ke sesi
      if (session.user && token.id) {
        // Ambil data user dari database berdasarkan email atau id
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { id: true, name: true, email: true, phone: true, role: true },
        });

        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.name = dbUser.name;
          session.user.email = dbUser.email;
          session.user.phone = dbUser.phone; // Akan null untuk user Google Auth
          session.user.role = dbUser.role;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 6 * 3600, // 6 jam
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);