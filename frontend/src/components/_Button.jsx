import React from "react";
import { cn } from "../utils/cn.js";

/**
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export const ButtonNavigate = ({ className, ...props }) => {
  return (
    <button
      className={cn(
        "cursor-pointer bg-gradient-to-br from-blue-500 to-orange-500 text-white px-4 py-1 rounded-lg font-bold shadow-md hover:from-blue-600 hover:to-orange-600 hover:shadow-lg transition-all duration-300 text-sm text-nowrap",
        className
      )}
      {...props}
    />
  );
};
