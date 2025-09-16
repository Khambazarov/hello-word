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
