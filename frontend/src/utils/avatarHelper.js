/**
 * Hilfsfunktion für konsistente Avatar-URL-Generierung
 *
 * @param {string|null} avatar - Avatar-Feld aus der Datenbank
 * @param {string} fallbackName - Name für Robohash-Fallback
 * @returns {string} Vollständige Avatar-URL
 */
export const getAvatarUrl = (avatar, fallbackName) => {
  // Fallback wenn kein Avatar vorhanden
  if (!avatar || typeof avatar !== "string") {
    return `https://robohash.org/${encodeURIComponent(fallbackName)}`;
  }

  // Bereits vollständige URL (http/https)
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return avatar;
  }

  // Base64 Data URL
  if (avatar.startsWith("data:")) {
    return avatar;
  }

  // Cloudinary URL ohne Protokoll
  if (avatar.includes("res.cloudinary.com")) {
    return avatar.startsWith("//") ? `https:${avatar}` : `https://${avatar}`;
  }

  // Lokaler Pfad (sollte nicht vorkommen, aber sicherheitshalber)
  if (avatar.startsWith("/uploads/")) {
    return avatar;
  }

  // Cloudinary public_id - füge vollständige URL hinzu
  // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}
  return `https://res.cloudinary.com/dcvvzxq9x/image/upload/${avatar}`;
};

/**
 * Erstellt einen Error-Handler für Avatar-Bilder
 *
 * @param {string} fallbackName - Name für Robohash-Fallback
 * @returns {function} onError-Handler für img-Tags
 */
export const createAvatarErrorHandler = (fallbackName) => {
  return (e) => {
    // Verhindere unendliche Schleifen
    if (!e.target.src.includes("robohash.org")) {
      e.target.src = `https://robohash.org/${encodeURIComponent(fallbackName)}`;
    }
  };
};
