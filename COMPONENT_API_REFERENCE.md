# Component API Reference - Modern Dashboard System

## Layout Components

### MainLayout
Main wrapper component for dashboard pages with sidebar, topbar, and content area.

**Props:**
- `children` (ReactNode) - Page content
- `pageTitle` (string) - Page heading displayed in main area
- `onRefresh` (function) - Callback when refresh button clicked
- `isRefreshing` (boolean) - Show loading state on refresh button

**Example:**
```jsx
<MainLayout pageTitle="Admin Dashboard" onRefresh={handleRefresh} isRefreshing={loading}>
  {/* Your content here */}
</MainLayout>
```

### Sidebar
Navigation sidebar with role-based menu items.

**Features:**
- Auto-generates menu based on user role (admin/faculty/student)
- Mobile responsive toggle
- Active route indicator
- User info section
- Logout button

**Auto-accessible:** Automatically reads user role from AuthContext

### TopBar
Top navigation bar with search, notifications, and user profile.

**Props:**
- `onRefresh` (function) - Callback for refresh button
- `isRefreshing` (boolean) - Refresh button loading state

**Features:**
- Global search bar
- Notification center with unread counter
- User profile dropdown
- Dark mode indicator

---

## Dashboard Components

### KPICard
Key performance indicator card with trending data.

**Props:**
- `icon` (Component) - Heroicon component (required)
- `label` (string) - Metric label (required)
- `value` (string|number) - Metric value (required)
- `change` (number) - Percentage change
- `changeType` ("positive"|"negative") - Trend direction
- `color` ("blue"|"green"|"purple"|"orange"|"red") - Color theme
- `loading` (boolean) - Show skeleton loader

**Example:**
```jsx
<KPICard
  icon={HiOutlineUserGroup}
  label="Total Students"
  value={1234}
  change={5}
  changeType="positive"
  color="blue"
/>
```

### MetricCard
Compact metric display with status indicator.

**Props:**
- `icon` (Component) - Heroicon component
- `title` (string) - Metric title
- `value` (string|number) - Metric value
- `subtitle` (string) - Optional subtitle
- `status` ("normal"|"success"|"warning"|"critical") - Status color
- `onClick` (function) - Click handler

**Example:**
```jsx
<MetricCard
  icon={HiOutlineCheck}
  title="Present"
  value="42"
  subtitle="of 45 students"
  status="success"
/>
```

### AlertCard
Alert/notification component with dismissible option.

**Props:**
- `type` ("info"|"success"|"warning"|"error") - Alert type
- `title` (string) - Alert title
- `message` (string) - Alert message
- `action` ({ label: string }) - Optional action button
- `onClose` (function) - Dismiss callback
- `icon` (Component) - Custom icon (optional)

**Example:**
```jsx
<AlertCard
  type="warning"
  title="Low Attendance"
  message="15 students below 75%"
  action={{ label: 'View' }}
  onClose={() => removeAlert()}
/>
```

### AlertsList
Container for multiple alert cards with exit animations.

**Props:**
- `alerts` (Array) - Array of alert objects

**Example:**
```jsx
<AlertsList alerts={[
  { id: 1, type: 'warning', title: 'Alert', message: 'Content' },
]} />
```

### FilterBar
Expandable filter panel with dynamic inputs.

**Props:**
- `filters` (Array) - Filter configuration array
- `onFilter` (function) - Callback with active filters
- `onReset` (function) - Reset callback

**Filter Config Structure:**
```jsx
[
  {
    id: 'branch',
    label: 'Branch',
    type: 'select', // 'text', 'select', 'date'
    placeholder: 'Select branch',
    options: [
      { value: 'cse', label: 'Computer Science' },
    ]
  }
]
```

**Example:**
```jsx
<FilterBar
  filters={filterConfig}
  onFilter={(filters) => applyFilters(filters)}
  onReset={() => clearFilters()}
/>
```

### ProgressBar
Animated progress bar with optional label.

**Props:**
- `value` (number) - Current value
- `max` (number) - Maximum value (default: 100)
- `label` (string) - optional label
- `showPercentage` (boolean) - Show % display (default: true)
- `color` ("blue"|"green"|"yellow"|"red"|"purple") - Color theme
- `size` ("sm"|"md"|"lg") - Height size

**Example:**
```jsx
<ProgressBar
  value={75}
  max={100}
  label="Attendance"
  color="green"
/>
```

### AttendanceStatus
Visual attendance status component with indicators.

**Props:**
- `percentage` (number) - Attendance percentage
- `showDetails` (boolean) - Show breakdown details
- `className` (string) - Additional CSS classes

**Auto statuses:**
- >= 75%: Green "Safe"
- 60-75%: Yellow "Warning"  
- < 60%: Red "Critical"

**Example:**
```jsx
<AttendanceStatus
  percentage={78}
  showDetails={true}
/>
```

---

## UI Components (From /components/ui/)

### Button
Reusable button component with variants.

**Props:**
- `variant` ("primary"|"secondary"|"success"|"danger"|"outline"|"ghost")
- `size` ("sm"|"md"|"lg")
- `loading` (boolean) - Show spinner
- `disabled` (boolean)
- `children` (ReactNode) - Button text
- `icon` (Component) - Optional icon

**Example:**
```jsx
<Button variant="primary" size="md" loading={false}>
  Click Me
</Button>
```

### Card
Container card component with header and content sections.

**Exports:**
- `Card` - Main container
- `CardHeader` - Title section
- `CardTitle` - Large title
- `CardDescription` - Subtitle text
- `CardContent` - Main content area
- `CardFooter` - Bottom section
- `StatCard` - Stat display card
- `HighlightCard` - Highlighted alert card

**Example:**
```jsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Input / Textarea / Select
Form input components with label and error support.

**Example:**
```jsx
<Input
  label="Student Name"
  placeholder="Enter name"
  error={errors.name}
  onChange={(e) => setName(e.target.value)}
/>

<Select
  label="Branch"
  options={branches}
  onChange={(e) => setBranch(e.target.value)}
/>
```

### Skeleton
Loading skeleton placeholders.

**Exports:**
- `Skeleton` - Basic skeleton line
- `SkeletonCard` - Card skeleton
- `SkeletonAvatar` - Avatar skeleton
- `SkeletonTable` - Table skeleton

**Example:**
```jsx
<Skeleton count={3} />
<SkeletonCard lines={2} />
```

---

## Utility Hooks

### useAuth
Access authentication state from AuthContext.

```jsx
const { user, logout } = useAuth();
// user = { id, name, email, role }
```

### useToast
Display toast notifications.

```jsx
const { toast } = useToast();
toast.success('Operation successful');
toast.error('Something went wrong');
toast.warning('Please verify');
toast.info('Information message');
```

---

## Common Patterns

### Responsive Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {items.map(item => <KPICard key={item.id} {...item} />)}
</div>
```

### Loading State
```jsx
{loading ? (
  <SkeletonCard />
) : (
  <YourComponent data={data} />
)}
```

### Empty State
```jsx
{items.length === 0 ? (
  <Card>
    <CardContent className="text-center py-12">
      <p>No items found</p>
    </CardContent>
  </Card>
) : (
  <ItemsList items={items} />
)}
```

### Animation
```jsx
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.2 }}
>
  Content
</motion.div>
```

---

## Tailwind Classes Cheat Sheet

### Spacing
- `p-4` = padding 16px (1 grid unit = 8px)
- `m-6` = margin 24px
- `gap-4` = gap between flex/grid items (16px)
- `space-y-2` = vertical spacing between children (8px)

### Colors
- `text-gray-900 dark:text-white` - Text with dark mode
- `bg-blue-50 dark:bg-blue-900/20` - Background with transparency
- `border-gray-200 dark:border-gray-700` - Border with dark mode

### Sizing
- `w-full` = 100% width
- `max-w-md` = maximum width 448px
- `h-12` = height 48px
- `rounded-lg` = border-radius 8px

### Responsive
- `sm:` = 640px+
- `md:` = 768px+
- `lg:` = 1024px+
- `xl:` = 1280px+

### Flexbox
- `flex items-center justify-between` - Horizontal centering with space-between
- `flex-col` - Column direction
- `gap-4` - Space between items

---

## Dark Mode Support

All components automatically support dark mode. To enable:

```jsx
// In your root component
useEffect(() => {
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [isDarkMode]);
```

Then use `dark:` prefix in classes:
```jsx
<div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
  Content adapts to dark mode
</div>
```

---

## Tips & Best Practices

1. **Always pass required props** - Check prop requirements in component docs
2. **Use semantic HTML** - Cards for content, Buttons for actions
3. **Add loading states** - Use skeletons while fetching
4. **Handle errors** - Show AlertCard with actionable messages
5. **Mobile first** - Design for mobile, then enhance for desktop
6. **Accessibility** - Use proper heading hierarchy and alt text
7. **Performance** - Memoize expensive calculations
8. **Consistency** - Use same color/size throughout

---

**Last Updated:** April 1, 2026
**Version:** 1.0
