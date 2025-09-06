// Modern Chat App Logo for Hello, Word!
// Sleek group icon with modern chat bubble design

const AppLogo = ({ className = "w-12 h-12", showAnimation = false }) => {
  return (
    <svg
      className={`${className}`}
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Modern gradient definitions */}
      <defs>
        <linearGradient id="userGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="bubbleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
        </linearGradient>
        <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* Modern User Group - Sleeker design */}
      <g transform="translate(35, 12)">
        {/* Central user - modern avatar */}
        <g filter="url(#softShadow)">
          <circle cx="25" cy="15" r="7" fill="url(#userGradient)" />
          <path
            d="M12 32 C12 27, 17 25, 25 25 C33 25, 38 27, 38 32 L38 36 C38 37.5, 36.5 38, 35 38 L15 38 C13.5 38, 12 37.5, 12 36 Z"
            fill="url(#userGradient)"
          />
        </g>

        {/* Left user - sleeker positioning */}
        <g filter="url(#softShadow)">
          <circle
            cx="8"
            cy="22"
            r="5"
            fill="url(#userGradient)"
            opacity="0.8"
          />
          <path
            d="M0 36 C0 33, 3 32, 8 32 C13 32, 16 33, 16 36 L16 39 C16 40, 15 40, 14 40 L2 40 C1 40, 0 40, 0 39 Z"
            fill="url(#userGradient)"
            opacity="0.7"
          />
        </g>

        {/* Right user - balanced design */}
        <g filter="url(#softShadow)">
          <circle
            cx="42"
            cy="22"
            r="5"
            fill="url(#userGradient)"
            opacity="0.8"
          />
          <path
            d="M34 36 C34 33, 37 32, 42 32 C47 32, 50 33, 50 36 L50 39 C50 40, 49 40, 48 40 L36 40 C35 40, 34 40, 34 39 Z"
            fill="url(#userGradient)"
            opacity="0.7"
          />
        </g>
      </g>

      {/* Ultra-Modern Chat Bubble */}
      <g transform="translate(55, 8)">
        <g filter="url(#softShadow)">
          {/* Modern bubble with rounded corners */}
          <path
            d="M15 10 
               C15 5, 19 3, 26 3
               C33 3, 37 5, 37 10
               C37 15, 35 17, 31 17
               L19 17
               C17 17, 15 15, 15 10 Z"
            fill="url(#bubbleGradient)"
            rx="8"
          />
          {/* Sleek bubble tail */}
          <path d="M13 12 L15 10 L15 14 Z" fill="url(#bubbleGradient)" />

          {/* Modern typing indicator dots */}
          <circle cx="21" cy="10" r="1.5" fill="white" opacity="0.95">
            {showAnimation && (
              <animate
                attributeName="r"
                values="1.2;1.8;1.2"
                dur="1.5s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <circle cx="26" cy="10" r="1.5" fill="white" opacity="1">
            {showAnimation && (
              <animate
                attributeName="r"
                values="1.2;1.8;1.2"
                dur="1.5s"
                repeatCount="indefinite"
                begin="0.3s"
              />
            )}
          </circle>
          <circle cx="31" cy="10" r="1.5" fill="white" opacity="0.95">
            {showAnimation && (
              <animate
                attributeName="r"
                values="1.2;1.8;1.2"
                dur="1.5s"
                repeatCount="indefinite"
                begin="0.6s"
              />
            )}
          </circle>
        </g>
      </g>

      {/* Modern Typography */}
      <g transform="translate(60, 62)">
        <text
          fontSize="11"
          fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
          fontWeight="700"
          fill="currentColor"
          opacity="0.85"
          textAnchor="middle"
          letterSpacing="0.5"
          x="0"
          y="0"
        >
          Hello, Word!
          {showAnimation && (
            <animate
              attributeName="opacity"
              values="0.7;1;0.7"
              dur="4s"
              repeatCount="indefinite"
            />
          )}
        </text>
      </g>

      {/* Ambient connection effects */}
      {showAnimation && (
        <g opacity="0.3">
          {/* Floating particles */}
          <circle cx="45" cy="25" r="1" fill="currentColor" opacity="0.4">
            <animate
              attributeName="cy"
              values="25;20;25"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.2;0.6;0.2"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>

          <circle cx="75" cy="30" r="1" fill="currentColor" opacity="0.3">
            <animate
              attributeName="cy"
              values="30;25;30"
              dur="4s"
              repeatCount="indefinite"
              begin="1s"
            />
            <animate
              attributeName="opacity"
              values="0.1;0.5;0.1"
              dur="4s"
              repeatCount="indefinite"
              begin="1s"
            />
          </circle>

          {/* Connecting energy */}
          <circle cx="60" cy="40" r="3" fill="currentColor" opacity="0.15">
            <animate
              attributeName="r"
              values="2;8;2"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.2;0;0.2"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      )}
    </svg>
  );
};

export default AppLogo;
