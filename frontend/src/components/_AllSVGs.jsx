export const BackButtonIcon = ({ className = "" }) => (
  <svg
    className={`w-6 h-6 text-white hover:text-gray-400 duration-200 ${className}`}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 18l-6-6 6-6"
    />
  </svg>
);

export const BackToChatIcon = ({ className = "" }) => (
  <svg
    className={`w-5 h-5 mr-2 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

export const UserIcon = ({ className = "" }) => (
  <svg
    className={`w-5 h-5 text-gray-400 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

export const SettingsIcon = ({ className = "" }) => (
  <svg
    className={`w-6 h-6 ${className}`}
    // className="w-6 h-6 text-white hover:text-gray-400 duration-200"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export const LanguageIcon = ({ className = "" }) => (
  <svg
    className={`w-6 h-6 ${className}`}
    // className="w-6 h-6 text-purple-600 dark:text-purple-400"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z"
      clipRule="evenodd"
    />
  </svg>
);

export const AudioVolumeIcon = ({ className = "" }) => (
  <svg
    className={`w-6 h-6 text-green-600 dark:text-green-400 ${className}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.168 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.168l4.215-3.824zm2.344 2.443a1 1 0 011.273-.983 6.002 6.002 0 010 10.928 1 1 0 11-.95-1.764 4.002 4.002 0 000-7.404 1 1 0 01-.323-1.777z"
      clipRule="evenodd"
    />
  </svg>
);

export const WarningIcon = ({ className = "" }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

export const EmailIcon = ({ className = "" }) => (
  <svg
    className={`w-5 h-5 text-gray-400 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

export const PasswordIcon = ({ className = "" }) => (
  <svg
    className={`w-5 h-5 text-gray-400 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

export const ChangePasswordIcon = ({ className = "" }) => (
  <svg
    className={`w-5 h-5 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

export const TrashIcon = ({ className = "" }) => (
  <svg
    className={`w-5 h-5 ${className}`}
    // className={`w-5 h-5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 duration-200 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

export const EyeOpenedIcon = ({ className = "" }) => (
  <svg
    className={`w-5 h-5 text-gray-400 cursor-pointer ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

export const EyeClosedIcon = ({ className = "" }) => (
  <svg
    className={`w-5 h-5 text-gray-400 cursor-pointer ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3l18 18"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
    />
    <circle
      cx="12"
      cy="12"
      r="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

export const KeyIcon = ({ className = "" }) => (
  <svg
    className={`w-5 h-5 text-gray-400 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
    />
  </svg>
);

export const SendMessageIcon = ({ className = "" }) => (
  <svg
    className={`w-8 h-8 rotate-90 rtl:-rotate-90 hover:scale-120  hover:text-[rgb(255,50,54)] duration-200 ${className}`}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 18 20"
  >
    <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
  </svg>
);

export const EditMessageIcon = ({ className = "" }) => (
  <svg
    className={`w-4 h-4 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

export const DeleteMessageIcon = ({ className = "" }) => (
  <svg
    className={`w-4 h-4 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

export const GermanFlag = ({ className = "" }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 32 32"
  >
    <path fill="#cc2b1d" d="M1 11H31V21H1z"></path>
    <path d="M5,4H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z"></path>
    <path
      d="M5,20H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z"
      transform="rotate(180 16 24)"
      fill="#f8d147"
    ></path>
    <path
      d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z"
      opacity=".15"
    ></path>
    <path
      d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z"
      fill="#fff"
      opacity=".2"
    ></path>
  </svg>
);

export const UkFlag = ({ className = "" }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 32 32"
  >
    <rect
      x="1"
      y="4"
      width="30"
      height="24"
      rx="4"
      ry="4"
      fill="#071b65"
    ></rect>
    <path
      d="M5.101,4h-.101c-1.981,0-3.615,1.444-3.933,3.334L26.899,28h.101c1.981,0,3.615-1.444,3.933-3.334L5.101,4Z"
      fill="#fff"
    ></path>
    <path
      d="M22.25,19h-2.5l9.934,7.947c.387-.353,.704-.777,.929-1.257l-8.363-6.691Z"
      fill="#b92932"
    ></path>
    <path
      d="M1.387,6.309l8.363,6.691h2.5L2.316,5.053c-.387,.353-.704,.777-.929,1.257Z"
      fill="#b92932"
    ></path>
    <path
      d="M5,28h.101L30.933,7.334c-.318-1.891-1.952-3.334-3.933-3.334h-.101L1.067,24.666c.318,1.891,1.952,3.334,3.933,3.334Z"
      fill="#fff"
    ></path>
    <rect x="13" y="4" width="6" height="24" fill="#fff"></rect>
    <rect x="1" y="13" width="30" height="6" fill="#fff"></rect>
    <rect x="14" y="4" width="4" height="24" fill="#b92932"></rect>
    <rect
      x="14"
      y="1"
      width="4"
      height="30"
      transform="translate(32) rotate(90)"
      fill="#b92932"
    ></rect>
    <path
      d="M28.222,4.21l-9.222,7.376v1.414h.75l9.943-7.94c-.419-.384-.918-.671-1.471-.85Z"
      fill="#b92932"
    ></path>
    <path
      d="M2.328,26.957c.414,.374,.904,.656,1.447,.832l9.225-7.38v-1.408h-.75L2.328,26.957Z"
      fill="#b92932"
    ></path>
    <path
      d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z"
      opacity=".15"
    ></path>
    <path
      d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z"
      fill="#fff"
      opacity=".2"
    ></path>
  </svg>
);

export const LoginTabIcon = ({ className = "" }) => (
  <svg
    className={`w-4 h-4 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
    />
  </svg>
);

export const RegisterTabIcon = ({ className = "" }) => (
  <svg
    className={`w-4 h-4 ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
    />
  </svg>
);

// Modern Chat App Logo for Hello, Word!
// Sleek group icon with modern chat bubble design
export const AppLogo = ({ className = "", showAnimation = false }) => {
  return (
    <svg
      className={`w-12 h-12 ${className}`}
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
