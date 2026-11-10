import { useEffect, useRef, useState } from "react";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

// Loads Google's sign-in script once.
let scriptPromise;
function loadGoogleScript() {
  scriptPromise ??= new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => {
      scriptPromise = undefined;
      reject(new Error("Could not load Google sign-in."));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Google's own "Continue with Google" button. When the student picks an account Google hands us an ID token and
 * onCredential(idToken) is called (the backend verifies it). Without VITE_GOOGLE_CLIENT_ID a plain button is shown that explains the setup step when pressed.
 */
function GoogleButton({ onCredential, onError, text = "continue_with" }) {
  const holder = useRef(null);
  const latest = useRef({ onCredential, onError });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    latest.current = { onCredential, onError };
  });

  useEffect(() => {
    if (!CLIENT_ID) return undefined;
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !holder.current) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: ({ credential }) => latest.current.onCredential(credential),
        });
        window.google.accounts.id.renderButton(holder.current, {
          type: "standard", theme: "outline", size: "large", text, shape: "pill",
          width: Math.min(holder.current.offsetWidth || 340, 400),
        });
      })
      .catch((err) => {
        setFailed(true);
        latest.current.onError?.(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [text]);

  // Not set up (or Google could not be reached): keep the button visible and say what is missing when it is pressed,
  // instead of hiding it and leaving people wondering where Google sign-in went.
  if (!CLIENT_ID || failed) {
    const explain = () =>
      onError?.(
        CLIENT_ID
          ? "Could not reach Google. Check your internet connection and try again."
          : "Google sign-in is not set up yet. Add VITE_GOOGLE_CLIENT_ID to the frontend .env file (see the README)."
      );
    return (
      <button type="button" className="google-fallback" onClick={explain}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/>
          <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/>
          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
        </svg>
        Continue with Google
      </button>
    );
  }
  return <div className="google-btn" ref={holder} />;
}

export default GoogleButton;
