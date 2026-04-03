import { Link } from "@tanstack/react-router";
import { Heading1 } from "../ui/typography";

export function Header() {
  return (
    <header className="bg-slate-900">
      <div className="container mx-auto p-4">
        <Link to="/">
          <Heading1>React Custom Hook Examples</Heading1>
        </Link>
      </div>
    </header>
  );
}
