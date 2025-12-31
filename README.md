
<div align="center">

# ⚡ Radiant Stellar / ZihadHasan

**The Next-Gen Personal Platform & Portfolio**

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.7-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

_Built with the bleeding edge of web technology. Fast, responsive, and beautifully animated._

[View Demo](https://zihadhasan.com) · [Report Bug](https://github.com/Z-root-X/zihadhasan/issues) · [Request Feature](https://github.com/Z-root-X/zihadhasan/issues)

</div>

<br />

## 🚀 Overview

**ZihadHasan** is not just a portfolio—it's a comprehensive digital platform engineered for performance and scalability. Built on the revolutionary **Next.js 15** and **React 19**, it leverages the latest advancements in web development including **Tailwind CSS v4** for styling and **Firebase** for a serverless backend.

The architecture is designed to support a multi-faceted ecosystem including a blog, course management system, event tracking, and e-commerce capabilities, all wrapped in a premium, motion-rich user interface powered by **GSAP** and **Framer Motion**.

## ✨ Key Features

- **🎨 Advanced UI/UX**: Immersive animations with [GSAP](https://greensock.com/gsap/) and [Framer Motion](https://www.framer.com/motion/), plus silky smooth scrolling via `@studio-freight/react-lenis`.
- **🔐 Secure Authentication**: Robust auth flows using robust JWT/Auth strategies alongside Firebase Authentication.
- **🛍️ E-Commerce Engine**: Fully functional shop implementation with product management, cart logic, and checkout flows.
- **📚 Learning Management**: Dedicated `courses` module for delivering educational content.
- **📝 CMS Integration**: Custom `cms-service` layer to manage Blogs, Events, and dynamic content efficiently.
- **⚡ SEO Optimized**: Built-in `schema-generator` for JSON-LD, generic implementations for `robots.ts` and `sitemap.ts` ensuring maximum visibility.
- **🛠️ Admin Dashboard**: specific `(admin)` route group with secure access to manage the platform's content and data.
- **🌗 Dark/Light Mode**: Seamless theme switching with `next-themes`.

## 🛠️ Tech Stack

### Core
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

### Styling & UI
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/) / Shadcn-like architecture
- **Icons**: [Lucide React](https://lucide.dev/)

### Animations
- **Physics**: [Framer Motion](https://www.framer.com/motion/)
- **Timeline**: [GSAP](https://greensock.com/gsap/)
- **Scroll**: [Lenis](https://github.com/studio-freight/lenis)

### Backend & Data
- **Baas**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage)
- **Media**: [Cloudinary](https://cloudinary.com/) (Image Optimization)
- **Email**: [Resend](https://resend.com/)

## 🏗️ Architecture

The application implements a modern, edge-ready architecture designed for performance and security.

```mermaid
graph TD
    User[End User] --> Next[Next.js Edge Middleware]
    Next -->|Public| Page[(public) Pages]
    Next -->|Protected| Auth[Jose JWT Auth]
    
    Auth --> Admin[(admin) Dashboard]
    Admin -->|CRUD| CMS[CMS Service]
    Page -->|Read| CMS
    
    CMS -->|Transactions| FS[(Firestore)]
    CMS -->|Assets| Cloud[Cloudinary]
```

## 🧩 Core Systems

### 1. Smart CMS Service
Located in [`src/lib/cms-service.ts`](src/lib/cms-service.ts), the CMS layer acts as a single source of truth for all data operations.
- **Transactional Integrity**: Uses Firestore transactions to handle high-concurrency event registrations, ensuring no over-booking.
- **Soft Delete System**: Implements a robust "trash" mechanism where items are flagged `isDeleted: true` allowing for recovery.
- **Automated Maintenance**: A dedicated `cleanupSoftDeletedItems` server action in [`src/actions/system.ts`](src/actions/system.ts) allows admins to purge "soft deleted" data.

### 2. Edge-First Authentication
Authentication is handled in [`src/middleware.ts`](src/middleware.ts) using `jose` for lightweight, non-blocking JWT verification at the edge.
- **Performance**: Validates `auth_token` cookies instantly without waking up cold serverless functions.
- **Role-Based Access**: Automatically redirects unauthorized users away from `/dashboard` routes.

## 🎨 UI/UX Philosophy

We don't just build pages; we build **experiences**.

### Physics-Based Interactions
Components like `<MagneticButton />` in [`magnetic-button.tsx`](src/components/ui/magnetic-button.tsx) use **Framer Motion** spring physics to create buttons that "stick" to your cursor.

### Spotlight Effects
The `<SpotlightCard />` in [`spotlight-card.tsx`](src/components/ui/spotlight-card.tsx) tracks mouse movement to calculate a radial gradient in real-time, creating a premium "glass" aesthetic.

## 📂 Project Structure

This project follows a feature-first, scalable architecture:

```bash
src/
├── actions/        # Server Actions for mutations
├── app/            # Next.js App Router
│   ├── (admin)/    # Secure admin routes
│   └── (public)/   # Public facing pages
├── components/     # Component Library
│   ├── admin/      # Admin-specific components
│   ├── auth/       # Authentication forms
│   ├── shared/     # Reusable logic components
│   └── ui/         # Design system primitives
├── lib/            # Utilities and Services
│   ├── cms-service.ts  # Content aggregation layer
│   └── firebase.ts     # Firebase configuration
└── styles/         # Global styles
```

## 🏎️ Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Z-root-X/zihadhasan.git
   cd zihadhasan
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root directory and add your keys (Firebase, Cloudinary, etc.):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   # ... add other required vars
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` to view the application.

## 🚀 Deployment

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FZ-root-X%2Fzihadhasan)

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Star ⭐ this repository if you find it interesting!</p>
  <p>Made with ❤️ by <a href="https://github.com/Z-root-X">Zihad Hasan</a></p>
</div>
