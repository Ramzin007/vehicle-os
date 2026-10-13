# VehicleOS — Vehicle Ownership & Care Management System

**VehicleOS** is a production-grade, mobile-first vehicle companion web application engineered to manage fuel economy, maintenance intervals, compliance documents, running expenses, and vehicle health metrics. Built with Next.js 16, React 19, Tailwind CSS v4, Prisma ORM, and SQLite.

The initial real-world implementation is tailored for the **TVS Ronin 225 motorcycle**, with architectural support for multiple motorcycles, scooters, and cars.

---

## 🚀 Key Features

### 1. Fuel & Refill Intelligence (`/fuel`)
- **Automated Fuel Economy Calculations**: Computes real-world mileage in `km/L`, `L/100km`, and `MPG` across consecutive full tank refills.
- **Trip Distances**: Computes covered distances per refill interval automatically based on odometer telemetry.
- **Cost Efficiency**: Tracks running cost per kilometer (`₹/km`), total fuel expenditure, and average price per liter.
- **Refill Tracking**: Supports full tank vs. partial fill logic, missed refill compensation, fuel station names (IndianOil, BPCL, HPCL, Shell), and custom ride notes.

### 2. Service & Maintenance Tracker (`/maintenance`)
- **Scheduled & Recurring Maintenance**: Pre-configured presets for TVS Ronin & common motor vehicles (Engine Oil & Filter, Drive Chain Clean & Lube, Brake Fluid & Pad Wear, Spark Plug, Air Filter, Periodic Inspection).
- **Dual Due Triggers**: Tracks both odometer threshold (`Due at X km`) and calendar interval (`Due on Y date`).
- **Real-Time Urgency Badging**: Automatically classifies tasks into `Scheduled`, `Due Soon` (within 300 km / 14 days), `Overdue`, and `Completed`.
- **One-Click Completion & Expense Sync**: Records completed service odometer, date, and automatically synchronizes service costs to the expense ledger.

### 3. Compliance & Document Expiry Vault (`/documents`)
- **Vehicle Document Monitoring**: Tracks Registration Certificate (RC), Comprehensive Insurance, Pollution Under Control Certificate (PUC), and Driving License.
- **Proactive Expiry Alerts**: Dynamic countdowns and status indicators:
  - `Active` (Valid)
  - `Expiring Soon` (Within 30 days)
  - `Expired` (Immediate action warning)
- **Document Metadata**: Stores policy numbers, issuing RTOs, insurance providers, and notes.

### 4. Vehicle Care Score™ Engine
- **Dynamic 0–100 Care Metric**: Weighted algorithm that continuously evaluates:
  - Maintenance compliance & overdue status (35%)
  - Document validity and renewal health (30%)
  - Fuel logging regularity (20%)
  - Odometer progression and recency (15%)
- **Health Ratings**: `EXCELLENT` (90–100), `GOOD` (75–89), `ATTENTION NEEDED` (55–74), and `CRITICAL` (<55).
- **Actionable Recommendations**: Gives riders precise advice to maintain peak vehicle reliability.

### 5. Categorized Expense Management (`/expenses`)
- **Holistic Cost Ledger**: Tracks spending across `FUEL`, `SERVICE`, `PARTS`, `ACCESSORIES`, `WASH`, `TOLL`, and `INSURANCE`.
- **Visual Category Breakdown**: Real-time proportion meters and percentage distributions.
- **Overall Ownership Cost**: Live cost per kilometer calculation across the vehicle's lifespan.

### 6. Geolocation Fuel Station Finder (`/stations`)
- **Live GPS Integration**: Utilizes the Browser Geolocation API to find the user's current coordinates.
- **OpenStreetMap Overpass API**: Finds nearby fuel stations within a 5 km radius with fallback resilience.
- **Amenities & Routing**: Displays distance, fuel brands (IndianOil, BPCL, HPCL, Shell, Nayara), operating hours, and one-tap Google Maps turn-by-turn routing.

### 7. Multi-Vehicle Garage (`/more`)
- Switch instantly between multiple vehicles or register new motorcycles and cars.
- Detailed technical specs display (e.g. TVS Ronin 225.9cc oil-cooled engine, 14L tank, 20.4 PS).
- Full JSON telemetry export and one-tap demo reset functionality.

---

## 🛠 Tech Stack & Architecture

- **Framework**: Next.js 16.3.2 (App Router with Turbopack)
- **UI Library**: React 19, Tailwind CSS v4
- **Database & ORM**: Prisma ORM with SQLite (`dev.db`), zero external server dependencies
- **Validation**: Zod schema validation
- **Icons**: Lucide React
- **Location Services**: Browser Geolocation + OpenStreetMap Overpass API

---

## 📁 Repository Structure

```
vehicle-os/
├── app/
│   ├── api/
│   │   ├── documents/    # Document vault API
│   │   ├── expenses/     # Expense ledger API
│   │   ├── fuel/         # Refuel logs & economy computation API
│   │   ├── maintenance/  # Service tasks & completion API
│   │   ├── seed/         # Initial database seeding & reset API
│   │   ├── stations/     # Fuel stations geolocation API
│   │   └── vehicles/     # Vehicle garage API
│   ├── documents/        # Documents & compliance page
│   ├── expenses/         # Expense tracking page
│   ├── fuel/             # Fuel economy page
│   ├── maintenance/      # Service tracker page
│   ├── more/             # Settings & vehicle specs page
│   ├── stations/         # Nearby petrol stations page
│   ├── layout.tsx        # Root HTML & Geist fonts
│   └── page.tsx          # Mobile-first Dashboard
├── components/
│   ├── context/          # VehicleProvider React Context
│   ├── dashboard/        # VehicleCard, StatCard, QuickActions
│   ├── layout/           # AppShell, TopBar, BottomNav
│   └── modals/           # AddRefuel, AddService, AddExpense, AddDoc, AddVehicle
├── lib/
│   ├── calculations.ts   # Pure calculation engine (Mileage, Care Score, Expenses)
│   ├── calculations.test.ts # Automated unit test suite
│   ├── prisma.ts         # Prisma client singleton
│   ├── seed.ts           # TVS Ronin 225 high-fidelity seeder
│   └── validations.ts    # Zod schemas
└── prisma/
    ├── dev.db            # SQLite local database
    └── schema.prisma     # Prisma data models
```

---

## 🚦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Push Prisma Database Schema
```bash
npx prisma db push
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your mobile browser or desktop.

### 4. Run Tests
```bash
npx tsx lib/calculations.test.ts
```

### 5. Production Build
```bash
npm run build
```
