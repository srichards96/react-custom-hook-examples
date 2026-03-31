import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header className="bg-slate-900 p-4">
      <div className="container mx-auto">
        <Link to="/">React Custom Hooks</Link>
      </div>
    </header>
  );
}
