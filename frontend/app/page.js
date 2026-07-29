import Link from 'next/link';

const menuLinks = [
  { label: 'Dashboard', href: '/dashboard', description: 'View key metrics and recent activity.' },
  { label: 'Orders', href: '/orders', description: 'Browse, filter, and manage orders.' },
  { label: 'Customers', href: '/customers', description: 'View customer profiles and order history.' },
  { label: 'Inventory', href: '/inventory', description: 'Track products, stock levels, and restocking.' },
  { label: 'Analytics', href: '/analytics', description: 'Review sales reports and business insights.' },
  { label: 'Documents', href: '/documents', description: 'Access invoices, reports, and export tools.' }
];

export default function HomePage() {
  return (
    <div className="space-y-10 py-10">
      <div className="max-w-3xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Welcome to OMS</p>
        <h1 className="text-5xl font-bold tracking-tight text-slate-900">Order Management System</h1>
        <p className="text-lg text-slate-600">
          The OMS dashboard helps you manage orders, customers, inventory, analytics, and documents from one central interface.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {menuLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="card hover:shadow-lg transition-shadow border border-slate-200"
          >
            <div className="card-body">
              <h2 className="text-xl font-semibold text-slate-900">{link.label}</h2>
              <p className="mt-3 text-slate-600">{link.description}</p>
              <p className="mt-6 text-sm font-medium text-blue-600">Go to {link.label} →</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
