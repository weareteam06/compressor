import { MapPin, Phone } from 'lucide-react';
import type { SiteConfig } from '@/lib/data';

interface FooterProps {
  config: SiteConfig;
  onNavigate: (page: string, param?: string) => void;
}

const logoWhiteUrl = 'https://www.firstaircompressor.com/wp-content/uploads/files/2024/logo-white.svg';

export default function Footer({ config, onNavigate }: FooterProps) {
  const links = [
    { id: 'home', label: 'Home' },
    { id: 'products', label: 'Products' },    
    { id: 'about-story', label: 'About Us' },
    { id: 'technical', label: 'Technical Information' },
    { id: 'warranty', label: 'Warranty Information' },
    { id: 'news', label: 'News' },
    { id: 'contact', label: 'Contact Us' },
  ];

  return (
    <footer className="bg-slate-950 text-white">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8 py-14 grid lg:grid-cols-[1.2fr_0.8fr_0.8fr] gap-10">
        <div>
          <img src={logoWhiteUrl} alt="firstAir Compressor" className="h-12 w-auto mb-6" />
          <p className="text-white/65 leading-relaxed max-w-md">{config.about.storyShort}</p>
        </div>

        <div>
          <h4 className="text-sm font-black uppercase tracking-[0.25em] text-red-400 mb-5">firstAir</h4>
          <div className="space-y-3">
            {links.map(link => (
              <button key={link.id} onClick={() => onNavigate(link.id)} className="block text-sm text-white/70 hover:text-white font-bold">
                {link.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-black uppercase tracking-[0.25em] text-red-400 mb-5">Contact Us</h4>
          <div className="space-y-4 text-sm text-white/80">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
              <div>
                <div className="font-black text-white">Factory contact Number</div>
                <a href="tel:+918956964864" className="hover:text-white">(+91) 8956994864</a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
              <div>
                <div className="font-black text-white">For Sales &amp; Service Enquiry</div>
                <a href="tel:+918600875555" className="hover:text-white">(+91) 7420056998</a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
              <address className="not-italic leading-relaxed">
                <div className="font-black text-white">FS Compressors India Pvt. Ltd.</div>
                <div>PAP Plot No. S-3, Chakan MIDC Industrial Area,</div>
                <div>Phase II, Savardari, Taluka- Khed,</div>
                <div>Dist- Pune, Maharashtra - 410501</div>
              </address>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-5 lg:px-8 py-5 text-xs text-white/50">
          (c) {new Date().getFullYear()} - {config.company.name} | All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
