# ConsulSphere - Freelance Consulting Service Platform

A modern, full-stack Freelance and Consulting Service Platform built with Next.js, React, Tailwind CSS, and TypeScript. This platform connects clients with expert consultants for professional services, featuring real-time gig browsing, booking, payment processing (Stripe), and a comprehensive provider/admin dashboard.

## 🚀 Live Demo
- **Frontend URL:** [https://freelance-platform-frontend-iota.vercel.app](https://freelance-platform-frontend-iota.vercel.app)
- **Backend API:** [https://freelance-consulting-service-platfo.vercel.app](https://freelance-consulting-service-platfo.vercel.app)

## 🛠️ Technology Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** JWT, Google OAuth (Google Identity Services)
- **State Management:** React Context API
- **Icons:** Lucide React
- **Payments:** Stripe Checkout

## ✨ Key Features
- **User Authentication:** JWT-based login/registration and one-tap Google OAuth integration.
- **Role-Based Access Control:** Separate dashboards and permissions for `CLIENT`, `PROVIDER`, and `SUPER_ADMIN`.
- **Dynamic Dashboards:** Real-time MRR charts, gig statistics, recent orders, and provider tracking.
- **Gig Marketplace:** Browse, filter, and search professional consulting gigs.
- **Secure Payments:** Integrated Stripe checkout for smooth and secure order processing.
- **Profile Management:** Dynamic provider profiles to display skills, hourly rates, and bio.
- **Responsive Design:** Fully mobile-responsive interface optimized for all screen sizes.

## 📦 Local Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rafi570/Freelance-Consulting-Service-Platform-frontend.git
   cd Freelance-Consulting-Service-Platform-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add the following variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment
This project is optimized for deployment on **Vercel**. Environment variables must be configured in the Vercel dashboard prior to deployment.
