import {
  LayoutDashboardIcon,
  ReceiptTextIcon,
  UsersIcon,
  BarChart3Icon,
  SearchCheckIcon,
  PackageIcon,
  SlidersHorizontalIcon,
  MessageSquareTextIcon,
  SettingsIcon,
  UserIcon,
  LucideIcon } from
'lucide-react';
import { SectionId } from '../types/navigation';
import { TKey } from './i18n';

export type NavGroup = 'Dashboard' | 'Sales' | 'Intelligence' | 'System';

export interface NavItem {
  id: SectionId;
  /** Translation key for the visible label */
  labelKey: TKey;
  icon: LucideIcon;
  group: NavGroup;
  usesPeriod: boolean;
  hidden?: boolean;
}

export const navGroups: {id: NavGroup;labelKey: TKey;showLabel: boolean;}[] = [
{ id: 'Dashboard', labelKey: 'navGroup.Dashboard', showLabel: false },
{ id: 'Sales', labelKey: 'navGroup.Sales', showLabel: true },
{ id: 'Intelligence', labelKey: 'navGroup.Intelligence', showLabel: true },
{ id: 'System', labelKey: 'navGroup.System', showLabel: false }];


export const navItems: NavItem[] = [
{ id: 'overview', labelKey: 'nav.overview', icon: LayoutDashboardIcon, group: 'Dashboard', usesPeriod: true },
{ id: 'transactions', labelKey: 'nav.transactions', icon: ReceiptTextIcon, group: 'Sales', usesPeriod: false },
{ id: 'customers', labelKey: 'nav.customers', icon: UsersIcon, group: 'Sales', usesPeriod: false },
{ id: 'analytics', labelKey: 'nav.analytics', icon: BarChart3Icon, group: 'Intelligence', usesPeriod: true },
{ id: 'rootcause', labelKey: 'nav.rootcause', icon: SearchCheckIcon, group: 'Intelligence', usesPeriod: true },
{ id: 'inventory', labelKey: 'nav.inventory', icon: PackageIcon, group: 'Intelligence', usesPeriod: false },
{ id: 'simulator', labelKey: 'nav.simulator', icon: SlidersHorizontalIcon, group: 'Intelligence', usesPeriod: true },
{ id: 'assistant', labelKey: 'nav.assistant', icon: MessageSquareTextIcon, group: 'Intelligence', usesPeriod: true },
{ id: 'settings', labelKey: 'nav.settings', icon: SettingsIcon, group: 'System', usesPeriod: false },
// Reached from the account menu in the top bar, not listed in the sidebar.
{ id: 'profile', labelKey: 'nav.profile', icon: UserIcon, group: 'System', usesPeriod: false, hidden: true }];