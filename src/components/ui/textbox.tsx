import { useId } from "react";
import { cn } from "../../utils/cn";

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

type TextboxProps = InputProps & {
  label?: string;
  error?: string;
};

export function Textbox({
  id,
  label,
  error,
  type = "text",
  className,
  ...props
}: TextboxProps) {
  const defaultId = useId();
  const fieldId = id ?? defaultId;

  return (
    <div className="grid gap-2">
      {label != null && <label htmlFor={fieldId}>{label}</label>}

      <input
        id={fieldId}
        type={type}
        className={cn(
          "bg-white text-black p-2 rounded-sm border-2 border-white",
          error != null && "border-red-400!",
          className,
        )}
        {...props}
      />

      {error != null && <span className="text-red-400">{error}</span>}
    </div>
  );
}
