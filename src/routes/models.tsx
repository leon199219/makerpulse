import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/models")({
  component: () => <Outlet />,
});
