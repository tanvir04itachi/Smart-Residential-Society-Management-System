import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  ShieldCheck,
  Wallet,
  Megaphone,
  Waves,
  Bell,
  BarChart3,
  UserCircle,
  UsersRound,
} from 'lucide-react';
import { Role } from '@/types';
import type { ComponentType } from 'react';

export interface NavItem {
  key: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: [Role.MANAGER, Role.RESIDENT, Role.GUARD, Role.MAINTENANCE, Role.ACCOUNTANT],
  },
  { key: 'users', href: '/dashboard/users', icon: UsersRound, roles: [Role.MANAGER] },
  { key: 'residents', href: '/dashboard/residents', icon: Users, roles: [Role.MANAGER] },
  { key: 'flats', href: '/dashboard/flats', icon: Building2, roles: [Role.MANAGER] },
  {
    key: 'complaints',
    href: '/dashboard/complaints',
    icon: ClipboardList,
    roles: [Role.MANAGER, Role.RESIDENT, Role.MAINTENANCE],
  },
  {
    key: 'visitors',
    href: '/dashboard/visitors',
    icon: ShieldCheck,
    roles: [Role.MANAGER, Role.RESIDENT, Role.GUARD],
  },
  {
    key: 'billing',
    href: '/dashboard/billing',
    icon: Wallet,
    roles: [Role.MANAGER, Role.RESIDENT, Role.ACCOUNTANT],
  },
  {
    key: 'announcements',
    href: '/dashboard/announcements',
    icon: Megaphone,
    roles: [Role.MANAGER, Role.RESIDENT, Role.GUARD, Role.MAINTENANCE, Role.ACCOUNTANT],
  },
  {
    key: 'amenities',
    href: '/dashboard/amenities',
    icon: Waves,
    roles: [Role.MANAGER, Role.RESIDENT],
  },
  {
    key: 'notifications',
    href: '/dashboard/notifications',
    icon: Bell,
    roles: [Role.MANAGER, Role.RESIDENT, Role.GUARD, Role.MAINTENANCE, Role.ACCOUNTANT],
  },
  {
    key: 'reports',
    href: '/dashboard/reports',
    icon: BarChart3,
    roles: [Role.MANAGER, Role.ACCOUNTANT],
  },
  {
    key: 'profile',
    href: '/dashboard/profile',
    icon: UserCircle,
    roles: [Role.MANAGER, Role.RESIDENT, Role.GUARD, Role.MAINTENANCE, Role.ACCOUNTANT],
  },
];
