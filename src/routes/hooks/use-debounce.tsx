import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/hooks/use-debounce")({
  component: UseDebouncePage,
});

function UseDebouncePage() {
  return (
    <div className="p-2">
      <h3>useDebounce</h3>
    </div>
  );
}
