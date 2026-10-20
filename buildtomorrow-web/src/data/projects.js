/*
 * Work / portfolio entries shown in the #work section.
 *
 * PLACEHOLDER CONTENT: every entry below is a sample, not a real client
 * project. Replace them with real case studies before going live and drop
 * the `placeholder: true` flag (it renders a visible "Sample" badge).
 *
 * Fields
 *   id          Display number, e.g. '01'
 *   title       Project name
 *   client      Client or sector line
 *   category    Short tag shown on the card (matches a service area)
 *   year        Year delivered
 *   summary     One or two sentences on the problem and outcome
 *   stack       Technologies, shown as keyword chips
 *   accent      'cyan' | 'blue' | 'green', tints the card visual
 *   href        Optional link to a case study; the card becomes a link
 *   placeholder Optional; true shows the "Sample" badge
 */
export const PROJECTS = [
  {
    id: '01',
    title: 'Fintech Client Portal',
    client: 'Sample client · Financial services',
    category: 'Web Platforms',
    year: '2025',
    summary: 'A secure self-service portal replacing manual onboarding, with role-based access and audit trails built in from day one.',
    stack: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    accent: 'cyan',
    placeholder: true,
  },
  {
    id: '02',
    title: 'AI Document Assistant',
    client: 'Sample client · Legal & compliance',
    category: 'Applied AI',
    year: '2025',
    summary: 'A retrieval-augmented assistant that answers questions across thousands of internal documents with cited sources.',
    stack: ['LLMs', 'RAG', 'Python', 'Vector DB'],
    accent: 'blue',
    placeholder: true,
  },
  {
    id: '03',
    title: 'Field Operations App',
    client: 'Sample client · Logistics',
    category: 'Mobile Ecosystems',
    year: '2024',
    summary: 'An offline-first mobile app for field teams, syncing jobs, photos, and signatures back to the operations dashboard.',
    stack: ['React Native', 'Kotlin', 'Swift', 'GraphQL'],
    accent: 'green',
    placeholder: true,
  },
  {
    id: '04',
    title: 'Security & GDPR Review',
    client: 'Sample client · Healthcare',
    category: 'Security & Compliance',
    year: '2024',
    summary: 'A full security and data protection assessment with a prioritised remediation roadmap and AI risk review.',
    stack: ['Pen Testing', 'GDPR', 'Zero Trust', 'AI Risk'],
    accent: 'cyan',
    placeholder: true,
  },
]
