// Public site identity, navigation, and social links.
// Keep personal/professional content in src/data/.

export const SITE = {
  name: 'Bahaa Aldeen Nawlo',
  title: 'Bahaa Aldeen Nawlo — Junior Web Penetration Tester',
  shortTitle: 'Bahaa Aldeen Nawlo',
  description:
    'Portfolio of Bahaa Aldeen Nawlo, a junior web penetration tester focused on web application security, API security, and security assessments.',
  url: 'https://bahaa-aldeen-nawlo.com',
  defaultOgImage: '/og-default.svg',
  locale: 'en',
} as const;

export const NAV_LINKS = [
  { label: 'Work', href: '/work' },
  { label: 'Write-ups', href: '/writeups' },
  { label: 'Labs', href: '/labs' },
  { label: 'Blog', href: '/blog' },
  { label: 'YouTube', href: '/youtube' },
  { label: 'About', href: '/about' },
  { label: 'CV', href: '/cv' },
  { label: 'Contact', href: '/contact' },
] as const;

export const SOCIAL_LINKS = [
  { label: 'Email', href: 'mailto:bahaa.aldeen.nawlo@gmail.com', icon: 'mail' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/bahaa-aldeen-nawlo-65618838a', icon: 'linkedin' },
  { label: 'GitHub', href: 'https://github.com/Bahaa003', icon: 'github' },
] as const;

export const SECURITY_CONTACT_EMAIL = 'bahaa.aldeen.nawlo@gmail.com';
