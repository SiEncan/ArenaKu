# ⚽ ArenaKu

A modern **sports field booking platform** built with **Next.js** and **TypeScript**.  
This project was developed as a **personal learning project** to explore full-stack web development concepts, focusing on **real-world booking systems**, **database modeling**, and **payment integration**.

![Preview](public/preview_arenaku.png)
For full documentation including images and videos, you can visit my portfolio:  
[Click Me!](https://adnanalvito.vercel.app/projects/1)

---

## ✨ Description

**ArenaKu** allows users to browse available sports venues, view real-time schedules, and book fields online.  
It’s designed with scalability in mind — initially for one owner (me), but the database structure already supports **multi-owner functionality** in the future.

The main goal of this project is to **learn and apply modern web development practices** using Next.js and TypeScript while simulating a realistic SaaS-like platform architecture.

---

## ⚙️ Key Features

- 🏐 Browse and book available sports fields  
- 📅 Dynamic time slot management with real-time updates  
- 💳 Payment integration using **Midtrans**  
- 🧾 Admin dashboard for managing venues and schedules  
- 🧍 Role-based authentication for owners and customers
- 👥 Multi-owner support – Multiple owners can manage their own fields independently.
- 📧 Email verification – Integrated Nodemailer to verify user accounts and reduce spam bookings.  
- 🔑 Google Sign-In – Enabled seamless login without manual registration for a smoother user experience.
- 💾 Local storage booking persistence – Preserves ongoing bookings even after page reloads or interruptions, improving user experience.  

---

## 🧰 Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)

---

## 🧩 Project Goals

This project was created primarily for **learning purposes**, focusing on:
- Understanding **Next.js** structure and server-side rendering (SSR)
- Writing strongly typed code with **TypeScript**
- Building responsive UIs with **Tailwind CSS**
- Implementing a **PostgreSQL + Prisma** database
- Learning how to **integrate a payment gateway** (e.g., Midtrans) into a real-world application
- Practicing clean and modular code architecture  

---

## 🚀 Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/SiEncan/ArenaKu.git
cd ArenaKu
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Set up environment variables
```bash
Create a .env file and fill in your credentials:

DATABASE_URL="your_postgresql_connection"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="your_midtrans_client_key"
MIDTRANS_SERVER_KEY="your_midtrans_server_key"
```

### 4️⃣ Run the development server
```bash
npm run dev
```
