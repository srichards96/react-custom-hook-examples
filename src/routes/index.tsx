import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Heading1,
  linkClassNames,
  ListItem,
  UnorderedList,
} from "../components/ui/typography";
import { PageWrapper } from "../components/layout/page-wrapper";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <PageWrapper className="container mx-auto p-4">
      <Heading1>Index</Heading1>

      <UnorderedList>
        <ListItem>hooks/</ListItem>
        <UnorderedList>
          <ListItem>
            <Link to="/hooks/use-debounce" className={linkClassNames}>
              use-debounce
            </Link>
          </ListItem>
          <ListItem>
            <Link to="/hooks/use-interval" className={linkClassNames}>
              use-interval
            </Link>
          </ListItem>
          <ListItem>
            <Link to="/hooks/use-storage-state" className={linkClassNames}>
              use-storage-state
            </Link>
          </ListItem>
          <ListItem>
            <Link to="/hooks/use-timeout" className={linkClassNames}>
              use-timeout
            </Link>
          </ListItem>
        </UnorderedList>
      </UnorderedList>
    </PageWrapper>
  );
}
