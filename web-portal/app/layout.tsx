import type { Metadata } from 'next';
import Link from 'next/link';
import { BarChart3, Users, Settings, FileText, TrendingUp } from 'lucide-react';
import './globals.css';

export const metadata: Metadata = {
  title: 'HOA Survey Analysis Dashboard',
  description: 'Comprehensive analysis of HOA landscaping survey responses',
  keywords: ['HOA', 'survey', 'landscaping', 'analysis', 'dashboard'],
  authors: [{ name: 'HOA Board' }],
  robots: 'noindex, nofollow', // Private dashboard
};

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: BarChart3,
    description: 'Overview and key metrics',
  },
  {
    name: 'Responses',
    href: '/responses',
    icon: Users,
    description: 'Browse all survey responses',
  },
  {
    name: 'Analysis',
    href: '/analysis',
    icon: TrendingUp,
    description: 'Detailed analysis and charts',
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    description: 'Generate custom reports',
  },
];

function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <BarChart3 className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                HOA Survey Dashboard
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-1"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <div className="text-sm text-gray-500">
              113 Survey Responses
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-500">
            <p>HOA Survey Analysis Dashboard</p>
            <p>Data collected and analyzed for community decision making</p>
          </div>
          <div className="flex space-x-6 text-sm text-gray-500">
            <span>Last updated: {new Date().toLocaleDateString()}</span>
            <span>•</span>
            <span>113 Total Responses</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col">
        <Navigation />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}