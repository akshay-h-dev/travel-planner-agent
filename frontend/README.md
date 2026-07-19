# TripWay Frontend

> **AI-powered itinerary planner** that automatically keeps trips within budget, dynamically replans when costs change, and prioritises verified local guides, homestays, and small businesses over large booking aggregators.

---

## ✨ Overview

TripWay is a premium SaaS-style travel planning platform built with React 19 + TypeScript. The frontend connects to a Node.js + TypeScript travel-planner-agent backend (REST API) and currently ships with a fully functional **mock AI engine** for offline/demo use.

**Key differentiators vs generic travel sites:**
- 🤖 **AI Replan Engine** — automatically swaps activities/stays when costs exceed your budget cap
- 🏡 **Local-First Routing** — bypasses corporate aggregator commissions to fund regional operators
- 📊 **Live Budget Tracking** — real-time cost recalculation on every change
- 🌿 **Eco-Conscious Options** — promotes electric transport, organic cafes, and carbon-neutral hiking

---

## 🖥️ Tech Stack

| Category | Library | Version |
|---|---|---|
| UI Framework | React | 19 |
| Language | TypeScript | 6 |
| Build Tool | Vite | 8 |
| Styling | Tailwind CSS | 4 |
| Routing | React Router DOM | 7 |
| Animation | Framer Motion | 12 |
| Icons | Lucide React | 1.25 |
| Forms | React Hook Form + Zod | 7 / 4 |
| HTTP | Axios | 1.18 |
| Charts | Recharts | 3 |
| State / Cache | TanStack React Query | 5 |

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── budget/
│   │   │   ├── BudgetSummary.tsx     # Pie chart + KPI budget metrics
│   │   │   └── CostBreakdown.tsx     # Cost allocation matrix table
│   │   ├── common/
│   │   │   ├── Breadcrumb.tsx        # Page breadcrumb nav
│   │   │   ├── Modal.tsx             # Reusable modal dialog
│   │   │   └── Toast.tsx             # Toast notification system
│   │   ├── dashboard/
│   │   │   └── TripCard.tsx          # Saved itinerary card
│   │   ├── layout/
│   │   │   ├── Navbar.tsx            # Glassmorphic sticky navbar
│   │   │   └── Footer.tsx            # Footer with newsletter signup
│   │   ├── planner/
│   │   │   └── AILoading.tsx         # Animated AI generation loader
│   │   ├── timeline/
│   │   │   ├── Timeline.tsx          # Animated vertical day timeline
│   │   │   ├── DayCard.tsx           # Day plan card with swap modals
│   │   │   └── ActivityCard.tsx      # Individual activity item card
│   │   └── vendor/
│   │       └── VendorCard.tsx        # Local operator listing card
│   │
│   ├── context/
│   │   └── TripContext.tsx           # Global state + mock AI engine
│   │
│   ├── pages/
│   │   ├── Landing/                  # Hero + search + features
│   │   ├── Planner/                  # Multi-step AI planning wizard
│   │   ├── Results/                  # Itinerary view + budget dashboard
│   │   ├── Dashboard/                # Saved trips + impact metrics
│   │   ├── Vendors/                  # Local operator directory
│   │   ├── Login/                    # Authentication form
│   │   ├── Signup/                   # Registration form
│   │   ├── Profile/                  # User preferences
│   │   ├── Settings/                 # App settings & notifications
│   │   ├── About/                    # Mission & sustainability info
│   │   ├── Contact/                  # Contact form + FAQ accordion
│   │   └── NotFound/                 # 404 page
│   │
│   ├── services/
│   │   └── mockData.ts               # Mock AI itinerary generator engine
│   │
│   ├── types/
│   │   └── index.ts                  # TypeScript domain interfaces
│   │
│   ├── App.tsx                       # Root router + layout
│   ├── main.tsx                      # React entry point
│   └── index.css                     # Tailwind v4 theme + design system
│
├── index.html
├── vite.config.ts
├── postcss.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js **≥ 18**
- npm **≥ 9**

### Installation

```bash
# From the repository root
cd frontend
npm install
```

### Development

```bash
npm run dev
```

App runs at **http://localhost:5173** (or next available port).

### Production Build

```bash
npm run build
```

Output is in `dist/`. Preview the production build with:

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## 🗺️ Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero, AI search card, city showcase, testimonials |
| `/planner` | Planner | Multi-step wizard: destination → budget → interests → options |
| `/results` | Results | Day-by-day timeline, budget summary, AI replan trigger |
| `/dashboard` | Dashboard | Saved itineraries, community impact KPIs |
| `/vendors` | Vendors | Filterable local operator directory |
| `/login` | Login | Email + password auth, OAuth mock |
| `/signup` | Signup | Registration form with split layout |
| `/profile` | Profile | User preferences and saved trip archive |
| `/settings` | Settings | Theme, notifications, privacy controls |
| `/about` | About | Mission, sustainability values, team |
| `/contact` | Contact | Support form + FAQ accordion |
| `*` | 404 | Not found page |

---

## 🧠 Mock AI Engine

`src/services/mockData.ts` contains a fully client-side itinerary generator that simulates the backend AI agent. It:

1. Selects a city from the catalog (Goa, Wayanad, Manali)
2. Picks the best-fit homestay based on budget allocation (45% target)
3. Assigns local guides, activities, and transport based on interests
4. **Auto-replans** if total cost exceeds the budget cap (swaps stays, removes guides)
5. Calculates `localOperatorPercentage` — how much spending goes to local businesses

This is replaced by real backend calls once the API is connected.

---

## 🎨 Design System

The design is defined entirely in `src/index.css` using **Tailwind v4 CSS-native theming**:

```css
@theme {
  --color-primary:    #2563EB;   /* Blue */
  --color-secondary:  #14B8A6;   /* Teal */
  --color-accent:     #F59E0B;   /* Amber */
  --font-sans:        'Inter';
  --font-heading:     'Poppins';
}
```

### Utility Classes

| Class | Description |
|---|---|
| `.glass-card` | Frosted glass card with backdrop blur |
| `.glass-navbar` | Sticky translucent navigation bar |
| `.btn-primary` | Blue gradient CTA button |
| `.btn-secondary` | Teal gradient button |
| `.btn-outline` | Bordered ghost button |
| `.input-premium` | Styled form input with focus ring |
| `.gradient-bg` | Radial background gradient |
| `.local-glow` | Pulse animation for local operator badges |

---

## 🔌 Backend Integration

The frontend is ready to connect to the Node.js travel-planner-agent backend. Replace mock calls in `TripContext.tsx` with Axios requests:

```ts
// Example: Replace mock planTrip with real API call
const generated = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/plan`, {
  cityId, budget, days, travelers, travelStyle, interests, options
});
setCurrentItinerary(generated.data);
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 🌐 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | _(none)_ | Backend REST API base URL |

---

## 📦 Key Dependencies Explained

| Package | Purpose |
|---|---|
| `framer-motion` | Page transitions, timeline animations, modal enter/exit |
| `recharts` | Budget pie charts in Results page |
| `react-hook-form` + `zod` | Form validation on Planner, Login, Signup |
| `@tanstack/react-query` | Ready for caching API responses (auth, itineraries) |
| `axios` | HTTP client for backend API calls |
| `lucide-react` | All icons across the app |

---

## 📸 Screenshots

| Page | Description |
|---|---|
| **Landing** | Cinematic hero with AI trip configuration card |
| **Planner** | Multi-step wizard with budget slider and interest toggles |
| **Results** | Vertical day timeline with swap modals and live budget tracker |
| **Dashboard** | Saved trips grid + community impact statistics |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is part of the **TripWay** platform. All rights reserved © 2026 Akshay H.

---

<div align="center">
  <strong>Built with ❤️ to support local travel communities across India</strong>
</div>
