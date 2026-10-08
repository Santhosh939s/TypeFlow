# 💻 Local Setup & Development Environment

Follow this guide to get TypeFlow running on your local machine.

## Prerequisites

* **Node.js**: v18.x or later (v20+ recommended)
* **npm**: v9.x or later

## Installation Steps

1. **Clone the Project**:
   ```bash
   git clone https://github.com/Santhosh939s/TypeFlow.git
   cd TypeFlow
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional for Cloud Features)**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:3000/`.
