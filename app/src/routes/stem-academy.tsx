import { createFileRoute } from "@tanstack/react-router";
import StemAcademy from "../components/stem-academy";

export const Route = createFileRoute("/stem-academy")({
  component: () => (
    <div className="min-h-screen bg-cosmos-bg">
      <StemAcademy />
    </div>
  ),
});
