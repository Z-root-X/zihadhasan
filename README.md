# Zihad Hasan - Personal Portfolio & Platform

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

A high-performance codebase powering the personal portfolio of Zihad Hasan. Built with **Next.js 15**, **React 19**, and **Firebase**.

## 🚀 Features

-   **Hybrid Static Architecture**: Uses `output: 'export'` for blazing fast static hosting, with a smart client-side fallback for dynamic content (`[slug]` routing).
-   **Modern Tech Stack**: TypeScript, Tailwind CSS v4, Framer Motion, GSAP.
-   **Security**: Firebase App Check (reCAPTCHA v3) and strict Firestore Rules.
-   **CMS Architecture**: Domain-driven services for managing Blog, Events, Shop, and Users.
-   **Performance**: 100/100 Lighthouse scores via optimized fonts, images, and static generation.

## 🛠️ Technology Stack

-   **Framework**: [Next.js 15 (App Router)](https://nextjs.org)
-   **Language**: [TypeScript](https://www.typescriptlang.org)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + [Shadcn UI](https://ui.shadcn.com)
-   **Animations**: Framer Motion + GSAP
-   **Backend**: Firebase (Firestore, Auth, Storage)
-   **Deployment**: Firebase Hosting

## 📂 Project Structure

```bash
src/
├── app/                  # Next.js App Router
│   ├── (public)/         # Public facing pages (Home, Blog, etc.)
│   ├── (admin)/          # Admin Dashboard
│   └── layout.tsx        # Root layout with providers
├── components/
│   ├── home/             # Home page specific components
│   ├── blog/             # Blog components
│   ├── ui/               # Reusable UI primitives (Buttons, Inputs)
│   └── providers/        # Global providers (Theme, Auth, SmoothScroll)
└── lib/
    ├── services/         # Domain-driven business logic
    │   ├── blog-service.ts
    │   ├── event-service.ts
    │   └── ...
    ├── firebase.ts       # Firebase initialization
    └── cms-service.ts    # Unified facade for all services
```

## ⚡ Getting Started

### Prerequisites

-   Node.js 18+
-   `pnpm` (Recommended)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Z-root-X/zihadhasan.git
    cd zihadhasan
    ```

2.  Install dependencies:
    ```bash
    pnpm install
    # or
    npm install
    ```

### Environment Setup

Create a `.env.local` file in the root directory and populate it with your Firebase configuration. **Note:** Sensitive keys should never be committed.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_RECAPTCHA_KEY=your_recaptcha_site_key
```

### Running Locally

```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🚢 Deployment

This project is configured for **Firebase Hosting**.

1.  Build the project:
    ```bash
    pnpm build
    ```
    *This generates a static logic export in the `out/` directory.*

2.  Deploy to Firebase:
    ```bash
    firebase deploy
    ```

## 🔒 Security

-   **App Check**: Configured with reCAPTCHA v3. Ensure your localhost is added to the debug token whitelist or allow-list in Firebase Console for local testing.
-   **Firestore Rules**: Check `firestore.rules` for the robust Role-Based Access Control (RBAC) implementation.

## 🤝 Contributing

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
