import { cn } from "../utils/cn";
import { useNavigate } from "react-router-dom";
import {
  BackButtonIcon,
  BackToChatIcon,
  ChangePasswordIcon,
  EyeClosedIcon,
  EyeOpenedIcon,
  TrashIcon,
} from "./_AllSVGs";

export const BackToChatBtn = ({ className, ...props }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/chatarea")}
      className={cn(
        "inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors",
        className
      )}
    >
      <BackToChatIcon />
      {props.children}
    </button>
  );
};

export const BackBtnHeader = ({ className, ...props }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/chatarea")}
      className={cn(
        "p-3 sm:p-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors",
        className
      )}
      {...props}
    >
      <BackButtonIcon />
    </button>
  );
};

export const EyeToggleIcon = ({ toggled, onToggle, className, ...props }) => (
  <button
    type="button"
    className={cn(
      "absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
      className
    )}
    onClick={onToggle}
    {...props}
  >
    {toggled ? <EyeOpenedIcon /> : <EyeClosedIcon />}
  </button>
);

export const ChangePasswordBtn = ({ className, ...props }) => {
  return (
    <button
      type="submit"
      className={cn(
        "cursor-pointer w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 mt-auto text-nowrap",
        className
      )}
    >
      <ChangePasswordIcon />
      <span>{props.children}</span>
    </button>
  );
};

export const DeleteAccountBtn = ({ className, onClick, ...props }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 mt-auto text-nowrap",
        className
      )}
    >
      <TrashIcon />
      <span>{props.children}</span>
    </button>
  );
};
