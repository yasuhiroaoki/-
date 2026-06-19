import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";

// useSearchParams を使う HomeClient は Suspense 境界で包む必要がある。
export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomeClient />
    </Suspense>
  );
}
