import { useState } from "react";
import { mediaUrl } from "../../utils/media";
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
 * `pictureUrl` may be a relative API path ("/users/5/avatar?v=1") or a full link. `size` is in pixels.
 */
function UserAvatar({ name = "Student", pictureUrl, size = 36 }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const src = mediaUrl(pictureUrl);
  const style = { width: size, height: size, fontSize: Math.round(size * 0.45) };

  if (src && src !== failedSrc) {
    return (
      <img
        className="user-avatar"
        style={style}
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailedSrc(src)}
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
