import Link from 'next/link';
import Logo from '@/components/Logo';
import { Globe, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const footerSections = [
    {
      title: 'Categories',
      links: [
        { label: 'Web & Full Stack Development', href: '/gigs?category=Web+Development' },
        { label: 'Cloud Architecture & DevOps', href: '/gigs?category=Cloud+Architecture' },
        { label: 'AI, Agents & Machine Learning', href: '/gigs?category=AI+%26+Machine+Learning' },
        { label: 'PostgreSQL & Distributed Systems', href: '/gigs?category=System+Architecture' },
        { label: 'CTO & Tech Strategy', href: '/gigs?category=Business+Strategy' },
      ],
    },
    {
      title: 'About',
      links: [
        { label: 'Careers', href: '#' },
        { label: 'Press & News', href: '#' },
        { label: 'Partnerships', href: '#' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
      ],
    },
    {
      title: 'Support & Security',
      links: [
        { label: 'Help & Support Desk', href: '/support' },
        { label: 'Trust & Safety', href: '/support' },
        { label: 'Block Appeal System', href: '/support' },
        { label: 'Check Account Standing', href: '/support/check-status' },
        { label: 'Cancellation & Refunds', href: '/support' },
      ],
    },
    {
      title: 'Community',
      links: [
        { label: 'Customer Stories', href: '#' },
        { label: 'Community Standards', href: '#' },
        { label: 'Forum & Discussions', href: '#' },
        { label: 'Events & Webinars', href: '#' },
        { label: 'Creator Blog', href: '#' },
      ],
    },
    {
      title: 'More From ConsulSphere',
      links: [
        { label: 'ConsulSphere Pro', href: '/providers' },
        { label: 'Unlimited Tier ($15/mo)', href: '/register?role=PROVIDER' },
        { label: 'Stripe Escrow Guarantee', href: '/support' },
        { label: 'Cloudinary Portfolios', href: '/support' },
        { label: 'Super Admin Console', href: '#' },
      ],
    },
  ];

  return (
    <footer className="w-full bg-white border-t border-slate-200 text-slate-600 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        {/* 5-Column Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {footerSections.map((sec) => (
            <div key={sec.title} className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 tracking-wide">
                {sec.title}
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                {sec.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-600 hover:text-[#1dbf73] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar (Fiverr Style) */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          
          {/* Logo & Copyright */}
          <div className="flex flex-wrap items-center gap-4">
            <Logo size="sm" />
            <span className="text-slate-500">© {new Date().getFullYear()} ConsulSphere International Ltd. All rights reserved.</span>
          </div>

          {/* Right Extras */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer">
              <Globe className="w-4 h-4" />
              <span className="font-semibold">English</span>
            </div>
            <span className="text-slate-400">|</span>
            <div className="font-semibold text-slate-600">
              USD ($)
            </div>
            <span className="text-slate-400">|</span>
            <div className="flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Stripe Escrow Protected</span>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
}
