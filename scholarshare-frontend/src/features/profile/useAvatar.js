import { useCallback, useState } from "react";
import { removeAvatar, uploadAvatar } from "../../services/userService";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

// Changing or removing the profile photo (used by the camera button and by Account settings).
// `setUser` is AuthContext's setter, so the new photo shows in the header straight away.
// Returns { change(file), remove(), isBusy, message } where message is { type, text } or null.
export function useAvatar(setUser) {
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const run = useCallback(
    async (action, successText) => {
      setMessage(null);
      setIsBusy(true);
      try {
        setUser(await action());
        setMessage({ type: "success", text: successText });
      } catch (err) {
        setMessage({ type: "error", text: err.message });
      } finally {
        setIsBusy(false);
      }
    },
    [setUser]
  );

  const change = useCallback(
    (file) => {
      if (!file) return undefined;
      if (!file.type.startsWith("image/")) {
        setMessage({ type: "error", text: "Please choose an image (PNG, JPG, GIF or WebP)." });
        return undefined;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setMessage({ type: "error", text: "Please choose a photo under 2 MB." });
        return undefined;
      }
      return run(() => uploadAvatar(file), "Profile photo updated.");
    },
    [run]
  );

  const remove = useCallback(() => run(removeAvatar, "Profile photo removed."), [run]);

  return { change, remove, isBusy, message };
}
