// Small line icons used on the profile page (24x24, drawn with the current text colour).
const PATHS = {
  school: "m2 9 10-5 10 5-10 5L2 9Zm5 3v5c3 3 7 3 10 0v-5M22 9v8",
  location: "M12 22s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12ZM12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z",
  calendar: "M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM8 2v6M16 2v6M3 10h18",
  camera: "M3 8h4l2-3h6l2 3h4v12H3V8ZM12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  pencil: "M4 20h4L20 8l-4-4L4 16v4ZM14 6l4 4",
  settings: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM10 2h4l.6 2.5 2.2 1.1 2.4-.8 2 3.5-1.8 1.7v3l1.8 1.7-2 3.5-2.4-.8-2.2 1.1L14 22h-4l-.6-2.5-2.2-1.1-2.4.8-2-3.5L4.6 14v-3L2.8 9.3l2-3.5 2.4.8 2.2-1.1L10 2Z",
  file: "M7 2h7l5 5v15H7V2Zm7 0v5h5M10 12h6M10 16h6",
  mail: "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM3 7l9 7 9-7",
  lock: "M7 10h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2ZM8 10V7a4 4 0 0 1 8 0v3M12 15v3",
  close: "M5 5 19 19M19 5 5 19",
  eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  eyeoff: "M3 3 21 21M10 6.2A10 10 0 0 1 12 6c6.5 0 10 6 10 6a16 16 0 0 1-3 3.5M6.1 7.2C3.3 9.1 2 12 2 12s3.5 6 10 6a10 10 0 0 0 4.5-1M10 10a3 3 0 0 0 4 4",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  bookmark: "M6 3h12v18l-6-4-6 4V3Z",
  logout: "M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M16 8l4 4-4 4M20 12H9",
};

function Icon({ name, size = 19 }) {
  return (
    <svg className="fp-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

export default Icon;
