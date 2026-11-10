import LegalPage from "./LegalPage";

const SECTIONS = [
  {
    title: "Who can use ScholarShare",
    body: [
      "ScholarShare is a university platform where students share and discover academic research. By creating an account or using the site you agree to these Terms & Conditions.",
      "Anyone can create a student account and use it straight away. Uploaded research is reviewed by an administrator before it is published, and an administrator may disable an account that breaks these terms.",
    ],
  },
  {
    title: "Your account",
    list: [
      "Give true information when you register and keep your password private.",
      "You are responsible for everything done through your account.",
      "You can sign in with a password or with your Google account. Tell an administrator if you think someone else has used your account.",
      "Your e-mail address identifies your account and cannot be changed from the profile page.",
    ],
  },
  {
    title: "What visitors, students and administrators can do",
    list: [
      "Visitors (not signed in) can browse research and read descriptions only. Downloading, rating and commenting need a signed-in account.",
      "Students can upload research, download files, rate (1 to 5 stars), comment, save research to their library and take part in topics.",
      "Administrators review and approve accounts and uploads, manage categories and topics, and can remove content or comments.",
    ],
  },
  {
    title: "Research you upload",
    body: [
      "You keep the ownership of your work. By uploading it you give ScholarShare permission to store it, show its description, and let signed-in members download it once an administrator has approved it.",
    ],
    list: [
      "Only upload work you wrote or have the right to share, and credit other people's work properly.",
      "Do not upload files that are illegal, harmful, contain malware, or that include other people's private information.",
      "Uploads start as pending and are visible to others only after approval. An administrator may reject or remove a file, and you will be told in your notifications.",
    ],
  },
  {
    title: "Comments, ratings and topics",
    body: [
      "Be respectful. Do not post harassment, hate speech, spam or advertising. Comments that break these rules can be deleted by an administrator. Ratings must reflect your honest opinion of the research.",
    ],
  },
  {
    title: "Academic honesty",
    body: [
      "Material on ScholarShare is shared for learning and reference. Copying someone else's research and submitting it as your own work is plagiarism and may break your university's rules. You are responsible for citing what you use.",
    ],
  },
  {
    title: "Availability and changes",
    body: [
      "We try to keep ScholarShare running, but we do not promise it will always be available or error-free, and the service is provided as it is. We may update these terms; the date at the top shows the latest version, and continuing to use the site means you accept the change.",
    ],
  },
  {
    title: "Contact",
    body: ["Questions about these terms can be sent to the ScholarShare administrators of your university."],
  },
];

function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="November 2026"
      intro="Please read these terms before you use ScholarShare. They explain how the platform works and what we expect from everyone who uses it."
      sections={SECTIONS}
      otherLink={{ to: "/privacy", label: "Privacy Policy" }}
    />
  );
}

export default TermsPage;
