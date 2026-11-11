/** Loads a template's web fonts. React 19 hoists and dedupes stylesheet links by href. */
export function TemplateFonts({ href }: { href: string }) {
  return <link rel="stylesheet" href={href} precedence="default" />;
}
