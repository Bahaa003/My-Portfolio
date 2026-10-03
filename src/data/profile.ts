// Factual profile content shared by the homepage and About page.

export const PROFILE = {
  name: 'Bahaa Aldeen Nawlo',
  title: 'Junior Web Penetration Tester',
  focusAreas: ['Web Application Security', 'API Security', 'Security Assessments'],

  shortIntro:
    'Computer Science graduate and Junior Web Penetration Tester with hands-on experience in web application, API, and security configuration assessments.',

  longIntro: [
    'I graduated with a B.Sc. in Computer Science from Aleppo University in August 2026 and currently work on authorized security assessment tasks focused on web applications, APIs, and externally exposed assets.',
    'My practical work includes authentication and authorization testing, JWT security testing, XSS, clickjacking, security misconfiguration review, firewall configuration issues, information disclosure, and HTTP security-header analysis. I also document findings and produce technical security assessment reports.',
    'Alongside practical assessment work, I have completed hands-on training through PortSwigger Web Security Academy and TryHackMe, and I continue building my skills through security labs, research, and technical write-ups.',
  ],

  languages: [
    { language: 'Arabic', level: 'Native' },
    { language: 'English', level: 'Fluent / Professional Working Proficiency' },
    { language: 'German', level: 'B1 — preparing for B2 / Goethe-Zertifikat B2' },
  ],
} as const;
