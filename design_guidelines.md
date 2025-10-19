# Design Guidelines: Fanny & Compagnie - Supermarket Management System

## Design Approach: Enterprise Data System

**Selected Approach:** Material Design 3 principles adapted for enterprise data management, with emphasis on clarity, efficiency, and role-based visual hierarchy.

**Justification:** This is a multi-role business management system requiring data-dense interfaces, complex workflows, and clear visual organization. Material Design provides robust patterns for tables, forms, and dashboards while maintaining professional aesthetics.

## Core Design Principles

1. **Role-Based Visual Identity:** Each module (Stock, Cashier, Client, HR, Supervisor) has subtle color coding for instant recognition
2. **Data Clarity First:** Typography and spacing optimized for scanning large datasets
3. **Workflow Efficiency:** Reduce clicks, prioritize frequently-used actions
4. **Touch-Friendly:** Cashier module optimized for rapid tapping/scanning operations

## Color Palette

### Primary Colors (Dark Mode Default)
- **Background Base:** 220 15% 12% (deep slate)
- **Surface:** 220 15% 16% (elevated cards)
- **Surface Elevated:** 220 15% 20% (modals, dropdowns)

### Primary Colors (Light Mode)
- **Background Base:** 0 0% 98% (soft white)
- **Surface:** 0 0% 100% (pure white cards)
- **Border:** 220 15% 90% (subtle dividers)

### Brand & Role Colors
- **Primary Brand (Fanny & Compagnie):** 145 65% 45% (fresh market green - vibrant, trustworthy)
- **Stock Module Accent:** 200 80% 50% (cyan blue)
- **Cashier Module Accent:** 280 65% 60% (purple)
- **Client Portal Accent:** 145 65% 45% (brand green)
- **HR Module Accent:** 25 85% 55% (warm orange)
- **Supervisor Accent:** 340 75% 55% (commanding red-pink)

### Functional Colors
- **Success (stock in):** 145 70% 45%
- **Warning (low stock):** 40 95% 55%
- **Danger (expired):** 0 75% 55%
- **Info (notifications):** 210 90% 55%

### Text Colors (Dark Mode)
- **Primary Text:** 0 0% 95%
- **Secondary Text:** 0 0% 70%
- **Muted Text:** 0 0% 50%

### Text Colors (Light Mode)
- **Primary Text:** 220 20% 15%
- **Secondary Text:** 220 15% 40%
- **Muted Text:** 220 10% 60%

## Typography

**Font Stack:** Inter (primary), -apple-system, system-ui (fallback)

### Hierarchy
- **Dashboard Headers:** 32px/2rem, semibold (600)
- **Section Titles:** 24px/1.5rem, semibold (600)
- **Card Headers:** 18px/1.125rem, medium (500)
- **Body Text:** 15px/0.9375rem, regular (400)
- **Table Data:** 14px/0.875rem, regular (400)
- **Labels/Captions:** 13px/0.8125rem, medium (500)
- **Small Print (receipts):** 12px/0.75rem, regular (400)

**Line Height:** 1.5 for body text, 1.2 for headings

## Layout System

**Spacing Primitives:** Tailwind units of 1, 2, 4, 6, 8, 12, 16 for consistency

### Grid Structure
- **Sidebar Navigation:** Fixed 260px (collapsed: 72px icon-only)
- **Main Content:** Fluid with max-width-7xl container
- **Dashboard Widgets:** CSS Grid - 4 columns desktop, 2 tablet, 1 mobile
- **Data Tables:** Full-width within container with horizontal scroll

### Responsive Breakpoints
- Mobile: < 768px (single column, stacked cards)
- Tablet: 768px - 1024px (2-column grids)
- Desktop: ≥ 1024px (full multi-column layouts)

## Component Library

### Navigation
- **Top Bar:** Fixed height 64px, contains module name, user avatar, notifications bell, role indicator badge
- **Sidebar:** Collapsible with icons + labels, active state with accent color + background tint
- **Breadcrumbs:** For deep navigation (Stock > Products > Electronics > Edit)

### Data Display

**Tables (Critical Component):**
- Alternating row backgrounds for readability
- Sticky headers on scroll
- Sortable columns with arrow indicators
- Row actions (Edit/Delete) appear on hover
- Pagination at bottom (25/50/100 items per page)
- Search/filter bar above table
- Zebra striping in light mode, subtle borders in dark mode

**Cards:**
- Elevated surface with 8px radius
- 16px padding for compact info, 24px for detailed cards
- Header with icon + title, optional action menu (three dots)
- Used for: Product cards, employee profiles, statistics widgets

**Statistics Widgets (Supervisor Dashboard):**
- Large number display (32px) with label below
- Trend indicator (↑↓ with percentage change)
- Sparkline graphs for historical context
- 4-column grid on desktop

### Forms

**Input Fields:**
- Height: 44px (touch-friendly)
- Border radius: 6px
- Label above input (12px top margin)
- Placeholder text in muted color
- Error states: red border + helper text below
- Required fields marked with red asterisk

**Form Layout:**
- Two-column for related fields (First Name | Last Name)
- Full-width for text areas, selects
- Action buttons right-aligned (Cancel | Save)

**Special Inputs:**
- Date pickers with calendar dropdown
- Barcode scanner button integrated in product search
- QR code scanner camera interface for cashier module
- Numeric keypad overlay for quantity/price entry (cashier)

### Buttons

**Primary Actions:**
- Height: 44px
- Border radius: 6px
- Background: Role accent color
- Text: White, 15px medium weight
- Examples: "Add Product", "Complete Sale", "Approve Leave"

**Secondary Actions:**
- Outlined variant with 2px border
- Background: Transparent
- Text and border: Accent color

**Icon Buttons:**
- 40px square for toolbar actions
- Circular 36px for floating actions

### Alerts & Notifications

**Alert Cards:**
- Warning (low stock): Yellow-tinted background, warning icon
- Danger (expired): Red-tinted background, alert icon
- Success: Green-tinted background, checkmark icon
- Positioned in dedicated alerts section (Stock Manager dashboard)

**Toast Notifications:**
- Slide from top-right
- 4-second auto-dismiss
- Action button for critical alerts (e.g., "View Expired Products")

### Modals & Overlays

**Modal Dialogs:**
- Max-width: 600px for forms, 900px for complex workflows
- Backdrop: 40% opacity black
- Centered vertically and horizontally
- Close X button top-right
- Used for: Add/Edit forms, confirmation dialogs, preview receipts

### Specialized Components

**Cashier POS Interface:**
- Left panel (60%): Product search + scanned items list
- Right panel (40%): Cart summary, total, payment methods
- Large touch-friendly product grid if browsing
- Prominent "Complete Sale" button (green, 56px height)

**Receipt Preview:**
- White background (for printing)
- Monospace font for alignment
- Store header with logo placeholder
- Itemized list with quantities and prices
- Subtotal, discount, total clearly separated
- QR code for digital receipt at bottom

**Client Loyalty Card:**
- Card-like design (resembling physical card)
- Client name prominent at top
- Large QR code centered (for scanning)
- Points display and progress bar
- "5% Discount Available" badge when eligible

**Stock Management Scanner:**
- Camera viewfinder interface
- Crosshair targeting overlay
- Manual barcode entry fallback
- Immediate product info display after scan

## Dashboard Layouts

### Stock Manager Dashboard
- Alerts panel at top (full-width, dismissible cards)
- 3-column grid: Low Stock | Expiring Soon | Recently Added
- Main table below: All lots with FEFO highlighting

### Supervisor Dashboard  
- KPI widget grid (4 columns): Revenue | Expenses | Net Profit | Active Products
- Charts section: Sales trends (line chart), Category breakdown (pie chart)
- Tables: Top selling products, Recent transactions

### Cashier Interface
- Minimal navigation (focused on transaction)
- Large product search/scan area
- Shopping cart always visible
- Quick access to common products (category tabs)

## Accessibility & Usability

- **Keyboard Navigation:** Full tab support, visible focus rings
- **Screen Reader:** Proper ARIA labels on all interactive elements
- **High Contrast Mode:** Text meets WCAG AA standards
- **Touch Targets:** Minimum 44x44px for mobile/tablet
- **Loading States:** Skeleton screens for tables, spinners for actions
- **Error Prevention:** Confirmation dialogs for destructive actions (delete lot, remove employee)

## Animation Philosophy

**Minimal and Purposeful:**
- Page transitions: None (instant)
- Modal entrance: 200ms fade + scale from 95% to 100%
- Dropdown menus: 150ms slide-down
- Button feedback: Subtle scale (98%) on press
- Table row hover: Instant background color change
- Success confirmations: Checkmark icon with subtle bounce

**No animations for:** Data updates, table sorting, form validation states