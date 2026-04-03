import { cn } from "../../utils/cn";

type HTMLButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export type ButtonProps = HTMLButtonProps & {
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
};

export function Button({
  variant = "primary",
  size = "medium",
  // Override default to "button" (instead of "submit"...)
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "cursor-pointer px-4 py-2 border-2 rounded-sm transition-colors",
        "flex items-center justify-center gap-2",
        {
          "bg-purple-700 border-purple-700 hover:bg-purple-800 hover:border-purple-800 focus:bg-purple-800 focus:border-purple-800 active:bg-purple-900 active:border-purple-900":
            variant === "primary",
          "text-purple-200 border-purple-400 hover:bg-purple-100/5 focus:bg-purple-100/5 active:bg-purple-100/10":
            variant === "secondary",

          "text-sm": size === "small",
          "text-md": size === "medium",
          "text-xl": size === "large",
        },
        className,
      )}
      type={type}
      {...props}
    />
  );
}
