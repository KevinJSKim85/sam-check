# SAM-CHECK Design Specification

## 1. Brand Identity

### Logo
- Checkmark icon: 두 개의 겹치는 캡슐 스트로크 (navy + sky blue)
- Text: "SAM-CHECK" in bold geometric sans-serif
- Variants: light background / dark background
- Logo component: `src/components/brand/logo.tsx`

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary (Navy)** | `#272B6B` | Header text, buttons, footer bg, primary actions |
| Primary-50 | `#eef0fa` | Light backgrounds, hover states |
| Primary-100 | `#d5d7f0` | Badges, highlights |
| Primary-600 | `#22265e` | Hover states on primary |
| Primary-900 | `#111436` | Dark backgrounds |
| **Accent (Sky Blue)** | `#5EC3E0` | Checkmark, badges, trust signals |
| Accent-50 | `#ecf9fc` | Light accent backgrounds |
| Accent-700 | `#247a93` | Dark accent text |
| **CTA (Orange)** | `#FFA500` | Call-to-action buttons |
| CTA-600 | `#e28800` | CTA hover |
| **Body Text** | `#5A5E82` | Body copy, descriptions |
| **Background** | `#f8fafc` (slate-50) | Page background |
| **White** | `#FFFFFF` | Cards, header background |

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| **Font Family** | Nunito (Google Fonts) | - | - |
| H1 | Nunito | 700 (Bold) | 3xl-6xl (responsive) |
| H2 | Nunito | 700 | 2xl-3xl |
| H3 | Nunito | 600 (Semibold) | lg |
| Body | Nunito | 400 (Regular) | base (16px) |
| Small | Nunito | 400 | sm (14px) |
| Nav links | Nunito | 600 | sm |
| Logo text | Nunito | 800 (ExtraBold) | lg |
| Badges | Nunito | 500 | sm |

### Spacing System
- Base unit: 4px
- Common spacings: 8, 12, 16, 20, 24, 32, 40, 48, 64px
- Card padding: 16-24px
- Section gap: 64px (gap-16)
- Page max-width: 1152px (max-w-6xl)
- Page horizontal padding: 16px (mobile), 24px (tablet), 32px (desktop)

### Border Radius
- Cards: 16px (rounded-2xl)
- Inner elements: 12px (rounded-xl)
- Buttons: 9999px (rounded-full) for pill style, 12px for standard
- Badges: 9999px (rounded-full)
- Hero/sections: 24px (rounded-3xl)

---

## 2. Page Inventory

### Public Pages
| # | Page | URL | Description |
|---|------|-----|-------------|
| 1 | **Home** | `/` | Hero, stats, 3-step, trust, subjects, CTA |
| 2 | **Tutor Listing** | `/tutors` | Search, filters, tutor card list |
| 3 | **Tutor Detail** | `/tutors/[id]` | Profile, credentials, reviews, sticky CTA |
| 4 | **Login** | `/auth/login` | Social login (Kakao, Google) |
| 5 | **Signup** | `/auth/signup` | Social signup |
| 6 | **Privacy** | `/privacy` | Privacy policy |
| 7 | **Terms** | `/terms` | Terms of service |

### Authenticated Pages
| # | Page | URL | Description |
|---|------|-----|-------------|
| 8 | **Messages** | `/messages` | Message threads list |
| 9 | **Chat** | `/messages/[userId]` | Individual conversation |
| 10 | **Dashboard - Profile** | `/dashboard/profile` | Tutor profile editing |
| 11 | **Dashboard - Credentials** | `/dashboard/credentials` | Credential submission |

### Admin Pages
| # | Page | URL | Description |
|---|------|-----|-------------|
| 12 | **Admin - Credentials** | `/admin/credentials` | Review credential submissions |
| 13 | **Admin - Messages** | `/admin/messages` | Monitor messages |

---

## 3. Component Library

### Layout
- **Header**: White bg, logo left, nav center, auth right. Mobile: hamburger menu
- **Footer**: Navy bg, logo + copyright + legal links
- **Mobile Nav**: Sheet/drawer from right, navy background

### Cards
- **Tutor Card**: Responsive hybrid — horizontal (desktop), vertical (mobile)
  - Avatar (80-96px), name + verified badge, university, headline
  - Star rating, subject badges (max 3 + overflow)
  - Teaching mode, credential count, price, arrow indicator

### Buttons
- **Primary**: Navy bg, white text
- **CTA**: Orange bg, white text (main actions)
- **Accent**: Sky blue bg, white text
- **Outline**: White bg, border, dark text
- **Ghost**: Transparent, hover bg

### Badges
- **Verified**: Green border, green bg, shield icon
- **Subject**: Primary-50 bg, primary-800 text
- **Curriculum**: Accent-50 bg, accent-800 text
- **Filter tag**: Primary-50 bg, primary-800 text, removable

---

## 4. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|-----------|-------|----------------|
| Mobile | < 768px | Single column, hamburger nav, vertical cards |
| Tablet | 768-1024px | 2-column where needed |
| Desktop | > 1024px | Full layout, horizontal cards, sidebar on detail |

---

## 5. Reference

- **Design inspiration**: Preply.com (tutor marketplace)
- **Tech stack**: Next.js 16, Tailwind CSS 4, shadcn/ui (Base UI)
- **Icons**: Lucide React
- **i18n**: Korean (primary) + English

---

## 6. Screenshots

See `screenshots/` folder:
- `desktop/01-home.png` — Homepage (1280px)
- `desktop/02-tutors-listing.png` — Tutor listing page
- `desktop/03-login.png` — Login page
- `mobile/01-home-mobile.png` — Homepage mobile (375px)
