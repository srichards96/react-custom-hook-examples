import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper } from "../../components/layout/page-wrapper";
import {
  Heading2,
  Heading3,
  ListItem,
  Paragraph,
  UnorderedList,
} from "../../components/ui/typography";
import { Textbox } from "../../components/ui/textbox";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { useDebounce } from "../../hooks/use-debounce";

export const Route = createFileRoute("/hooks/use-debounce")({
  component: RouteComponent,
});

function RouteComponent() {
  const [counter, setCounter] = useState(0);
  const [delay, setDelay] = useState(200);

  const debouncedSetCounter = useDebounce(setCounter, delay);

  return (
    <PageWrapper>
      <Heading2>use-debounce</Heading2>

      <div className="grid gap-4">
        <div>
          <Heading3>Generics</Heading3>
          <UnorderedList>
            <ListItem>
              <pre>TArgs extends unknown[]</pre>
            </ListItem>
            <UnorderedList>
              <ListItem>
                The arguments for callback. This is any number of arguments of
                any type.
              </ListItem>
            </UnorderedList>
          </UnorderedList>

          <Heading3>Props</Heading3>
          <UnorderedList>
            <ListItem>
              <pre>callback: {"(...args: TArgs) => void"}</pre>
            </ListItem>

            <ListItem>
              <pre>delay: number</pre>
            </ListItem>
          </UnorderedList>

          <Heading3>Returns</Heading3>
          <Paragraph>
            Function that when called will not run until delay ms have passed.
          </Paragraph>
          <Paragraph>
            If the function is called again before delay ms have passed, the
            delay is reset.
          </Paragraph>
          <Paragraph>
            Includes 3 function properties: immedate, flush, and cancel.
          </Paragraph>

          <UnorderedList>
            <ListItem>
              <pre>
                immediate: {"<TArgs extends unknown[]>(...args: TArgs) => void"}
              </pre>
            </ListItem>
            <UnorderedList>
              <ListItem>
                Runs function immediately. If another call is currently pending,
                it is unaffected.
              </ListItem>
            </UnorderedList>

            <ListItem>
              <pre>flush: {"() => void"}</pre>
            </ListItem>
            <UnorderedList>
              <ListItem>
                If a call is currently pending, it is run immediately instead of
                after delay ms.
              </ListItem>
              <ListItem>
                Does nothing if there is no call currently pending.
              </ListItem>
            </UnorderedList>

            <ListItem>
              <pre>cancel: {"() => void"}</pre>
            </ListItem>
            <UnorderedList>
              <ListItem>
                If a call is currently pending, it is cancelled.
              </ListItem>
              <ListItem>
                Does nothing if there is no call currently pending.
              </ListItem>
            </UnorderedList>
          </UnorderedList>
        </div>

        <Textbox
          type="number"
          label="Delay (ms)"
          min={0}
          max={5000}
          value={delay}
          onChange={(e) => {
            const value = e.target.valueAsNumber;
            setDelay(isNaN(value) ? 0 : value);
          }}
        />

        <div>Counter: {counter}</div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Button onClick={() => debouncedSetCounter((c) => c + 1)}>
              Debounced Increment
            </Button>
            <Button onClick={() => debouncedSetCounter.immediate((c) => c + 1)}>
              Immediate Increment
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => debouncedSetCounter.flush()}>Flush</Button>
            <Button onClick={() => debouncedSetCounter.cancel()}>Cancel</Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
