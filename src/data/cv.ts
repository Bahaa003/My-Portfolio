// Structured CV data for the public /cv page.
// This mirrors the user's current CV and intentionally avoids confidential client details.

export const CV = {
  summary:
    'Computer Science graduate and Junior Penetration Tester with hands-on experience in web application, API, and security configuration assessments. Experienced in testing authentication and authorization mechanisms, analyzing application behavior, identifying and validating security vulnerabilities, and producing technical security reports.',

  experience: [
    {
      role: 'Junior Penetration Tester',
      org: 'Independent / Contract Security Assessment Work',
      period: '2026 – Present',
      summary:
        'Hands-on security assessment work covering web applications, APIs, and externally exposed assets.',
      highlights: [
        'Conducted authorized security assessments of web applications, APIs, and externally exposed assets across multiple security assessment engagements.',
        'Performed testing of authentication, authorization, session handling, API functionality, security configurations, and common web application vulnerabilities.',
        'Identified and validated security weaknesses including Cross-Site Scripting (XSS), JWT-related vulnerabilities, clickjacking, security misconfigurations, and firewall configuration issues.',
        'Performed external configuration assessments covering HTTP security headers, TLS/HTTP security controls, DNS exposure, and other externally observable security configurations.',
        'Analyzed application requests, responses, authentication flows, and security controls using Burp Suite and other security testing and reconnaissance tools.',
        'Authored 6 technical security assessment reports documenting findings, evidence, impact, and remediation recommendations, and reviewed 2 additional reports prepared by another team member.',
        'Conducted security investigations of publicly accessible websites, including technical analysis, evidence collection, infrastructure analysis, and security documentation.',
      ],
    },
  ],

  selectedSecurityWork: [
    {
      title: 'Redacted security assessments',
      description:
        'Authorized web application, API, and external configuration assessments covering authentication, authorization, vulnerability validation, security controls, and technical reporting. Client names, targets, scope details, and confidential findings are intentionally omitted.',
      confidentiality: 'redacted' as const,
    },
    {
      title: 'Security investigation',
      description:
        'Investigated a publicly accessible website as part of an authorized security task, including public-information research, website and infrastructure analysis, evidence collection, and technical documentation. Identifying details are intentionally omitted.',
      confidentiality: 'redacted' as const,
    },
  ],

  skills: {
    testing: [
      'Web Application Penetration Testing',
      'API Security Testing',
      'Authentication & Authorization Testing',
      'JWT Security Testing',
      'OWASP Top 10',
      'SSRF',
      'SQL Injection',
      'Cross-Site Scripting (XSS)',
      'CSRF',
      'Path Traversal',
      'Access Control Flaws',
      'Clickjacking',
      'Security Misconfiguration Review',
      'HTTP / Security Header Analysis',
      'Information Disclosure Testing',
    ],
    programming: ['Python', 'Dart / Flutter', 'Bash Scripting', 'n8n'],
    web: ['RESTful APIs', 'GraphQL', 'HTML / CSS', 'Django'],
    systems: ['Linux (Fedora / Debian)', 'Windows'],
    tools: ['Burp Suite', 'Nmap', 'Metasploit', 'Netcat', 'Dirbuster / ffuf', 'Wireshark', 'curl', 'dig', 'httpx'],
    reporting: ['Technical Security Reporting', 'Evidence Documentation'],
  },

  certifications: [
    {
      name: 'Junior Penetration Tester (JPT)',
      issuer: 'TryHackMe',
    },
    {
      name: 'Linux Privilege Escalation for Beginners',
      issuer: 'TCM Security',
    },
  ],

  training: [
    {
      name: 'PortSwigger Web Security Academy',
      detail: 'Completed hands-on labs across multiple web vulnerability categories.',
    },
    {
      name: 'TryHackMe',
      detail: 'Hands-on practice across 100+ rooms/challenges.',
    },
  ],

  education: [
    {
      degree: 'B.Sc. in Computer Science',
      institution: 'Aleppo University',
      year: 'August 2026',
    },
  ],

  languages: [
    { language: 'Arabic', level: 'Native Speaker' },
    { language: 'English', level: 'Fluent / Professional Working Proficiency' },
    { language: 'German', level: 'B1, currently preparing for B2' },
  ],

  pdfPath: '/cv/Bahaa-Aldeen-Nawlo-CV.pdf',
} as const;
