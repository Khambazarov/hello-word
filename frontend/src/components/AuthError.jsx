import { useNavigate } from "react-router-dom";

export const AuthError = ({ translations }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <svg
        className="w-16 h-16 text-red-500 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      <p className="text-red-600 dark:text-red-400 mb-4">
        {translations.feedback?.errors?.general?.unauthorized ||
          translations.common?.loginRequired ||
          "You are not authorized to view this page."}
      </p>

      <button
        onClick={() => navigate("/")}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
      >
        {translations.common?.relogin || "Log in again"}
      </button>
    </div>
  );
};
