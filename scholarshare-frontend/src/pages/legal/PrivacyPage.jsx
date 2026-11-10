import LegalPage from "./LegalPage";

const SECTIONS = [
  {
    title: "What we collect",
    list: [
      "Account details: your name, university e-mail address and a securely hashed password (we never store your password in plain text).",
      "If you use Google sign-in: your name, e-mail address and Google account identifier. We never see your Google password.",
      "Profile details you choose to add: profile photo, headline, bio, university and location.",
      "Your activity: research you upload, comments, ratings, saved research and notifications.",
    ],
  },
  {
    title: "How we use it",
    list: [
      "To create and protect your account and to show your profile and contributions.",
      "To let administrators review accounts and uploads, and to send you notifications about decisions.",
    ],
  },
  {
    title: "What other people can see",
    body: [
      "Other members can see your name, profile photo and the details you add to your profile, and the research and comments you publish. Your e-mail address is shown to you only. Visitors who are not signed in can read research descriptions, but cannot download files.",
    ],
  },
  {
    title: "Cookies and local storage",
    body: [
      "ScholarShare does not use advertising cookies. Your browser keeps a sign-in token so you stay signed in, and your profile frame choice, using local storage. Signing out removes the token.",
    ],
  },
  {
    title: "Sharing and security",
    body: [
      "We do not sell your information. It is only available to the ScholarShare administrators of your university and the services that run the site. Passwords are hashed and sign-in uses signed tokens.",
    ],
  },
  {
    title: "Your choices",
    list: [
      "Edit your name, headline, bio, university, location and photo at any time from your profile.",
      "Change your password from Account settings.",
      "Ask an administrator to disable or delete your account and the content linked to it.",
    ],
  },
  {
    title: "Changes to this policy",
    body: ["If we change this policy we will update the date at the top of the page."],
  },
];

function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="November 2026"
      intro="This policy explains what information ScholarShare keeps about you, why we keep it and who can see it."
      sections={SECTIONS}
      otherLink={{ to: "/terms", label: "Terms & Conditions" }}
    />
  );
}

export default PrivacyPage;
