import { useEffect } from "react";

export const PreventZoom = () => {
  useEffect(() => {
    const preventZoom = (e) => e.preventDefault();

    document.addEventListener("gesturestart", preventZoom);
    document.addEventListener("gesturechange", preventZoom);
    document.addEventListener("gestureend", preventZoom);

    return () => {
      document.removeEventListener("gesturestart", preventZoom);
      document.removeEventListener("gesturechange", preventZoom);
      document.removeEventListener("gestureend", preventZoom);
    };
  }, []);

  return null;
};
