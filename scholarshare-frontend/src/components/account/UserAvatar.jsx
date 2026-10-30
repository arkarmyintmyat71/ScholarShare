import { useState } from "react";
import "./UserAvatar.css";

// Brand-friendly background colours; the same name always gets the same one.
const AVATAR_COLORS = ["#4172b3", "#b34172", "#2f7d6d", "#8a5fb3", "#c0702b", "#2f6f9f"];

function colorFor(name) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/**
 * Round profile picture. Shows the user's photo when there is one,
 * otherwise their first initial on a colour (like YouTube / Google).
 * `size` is in pixels.
 */
function UserAvatar({ name = "Student", pictureUrl, size = 36 }) {
  const [imageFailed, setImageFailed] = useState(false);
  const style = { width: size, height: size, fontSize: Math.round(size * 0.45) };

  if (pictureUrl && !imageFailed) {
    return (
      <img
        className="user-avatar"
        style={style}
        src={pictureUrl}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span className="user-avatar" style={{ ...style, background: colorFor(name) }} aria-hidden="true">
      {(name.trim()[0] ?? "S").toUpperCase()}
    </span>
  );
}

export default UserAvatar;
