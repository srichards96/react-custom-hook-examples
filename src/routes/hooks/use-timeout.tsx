import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper } from "../../components/layout/page-wrapper";
import {
  Heading2,
  Heading3,
  ListItem,
  UnorderedList,
} from "../../components/ui/typography";
import { Textbox } from "../../components/ui/textbox";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { useTimeout } from "../../hooks/use-timeout";

export const Route = createFileRoute("/hooks/use-timeout")({
  component: RouteComponent,
});

function RouteComponent() {
  const [counter, setCounter] = useState(0);
  const [delay, setDelay] = useState<number | null>(null);
  const [delayInput, setDelayInput] = useState<number | null>(200);

  useTimeout(() => {
    setCounter((c) => c + 1);
    setDelay(null);
  }, delay);

  return (
    <PageWrapper>
      <Heading2>use-timeout</Heading2>

      <div className="grid gap-4">
        <div>
          <Heading3>Props</Heading3>
          <UnorderedList>
            <ListItem>
              <pre>callback: {"() => void"}</pre>
            </ListItem>

            <ListItem>
              <pre>delay: number | null</pre>
            </ListItem>
            <UnorderedList>
              <ListItem>Delay until callback is run</ListItem>
              <ListItem>If null, callback never runs</ListItem>
            </UnorderedList>
          </UnorderedList>
        </div>

        <div className="flex items-end gap-4 max-w-lg">
          <div className="grow">
            <Textbox
              type="number"
              label="Delay"
              value={delayInput ?? ""}
              onChange={(e) => {
                const value = e.target.valueAsNumber;
                setDelayInput(isNaN(value) ? null : value);
              }}
            />
          </div>

          {delay != null ? (
            <Button onClick={() => setDelay(null)}>Cancel</Button>
          ) : (
            <Button onClick={() => setDelay(delayInput)}>Start</Button>
          )}
        </div>

        <div>Count: {counter}</div>
      </div>
    </PageWrapper>
  );
}
