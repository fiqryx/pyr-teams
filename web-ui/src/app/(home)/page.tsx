import { createMetadata } from "@/lib/metadata";

import { Navbar } from "./components/navbar";
import { ConnectMeet } from "./components/connect-meet";
import { FeatureCarousel } from "./components/feature-carousel";

export const metadata = createMetadata()

export default function Page() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] min-h-screen">
      <Navbar />
      <main className="grid lg:grid-cols-2 justify-items-center gap-8 mt-16 lg:mt-24 px-4">
        <ConnectMeet className="max-w-[calc(100svw-2rem)]" />
        <FeatureCarousel className="max-w-[calc(100svw-2rem)]" />
      </main>
    </div>
  );
}
