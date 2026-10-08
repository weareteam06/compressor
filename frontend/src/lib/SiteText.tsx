import { usePublicContent } from './publicContent';

/** Plain text only: CMS values never inject markup or executable HTML. */
export function SiteText({ section, name }: { section: string; name: string }) {
  return <>{usePublicContent().text[section]?.[name] ?? ''}</>;
}
