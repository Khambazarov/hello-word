// Simplified Chat Bubble Icon for smaller use cases
// Clean, minimal design for navigation bars, etc.

const ChatIcon = ({ className = "w-6 h-6", color = "currentColor" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Chat Bubble */}
      <path
        d="M12 2C17.5 2 22 6.04 22 11.2C22 16.36 17.5 20.4 12 20.4C10.73 20.4 9.54 20.14 8.5 19.68L3 22L5.17 17.14C3.85 15.72 3 13.88 3 11.8C3 6.64 7.5 2.6 12 2.6V2Z"
        fill={color}
        stroke={color === "currentColor" ? "none" : "#FFFFFF"}
        strokeWidth={color === "currentColor" ? 0 : 1}
      />

      {/* Chat Dots */}
      <circle cx="8.5" cy="11.2" r="1.2" fill="#FFFFFF" opacity="0.9" />
      <circle cx="12" cy="11.2" r="1.2" fill="#FFFFFF" />
      <circle cx="15.5" cy="11.2" r="1.2" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
};

export default ChatIcon;
