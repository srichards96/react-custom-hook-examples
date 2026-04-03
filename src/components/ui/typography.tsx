import { cn } from "../../utils/cn";

type HeadingProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
>;
export function Heading1({ className, ...props }: HeadingProps) {
  return <h1 className={cn("mb-2 font-bold text-4xl", className)} {...props} />;
}
export function Heading2({ className, ...props }: HeadingProps) {
  return <h1 className={cn("mb-2 font-bold text-3xl", className)} {...props} />;
}
export function Heading3({ className, ...props }: HeadingProps) {
  return <h1 className={cn("mb-2 font-bold text-2xl", className)} {...props} />;
}
export function Heading4({ className, ...props }: HeadingProps) {
  return <h1 className={cn("mb-2 font-bold text-xl", className)} {...props} />;
}
export function Heading5({ className, ...props }: HeadingProps) {
  return <h1 className={cn("mb-2 font-bold text-lg", className)} {...props} />;
}
export function Heading6({ className, ...props }: HeadingProps) {
  return (
    <h1 className={cn("mb-2 font-bold text-lg italic", className)} {...props} />
  );
}

export const linkClassNames = "underline hover:no-underline focus:no-underline";

type ParagraphProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLParagraphElement>,
  HTMLParagraphElement
>;
export function Paragraph({ className, ...props }: ParagraphProps) {
  return <p className={cn("mb-2", className)} {...props} />;
}

type UnorderedListProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLUListElement>,
  HTMLUListElement
>;
export function UnorderedList({ className, ...props }: UnorderedListProps) {
  return <ul className={cn("mb-2 list-disc ml-4", className)} {...props} />;
}
type OrderedListProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLOListElement>,
  HTMLOListElement
>;
export function OrderedList({ className, ...props }: OrderedListProps) {
  return <ol className={cn("mb-2 list-decimal ml-4", className)} {...props} />;
}
type ListItemProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLLIElement>,
  HTMLLIElement
>;
export function ListItem({ ...props }: ListItemProps) {
  return <li {...props} />;
}
