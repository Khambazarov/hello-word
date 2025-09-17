import { cn } from "../utils/cn";

export const RadioInput = ({
  type = "radio",
  name,
  value,
  checked,
  onChange = () => {},
  className,
  ...props
}) => (
  <input
    type={type}
    name={name}
    value={value}
    checked={checked}
    onChange={(e) => onChange(e.target.value)}
    className={cn(
      "w-4 h-4 bg-gray-100 border-gray-300 focus:ring-2 cursor-pointer",
      className
    )}
    {...props}
  />
);

export const PasswordInput = ({
  type,
  name,
  id,
  autoComplete,
  minLength = 6,
  required = true,
  value,
  onChange = () => {},
  className,
  ...props
}) => (
  <input
    type={type}
    name={name}
    id={id}
    autoComplete={autoComplete}
    minLength={minLength}
    required={required}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={cn(
      "w-full px-10 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors",
      className
    )}
    {...props}
  />
);
