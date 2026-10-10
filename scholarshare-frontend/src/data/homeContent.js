// Static placeholder content for the landing page. Once the Java
// backend exposes real endpoints (see services/api), these arrays
// can be replaced by data fetched through researchService /
// categoryService without touching any component markup.

export const TRENDING_TOPICS = [
  "Artificial Intelligence",
  "Cybersecurity",
  "Data Science",
  "Web Development",
];

export const RESEARCH_CARDS = [
  {
    id: "web-dev",
    tag: "COMPUTER SCIENCE",
    title: "Web Application Development and Student Platforms",
    description:
      "Explore research about modern web systems, frontend development, and university platforms.",
    image: "https://picsum.photos/seed/scholarshare-webdev/480/320",
  },
  {
    id: "ai-education",
    tag: "ARTIFICIAL INTELLIGENCE",
    title: "Artificial Intelligence in Higher Education",
    description:
      "Discover student research on AI tools, machine learning, and their use in education.",
    image: "https://picsum.photos/seed/scholarshare-ai/480/320",
  },
  {
    id: "web-security",
    tag: "CYBERSECURITY",
    title: "Security and Access Control for Web Systems",
    description:
      "Read research about authentication, privacy, security, and role-based access control.",
    image: "https://picsum.photos/seed/scholarshare-security/480/320",
  },
  {
    id: "data-analytics",
    tag: "DATA SCIENCE",
    title: "Data Analytics for Student Learning",
    description:
      "Explore how data can support academic decisions, learning, and university services.",
    image: "https://picsum.photos/seed/scholarshare-data/480/320",
  },
];

export const SUBJECT_CATEGORIES = [
  { label: "Computer Science", to: "/categories/computer-science" },
  { label: "Information Technology", to: "/categories/information-technology" },
  { label: "Artificial Intelligence", to: "/categories/artificial-intelligence" },
  { label: "Cybersecurity", to: "/categories/cybersecurity" },
  { label: "Data Science", to: "/categories/data-science" },
  { label: "Business & Management", to: "/categories/business-management" },
];

export const DISCUSSION_TOPICS = [
  {
    id: "ai-learning",
    tag: "AI & EDUCATION",
    title: "How can AI support university learning?",
    description:
      "Share ideas and discuss how AI can support students and academic research.",
    comments: 18,
  },
  {
    id: "research-methods",
    tag: "RESEARCH METHODS",
    title: "Which method fits a web application study?",
    description:
      "Discuss quantitative, qualitative, and mixed-method approaches for student projects.",
    comments: 12,
  },
  {
    id: "web-security-discussion",
    tag: "WEB SECURITY",
    title: "How should student platforms protect data?",
    description:
      "Exchange ideas about authentication, roles, privacy, and secure access.",
    comments: 9,
  },
];

export const ABOUT_POINTS = [
  "Find organized research by category and keyword.",
  "Share research through an admin-reviewed workflow.",
  "Save useful resources and return to them later.",
  "Create topics and exchange ideas through comments.",
];
