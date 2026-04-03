import { cn } from "../../utils/cn";

type Props = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;
export function PageWrapper({ className, ...props }: Props) {
  return <div className={cn("container mx-auto p-4", className)} {...props} />;
}
