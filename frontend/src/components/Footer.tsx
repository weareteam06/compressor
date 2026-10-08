import { SiteText } from '@/lib/SiteText';
import { Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import type { SiteConfig } from '@/lib/data';
import { OPEN_COOKIE_PREFERENCES_EVENT } from '@/lib/cookieConsent';

interface FooterProps {
  config: SiteConfig;
  onNavigate: (page: string, param?: string) => void;
}

export default function Footer({ config, onNavigate }: FooterProps) {
  const { productLinks, companyLinks } = config.publicContent;
  const salesPhone = config.contact.salesPhone;
  const logoWhiteUrl = config.publicContent.footer.logoUrl;
  const hasPhysicalAddress = !/^contact\b/i.test(config.contact.headquarters.address.trim());
  const socialLinks = [
    { label: 'LinkedIn', href: config.social.linkedin, icon: LinkedInIcon },
    { label: 'Facebook', href: config.social.facebook, icon: FacebookIcon },
    { label: 'Instagram', href: config.social.instagram, icon: InstagramIcon },
  ].filter(link => link.href);

  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.75fr_0.75fr_1.1fr] lg:px-8 lg:py-14">
        <div className="sm:col-span-2 lg:col-span-1">
          <button type="button" onClick={() => onNavigate('home')} className="block" aria-label="Go to homepage">
            <img src={logoWhiteUrl} alt="firstAir Compressor" className="h-12 w-auto" />
          </button>
          <p className="mt-5 max-w-sm text-[15px] leading-7 text-slate-300"><SiteText section="Footer" name="fixed_speed_fas_permanent_magnet_variable_speed_fasm_and_high_capacity" /></p>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"><ShieldCheck className="h-4 w-4 text-amber-400" />{" "}<SiteText section="Footer" name="4_250_kw" /></span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2"><SiteText section="Footer" name="5_16_bar" /></span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2"><SiteText section="Footer" name="up_to_1_130_cfm" /></span>
          </div>
          <div className="mt-6 flex items-center gap-3">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-slate-200 transition hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950">
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <FooterLinks title="Products" links={productLinks} onNavigate={onNavigate} />
        <FooterLinks title="Company" links={companyLinks} onNavigate={onNavigate} />

        <div>
          <FooterHeading><SiteText section="Footer" name="contact" /></FooterHeading>
          <div className="space-y-5 text-[15px]">
            <a href={`tel:${salesPhone.replace(/[^+\d]/g, '')}`} className="group flex items-start gap-3 text-slate-400 transition hover:text-white">
              <ContactIcon><Phone className="h-4 w-4" /></ContactIcon>
              <span><span className="block text-xs font-semibold uppercase tracking-wider text-slate-500"><SiteText section="Footer" name="for_sales_amp_service_enquiry" /></span><span className="mt-1 block font-semibold text-slate-200 group-hover:text-white">{salesPhone}</span></span>
            </a>
            <a href={`mailto:${config.contact.email}`} className="group flex items-start gap-3 text-slate-400 transition hover:text-white">
              <ContactIcon><Mail className="h-4 w-4" /></ContactIcon>
              <span><span className="block text-xs font-semibold uppercase tracking-wider text-slate-500"><SiteText section="Footer" name="email" /></span><span className="mt-1 block break-all font-semibold text-slate-200 group-hover:text-white">{config.contact.email}</span></span>
            </a>
            <div className="flex items-start gap-3 text-slate-400">
              <ContactIcon><MapPin className="h-4 w-4" /></ContactIcon>
              {hasPhysicalAddress ? (
                <address className="not-italic leading-6"><span className="font-semibold text-slate-200">{config.contact.headquarters.name}</span><span className="mt-1 block text-slate-300">{config.contact.headquarters.address}</span></address>
              ) : (
                <span><span className="block text-xs font-semibold uppercase tracking-wider text-slate-500"><SiteText section="Footer" name="support_amp_enquiries" /></span><button type="button" onClick={() => onNavigate('contact')} className="mt-1 font-semibold text-slate-200 transition hover:text-amber-400"><SiteText section="Footer" name="view_contact_details" /></button></span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-5 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© {new Date().getFullYear()} {config.company.name}<SiteText section="Footer" name="all_rights_reserved" /></span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <button type="button" onClick={() => onNavigate('faq')} className="transition hover:text-white"><SiteText section="Footer" name="faq" /></button>
            <button type="button" onClick={() => onNavigate('warranty')} className="transition hover:text-white"><SiteText section="Footer" name="warranty" /></button>
            <button type="button" onClick={() => onNavigate('contact')} className="transition hover:text-white"><SiteText section="Footer" name="contact" /></button>
            <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT))} className="transition hover:text-white"><SiteText section="Footer" name="cookie_preferences" /></button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links, onNavigate }: { title: string; links: Array<{ label: string; page: string }>; onNavigate: (page: string) => void }) {
  return (
    <div>
      <FooterHeading>{title}</FooterHeading>
      <nav className="space-y-3" aria-label={`${title} footer navigation`}>
        {links.map(link => <button key={link.label} type="button" onClick={() => onNavigate(link.page)} className="group flex items-center gap-2 text-left text-[15px] text-slate-300 transition hover:text-white"><span className="h-px w-0 bg-amber-400 transition-all group-hover:w-3" />{link.label}</button>)}
      </nav>
    </div>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">{children}</h3>;
}

function ContactIcon({ children }: { children: React.ReactNode }) {
  return <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/5 text-amber-400">{children}</span>;
}

function LinkedInIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-current"><path d="M5.3 7.7H1.7V22h3.6V7.7ZM3.5 2A2.1 2.1 0 1 0 3.5 6.2 2.1 2.1 0 0 0 3.5 2ZM22.3 13.8c0-4.3-2.3-6.4-5.4-6.4a4.7 4.7 0 0 0-4.2 2.3v-2H9.1V22h3.6v-7.1c0-1.9.4-3.7 2.7-3.7 2.3 0 2.3 2.1 2.3 3.8v7h3.6l1-8.2Z" /></svg>;
}

function FacebookIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-current"><path d="M13.7 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.6-1.5H17V4.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.5V14h2.8v8h3.4Z" /></svg>;
}

function InstagramIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" className="fill-current stroke-none" /></svg>;
}
