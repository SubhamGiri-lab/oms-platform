'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Package,
  Users,
  FileText,
  Settings,
  ChevronDown,
  Menu,
  X,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);

  const menuItems = [
    {
      icon: BarChart3,
      label: 'Dashboard',
      href: '/dashboard',
      badge: null
    },
    {
      icon: ShoppingCart,
      label: 'Orders',
      href: '/orders',
      subItems: [
        { label: 'All Orders', href: '/orders' },
        { label: 'Create Order', href: '/orders/create' },
        { label: 'Pending', href: '/orders?status=pending' }
      ]
    },
    {
      icon: Users,
      label: 'Customers',
      href: '/customers',
      subItems: [
        { label: 'All Customers', href: '/customers' },
        { label: 'Add Customer', href: '/customers/create' }
      ]
    },
    {
      icon: Package,
      label: 'Inventory',
      href: '/inventory',
      subItems: [
        { label: 'Products', href: '/inventory' },
        { label: 'Low Stock', href: '/inventory?filter=low-stock' },
        { label: 'Add Product', href: '/inventory/create' }
      ]
    },
    {
      icon: TrendingUp,
      label: 'Analytics',
      href: '/analytics',
      subItems: [
        { label: 'Sales', href: '/analytics' },
        { label: 'Reports', href: '/analytics/reports' }
      ]
    },
    {
      icon: FileText,
      label: 'Documents',
      href: '/documents'
    }
  ];

  const isActive = (href) => pathname === href || pathname?.startsWith(href + '/');

  const toggleMenu = (label) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-slate-200 shadow-lg dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static inset-y-0 left-0 w-72 border-r border-slate-200/80 bg-white/95 shadow-xl shadow-slate-900/5 transition-transform duration-300 z-40 flex flex-col dark:border-slate-800 dark:bg-slate-900/95 md:shadow-none`}
      >
        {/* Logo */}
        <div className="border-b border-slate-200/80 px-5 py-6 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 font-bold text-white shadow-lg shadow-blue-600/20">
              OMS
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 dark:text-slate-100">OMS</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Order Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav role="navigation" aria-label="Main navigation" className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.subItems ? (
                <button
                  type="button"
                  onClick={() => toggleMenu(item.label)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') toggleMenu(item.label);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                  aria-expanded={expandedMenu === item.label}
                  aria-controls={`${item.label}-sub`}
                >
                  <item.icon size={20} />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      expandedMenu === item.label ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                    isActive(item.href)
                      ? 'border border-blue-100 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )}

              {/* Sub-items */}
              {item.subItems && expandedMenu === item.label && (
                <div id={`${item.label}-sub`} className="ml-4 mt-2 space-y-1 border-l-2 border-slate-200/70 pl-2 dark:border-slate-700">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={`block rounded-lg px-4 py-2 text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
                        isActive(subItem.href)
                          ? 'bg-blue-50 font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                      }`}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive(subItem.href) ? 'page' : undefined}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="space-y-2 border-t border-slate-200/80 px-4 py-5 dark:border-slate-800">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-600 transition-all hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={() => setIsOpen(false)}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
