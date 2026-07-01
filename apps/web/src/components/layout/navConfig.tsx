import {
  Home,
  Search,
  CalendarCheck,
  Inbox,
  Heart,
  MessageSquare,
  Users,
  Bell,
  User,
  Building2,
  Megaphone,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Key into the badges map the shell passes to the sidebar. */
  badgeKey?: string;
}

/** Student surface navigation (designer.md §11 / plan §5). */
export const studentNav: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Search', href: '/search', icon: Search },
  { label: 'My bookings', href: '/bookings', icon: CalendarCheck },
  { label: 'Requests', href: '/requests', icon: Inbox },
  { label: 'Saved', href: '/saved', icon: Heart },
  { label: 'Messages', href: '/messages', icon: MessageSquare, badgeKey: 'messages' },
  { label: 'Community', href: '/community', icon: Users },
  { label: 'Notifications', href: '/notifications', icon: Bell, badgeKey: 'notifications' },
  { label: 'Profile', href: '/profile', icon: User },
];

/** Owner surface navigation. */
export const ownerNav: NavItem[] = [
  { label: 'Dashboard', href: '/owner', icon: LayoutDashboard },
  { label: 'New hostel', href: '/owner/hostels/new', icon: Building2 },
  { label: 'Bookings', href: '/owner/bookings', icon: CalendarCheck },
  { label: 'Requests', href: '/owner/requests', icon: Inbox },
  { label: 'Boost', href: '/owner/promotions', icon: Megaphone },
  { label: 'Messages', href: '/messages', icon: MessageSquare, badgeKey: 'messages' },
  { label: 'Notifications', href: '/notifications', icon: Bell, badgeKey: 'notifications' },
  { label: 'Profile', href: '/profile', icon: User },
];
