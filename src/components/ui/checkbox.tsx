import { useId } from "react";
import { cn } from "../../utils/cn";

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

type CheckboxProps = Omit<InputProps, "type"> & {
  labelSide?: "left" | "right";
  label?: string;
  error?: string;
};

export function Checkbox({
  id,
  labelSide = "right",
  label,
  error,
  className,
  ...props
}: CheckboxProps) {
  const defaultId = useId();
  const fieldId = id ?? defaultId;

  const labelContent =
    label != null ? (
      <label htmlFor={fieldId} className="pb-0.5">
        {label}
      </label>
    ) : null;

  return (
    <div className="grid gap-2">
      <div className="flex gap-2 items-center">
        {labelSide === "left" && labelContent}

        <input
          id={fieldId}
          type="checkbox"
          className={cn("size-5", className)}
          {...props}
        />

        {labelSide === "right" && labelContent}
      </div>

      {error != null && <span className="text-red-400">{error}</span>}
    </div>
  );
}
