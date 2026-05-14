/**
 * ComponentShowcase.jsx
 * Demo component showcasing all premium UI components
 * Use this as reference for implementing components in your pages
 */

import React, { useState } from 'react';
import {
  Button,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  StatCard,
  HighlightCard,
  ExpandableCard,
  Input,
  Textarea,
  Select,
  Checkbox,
  FormGroup,
  Skeleton,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonTable,
} from '../ui';
import { useToast } from '../../context/ToastContext';
import {
  CheckCircleIcon,
  ExclamationIcon,
  InformationCircleIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  SaveIcon,
  TrashIcon,
  SettingsIcon,
} from '@heroicons/react/outline';

export default function ComponentShowcase() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    subscribe: false,
  });
  const [errors, setErrors] = useState({});

  // Simulate async action
  const handleAsync = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    toast.success('Action completed!');
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email.includes('@')) newErrors.email = 'Invalid email';
    if (!formData.country) newErrors.country = 'Please select a country';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors below');
      return;
    }

    setErrors({});
    toast.success('Form submitted successfully!', {
      title: 'Success',
      action: {
        label: 'View Details',
        onClick: () => console.log(formData),
      },
    });
  };

  return (
    <div className="space-y-12 p-6 bg-white dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Premium Component Showcase
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Explore all available UI components with examples
        </p>
      </div>

      {/* ============================================================================ */}
      {/* BUTTON COMPONENTS */}
      {/* ============================================================================ */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Button Components
        </h2>

        <Card padding="lg" elevation="md">
          <div className="space-y-6">
            {/* Variants */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Variants (md size)
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="success">Success</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Sizes
              </h3>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                States
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" disabled>
                  Disabled
                </Button>
                <Button variant="primary" loading onClick={handleAsync}>
                  {loading ? 'Loading...' : 'Click to Load'}
                </Button>
                <Button variant="primary" fullWidth>
                  Full Width
                </Button>
              </div>
            </div>

            {/* With Icons */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                With Icons
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button icon={SaveIcon} iconPosition="left">
                  Save
                </Button>
                <Button icon={TrashIcon} iconPosition="right" variant="danger">
                  Delete
                </Button>
                <IconButton icon={SettingsIcon} variant="ghost" size="md" />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ============================================================================ */}
      {/* CARD COMPONENTS */}
      {/* ============================================================================ */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Card Components
        </h2>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Users"
            value="12,345"
            description="Active users"
            icon={UserIcon}
            trend="12%"
            trendPositive={true}
          />
          <StatCard
            title="Revenue"
            value="$54,321"
            description="This month"
            icon={CheckCircleIcon}
            trend="8%"
            trendPositive={true}
          />
          <StatCard
            title="Errors"
            value="23"
            description="Requires attention"
            icon={ExclamationIcon}
            trend="5%"
            trendPositive={false}
          />
          <StatCard
            title="Performance"
            value="98.5%"
            description="System uptime"
            icon={InformationCircleIcon}
            trend="0.5%"
            trendPositive={true}
          />
        </div>

        {/* Standard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Card */}
          <Card elevation="md">
            <CardHeader>
              <CardTitle>Standard Card</CardTitle>
              <CardDescription>With header and footer</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                This is a standard card with composed header, content, and footer sections.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">
                Cancel
              </Button>
              <Button variant="primary" size="sm">
                Save
              </Button>
            </CardFooter>
          </Card>

          {/* Highlight Card */}
          <HighlightCard>
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-200">
                  Premium Feature
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                  This is a featured highlight card for important announcements
                </p>
              </div>
            </div>
          </HighlightCard>

          {/* Interactive Card */}
          <Card elevation="md" hoverable interactive>
            <CardTitle className="mb-3">Interactive Card</CardTitle>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Hover over this card to see the elevation effect
            </p>
            <Button variant="ghost" size="sm">
              Learn More
            </Button>
          </Card>

          {/* Expandable Card */}
          <ExpandableCard title="Advanced Options">
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Hidden content is revealed when expanding this card
              </p>
              <Checkbox label="Enable experimental features" />
              <Checkbox label="Send usage analytics" />
            </div>
          </ExpandableCard>
        </div>
      </section>

      {/* ============================================================================ */}
      {/* INPUT COMPONENTS */}
      {/* ============================================================================ */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Input & Form Components
        </h2>

        <Card padding="lg" elevation="md">
          <form onSubmit={handleFormSubmit}>
            <FormGroup>
              {/* Text Input */}
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                icon={UserIcon}
                value={formData.name}
                onChange={handleFormChange}
                name="name"
                error={errors.name}
                success={formData.name && !errors.name}
                required
              />

              {/* Email Input */}
              <Input
                label="Email Address"
                type="email"
                placeholder="your@email.com"
                icon={EnvelopeIcon}
                value={formData.email}
                onChange={handleFormChange}
                name="email"
                error={errors.email}
                success={formData.email && !errors.email}
                helperText="We'll never share your email"
                required
              />

              {/* Password Input */}
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={LockClosedIcon}
                helperText="Minimum 8 characters"
              />

              {/* Select Dropdown */}
              <Select
                label="Country"
                placeholder="Choose your country"
                value={formData.country}
                onChange={handleFormChange}
                name="country"
                error={errors.country}
                options={[
                  { label: 'United States', value: 'us' },
                  { label: 'United Kingdom', value: 'uk' },
                  { label: 'Canada', value: 'ca' },
                  { label: 'India', value: 'in' },
                ]}
                required
              />

              {/* Textarea */}
              <Textarea
                label="Message"
                placeholder="Enter your message here"
                rows={4}
                helperText="Maximum 500 characters"
              />

              {/* Checkbox */}
              <Checkbox
                label="I agree to the terms and conditions"
                checked={formData.subscribe}
                onChange={handleFormChange}
                name="subscribe"
              />
            </FormGroup>

            {/* Submit Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button variant="outline" type="reset">
                Reset
              </Button>
              <Button variant="primary" type="submit">
                Submit Form
              </Button>
            </div>
          </form>
        </Card>
      </section>

      {/* ============================================================================ */}
      {/* SKELETON LOADERS */}
      {/* ============================================================================ */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Skeleton Loaders
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Skeleton */}
          <Card elevation="sm" className="!p-0 overflow-hidden">
            <SkeletonCard lines={2} />
          </Card>

          {/* Table Skeleton */}
          <Card elevation="sm" className="!p-0 overflow-hidden">
            <SkeletonTable rows={3} columns={3} />
          </Card>

          {/* Avatar Skeleton */}
          <Card padding="lg">
            <div className="flex items-center gap-4">
              <SkeletonAvatar size="lg" />
              <div className="flex-1 space-y-2">
                <SkeletonAvatar size="xs" />
                <SkeletonAvatar size="xs" />
              </div>
            </div>
          </Card>

          {/* Profile Skeleton */}
          <Card elevation="sm" className="!p-0 overflow-hidden">
            <SkeletonTable rows={4} columns={1} />
          </Card>
        </div>
      </section>

      {/* ============================================================================ */}
      {/* TOAST NOTIFICATIONS */}
      {/* ============================================================================ */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Toast Notifications
        </h2>

        <Card padding="lg" elevation="md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="success"
              onClick={() => toast.success('This is a success message!', { title: 'Success' })}
            >
              Success Toast
            </Button>
            <Button
              variant="danger"
              onClick={() => toast.error('An error occurred!', { title: 'Error' })}
            >
              Error Toast
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.warning('Be careful with this action!', { title: 'Warning' })}
            >
              Warning Toast
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.info('This is some useful information', { title: 'Info' })}
            >
              Info Toast
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast.success('Item deleted', {
                  duration: 0,
                  action: {
                    label: 'Undo',
                    onClick: () => toast.info('Item restored'),
                  },
                })
              }
            >
              Toast with Action
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                toast.success('Autosaving...');
                setTimeout(() => toast.success('Saved!'), 1000);
              }}
            >
              Multiple Toasts
            </Button>
          </div>
        </Card>
      </section>

      {/* ============================================================================ */}
      {/* RESPONSIVE GRID */}
      {/* ============================================================================ */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Responsive Layout
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} elevation="md" hoverable>
              <CardTitle>Card {i}</CardTitle>
              <CardDescription>Responsive grid item</CardDescription>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                This grid is responsive: 1 column on mobile, 2 on tablet, 3 on desktop
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          All components are fully styled, animated, and production-ready. Import them from the ui/ directory.
        </p>
      </div>
    </div>
  );
}
