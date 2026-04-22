# Dashboard UI Refactor - Complete Guide

## Overview
Complete redesign of the AI Attendance System dashboards with a structured, component-based layout. All new components are clean, modular, and follow a consistent design system.

## Design System

### Layout Structure
- **Left Sidebar**: Fixed 240px width, white background
- **Top Navbar**: Fixed 64px height, white background
- **Main Content**: Max-width 1280px (7xl), centered with padding
- **Background**: Light gray (#f8fafc)

### Color Palette
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#FBBF24)
- Error: Red (#EF4444)
- Purple: #A855F7
- Orange: #F97316

### Spacing
- Base Unit: 4px (Tailwind default)
- Gaps: gap-6 (24px), gap-4 (16px)
- Padding: p-6 (24px), p-4 (16px)
- Margin: mb-8 (32px), mb-6 (24px)

### Border Radius
- Cards: rounded-xl (12px)
- Buttons: rounded-lg (8px)
- Inputs: rounded-lg (8px)

### Shadows
- Cards: border border-gray-200
- Hover: hover:bg-gray-50 or hover:shadow-md

## Components

### 1. DashboardLayout
**Purpose**: Main wrapper component that combines sidebar, navbar, and content area
**Props**:
- `sidebar` (ReactNode) - Sidebar component
- `navbar` (ReactNode) - Navbar component
- `children` (ReactNode) - Page content

**Usage**:
```jsx
<DashboardLayout sidebar={<Sidebar />} navbar={<Topbar />}>
  {/* Your page content */}
</DashboardLayout>
```

### 2. Sidebar
**Purpose**: Fixed left navigation (240px width)
**Features**:
- Role-based menu (admin, faculty, student)
- Logo section
- Active route indicator
- User info section
- Logout button

### 3. Topbar
**Purpose**: Top navigation bar (64px height)
**Features**:
- Search bar
- Notifications button
- User profile dropdown

### 4. StatCard
**Purpose**: Display key metrics with icon and title
**Props**:
- `icon` (Component) - React Icon
- `label` (string) - Metric label
- `value` (string/number) - Metric value
- `change` (number) - % change
- `changeType` ("positive"|"negative") - Direction
- `color` ("blue"|"green"|"purple"|"orange"|"red") - Color theme

**Usage**:
```jsx
<StatCard
  icon={HiUsers}
  label="Total Students"
  value={1234}
  change={5}
  changeType="positive"
  color="blue"
/>
```

### 5. ChartCard
**Purpose**: Wrapper component for charts
**Props**:
- `title` (string) - Chart title
- `subtitle` (string) - Optional subtitle
- `loading` (boolean) - Loading state
- `children` (ReactNode) - Chart content

**Usage**:
```jsx
<ChartCard title="Attendance Trend">
  {/* Chart library component */}
</ChartCard>
```

### 6. AlertCard
**Purpose**: Display alerts/notifications
**Props**:
- `type` ("info"|"success"|"warning"|"error") - Alert type
- `title` (string) - Alert title
- `message` (string) - Alert message
- `onClose` (function) - Close handler

**Color Mapping**:
- info: Blue
- success: Green
- warning: Yellow
- error: Red

**Usage**:
```jsx
<AlertCard
  type="warning"
  title="Low Attendance"
  message="15 students below 75%"
  onClose={() => handleClose()}
/>
```

### 7. DataTable
**Purpose**: Display tabular data
**Props**:
- `title` (string) - Table title
- `subtitle` (string) - Optional subtitle
- `columns` (Array) - Column configuration
- `data` (Array) - Row data
- `loading` (boolean) - Loading state

**Column Configuration**:
```jsx
[
  { key: 'name', label: 'Name' },
  {
    key: 'status',
    label: 'Status',
    render: (value) => <span>{value}</span>
  }
]
```

**Usage**:
```jsx
<DataTable
  title="Students"
  columns={columns}
  data={students}
/>
```

### 8. ProgressBar
**Purpose**: Display progress indicator
**Props**:
- `value` (number) - Current value
- `max` (number) - Maximum value (default: 100)
- `label` (string) - Progress label
- `showPercentage` (boolean) - Show % text
- `color` ("blue"|"green"|"yellow"|"red"|"purple") - Color

**Usage**:
```jsx
<ProgressBar
  value={80}
  max={100}
  label="Attendance"
  color="green"
/>
```

## Refactored Dashboard Pages

### AdminDashboard
**Location**: `/pages/AdminDashboard.jsx`
**Sections**:
1. **KPI Row**: 4 StatCards (students, faculty, attendance %, sessions)
2. **Chart Row**: 2 ChartCards (attendance trend, department comparison)
3. **Alerts**: AlertCards for warnings
4. **Activity Table**: DataTable with recent activities

### StudentDashboard
**Location**: `/pages/StudentDashboard.jsx`
**Sections**:
1. **KPI Row**: 4 StatCards (present, absent, rate, to safe)
2. **Alert**: Optional warning for low attendance
3. **Main Content**:
   - Overall attendance ProgressBar
   - Subject-wise breakdown with ProgressBars
4. **Records Table**: DataTable with attendance history

### FacultyDashboard
**Location**: `/pages/FacultyDashboard.jsx`
**Sections**:
1. **KPI Row**: 3 StatCards (classes, students marked, sessions)
2. **Session Alert**: Live feedback when session active
3. **Main Content**:
   - Camera preview (video element)
   - Session timer
   - Recognized students list
4. **Sidebar**:
   - Session summary stats
   - Today's sessions recap
5. **Records Table**: DataTable with completed sessions

## File Structure
```
frontend/src/
├── components/
│   └── dashboard/
│       ├── DashboardLayout.jsx
│       ├── Sidebar.jsx
│       ├── Topbar.jsx
│       ├── StatCard.jsx
│       ├── ChartCard.jsx
│       ├── AlertCard.jsx
│       ├── DataTable.jsx
│       ├── ProgressComponents.jsx
│       └── index.js
├── pages/
│   ├── AdminDashboard.jsx
│   ├── StudentDashboard.jsx
│   └── FacultyDashboard.jsx
```

## How to Update Routes

**In App.jsx**:
```jsx
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';

<Routes>
  {/* Replace old routes */}
  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/student" element={<StudentDashboard />} />
  <Route path="/faculty" element={<FacultyDashboard />} />
</Routes>
```

## Design Features

### Clean & Minimal
- No gradient banners
- No dark heavy cards
- White cards with subtle borders
- Light background

### Responsive
- Mobile: Single column
- Tablet (md): 2 columns
- Desktop (lg): 3-4 columns

### Accessible
- Semantic HTML
- Proper heading hierarchy
- Color + text for alerts
- Clear button states

### Consistent
- Uniform spacing (8px grid)
- Consistent shadows (borders)
- Standardized colors
- Reusable components

## Next Steps

### To Add Charts
Install Recharts:
```bash
npm install recharts
```

Then use in ChartCard:
```jsx
<ChartCard title="Attendance Trend">
  <LineChart data={data}>
    <Line type="monotone" dataKey="attendance" />
  </LineChart>
</ChartCard>
```

### To Connect APIs
Replace mock data with API calls:
```jsx
useEffect(() => {
  fetchData().then(setStats);
}, []);
```

### To Add More Features
1. Create new component in `/components/dashboard/`
2. Import in dashboard page
3. Use in layout grid

## Tailwind Classes Used

### Spacing
- `p-6`, `p-4` - Padding
- `px-6`, `py-3` - Pad axis
- `mb-8`, `mb-6`, `mt-1` - Margins
- `gap-6`, `gap-4` - Flex/Grid gaps
- `space-y-3`, `space-y-6` - Vertical spacing between children

### Typography
- `text-3xl`, `text-lg`, `text-sm`, `text-xs` - Font sizes
- `font-bold`, `font-semibold`, `font-medium` - Font weights
- `text-gray-900`, `text-gray-700`, `text-gray-500` - Text colors

### Backgrounds
- `bg-white`, `bg-gray-50`, `bg-slate-50` - Card backgrounds
- `bg-blue-100`, `bg-green-100` - Accent backgrounds
- `dark:bg-*` - Dark mode (removed from new design)

### Borders
- `border`, `border-gray-200` - Border
- `border-t`, `border-b`, `border-l`, `border-r` - Directional
- `rounded-xl`, `rounded-lg` - Border radius

### Interactive
- `hover:bg-gray-50`, `hover:text-gray-700` - Hover states
- `transition-colors` - Smooth transitions
- `cursor-pointer` - Interactive elements

### Layout
- `flex`, `flex-col`, `items-center`, `justify-between` - Flexbox
- `grid`, `grid-cols-1`, `md:grid-cols-2`, `lg:grid-cols-4` - Grid
- `absolute`, `relative`, `fixed` - Positioning
- `w-full`, `w-60`, `max-w-7xl` - Width

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers

---

**Status**: ✅ Ready for Integration
**Last Updated**: April 1, 2026
