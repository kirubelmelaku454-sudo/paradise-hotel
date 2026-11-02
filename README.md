# 👑 Paradise Hotel 5-Star · Debre Markos, Ethiopia

A premier, full-stack 5-star hotel enterprise management system and guest portal featuring contactless mobile check-in, authentic Ethiopian payment gateways (Telebirr & CBE Birr), executive dashboards, and interactive reservation systems.

![Paradise Hotel Banner](https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80)

---

## 🌟 Key Highlights & Architecture

### 1. 🛏️ 30 Luxury Suites & Rooms (Horizontal Movable Shelves)
- Categorized into 3 dedicated 10-item shelves:
  - **👑 Royal & Presidential Penthouse Collection (Rooms 401–308)**: Jacuzzi, panoramic terrace, private butler.
  - **🏔️ Executive Mountain & Panoramic City Suites (Rooms 201–210)**: Choke Mountain vistas, ergonomic workstation.
  - **🌿 Deluxe Comfort & Tranquil Garden Rooms (Rooms 101–110)**: Plush queen beds, rain shower, courtyard views.
- **🎫 Contactless Digital Room Key & QR Pass**: Scannable guest boarding pass with keyless PIN door entry and high-speed fiber WiFi credentials.

### 2. 🍕 50 Gourmet Dishes & Ethiopian Culinary Delicacies
- Grouped into 5 distinct shelves of **at most 10 items per slider**:
  - 👑 Traditional Ethiopian Signatures (Doro Wat, Sizzling Tibs, Kitfo, Beyaynetu, Shiro).
  - 🥩 Gourmet Steaks, International Entrees & Truffle Pastas.
  - 🥐 Morning Breakfast & Artisan Bakery Delights.
  - 🍹 Fresh Pressed Juices, Layered Spris & Chilled Soft Drinks.
  - 🍷 Grand Reserve Fine Wines, Beers & Crafted Cocktails.

### 3. 🍽️ 30 Dining Desks & Co-Working Spaces
- Sunset Terrace open-air deck (D01–D10), Grand Palace dining booths (D11–D20), and Garden Pergolas (D21–D30).
- Special Dining Privilege: Order food and the desk reservation fee is **100% Free**!

### 4. 🛡️ 5 Executive Role-Based Portals (Vertical Sidebar Navigation)
- **Admin Command Center**: System configuration, promotional discounts, audit logs, staff management, and analytics.
- **General Manager Dashboard**: Financial oversight, occupancy analytics, staff audits, and performance metrics.
- **Front Desk Receptionist Portal**: Real-time room status, housekeeping coordination, booking approvals, and **1-click printable Police & Tourism Manifest export (CSV/Print)**.
- **Housekeeping Specialist View**: Interactive room cleaning toggle (Cleaned / Occupied / Maintenance).
- **VIP Customer Member Portal**: Spend analytics (`LuxuryDoughnutChart`), live food order tracking stepper, invoice folios, and **Paradise Elite VIP Loyalty Program** (Bronze, Silver, Gold, Diamond).

### 5. 💳 Authentic Ethiopian Banking & Digital Wallet
- Interactive visual debit/ATM cards for **Commercial Bank of Ethiopia (CBE)**, **Telebirr**, **Awash Bank**, **Dashen Bank**, and **Bank of Abyssinia**.
- 1-click quick balance top-up (`+1,000`, `+2,500`, `+5,000`, `+10,000 ETB`) and real-time balance queries.

### 6. 📸 Virtual Tour & Resort Gallery
- High-resolution gallery across 5 categories with fullscreen lightbox modal, zoom, and direct booking links.

### 7. 🎵 Ambient Lounge Music & Web Audio Synthesizer
- Built-in soothing Ethiopian highland acoustic harmonies synthesized via native Web Audio API with volume slider and track controls.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, React Router v6, Web Audio API, Progressive Web App (PWA), SVG Animated Charts, CSS Variables (Dark & Light Theme).
- **Backend**: Node.js, Express.js, MySQL2, JWT Authentication, Multer, bcryptjs.
- **Database**: MySQL 8.0.
- **DevOps**: Docker, Docker Compose, Nginx.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js (v18+)
- MySQL (v8.0+) or Docker

### 1. Clone Repository
```bash
git clone https://github.com/<YOUR_USERNAME>/paradise-hotel.git
cd paradise-hotel
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
npm install
```
Edit `.env` to set your MySQL password.

### 3. Seed Database (50 Foods, 30 Rooms, 30 Desks & 5 Roles)
```bash
node seed_expanded_luxury_items.js
```

### 4. Configure & Start Frontend
```bash
cd ../frontend
npm install
npm start
```
Frontend runs at: `http://localhost:3000`  
Backend API runs at: `http://localhost:5000`

---

## 🐳 Docker Setup (1-Command Launch)

```bash
docker-compose up -d --build
```
This automatically boots:
- MySQL 8.0 Database on port `3306`
- Node.js API server on port `5000`
- Nginx Production Frontend on port `3000`

---

## 🔑 Demo Access Credentials

| Role | Username | Password |
|---|---|---|
| **System Admin** | `admin` | `admin123` |
| **General Manager** | `manager` | `manager123` |
| **Front Desk Receptionist** | `receptionist` | `receptionist123` |
| **Housekeeping Specialist** | `housekeeping` | `housekeeping123` |
| **VIP Guest Customer** | `customer` | `customer123` |

---

## 📄 License
Proudly crafted for **Paradise Hotel · Debre Markos, Amhara Region, Ethiopia**.
All rights reserved © 2026.
