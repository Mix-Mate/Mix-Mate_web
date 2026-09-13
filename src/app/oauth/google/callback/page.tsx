import { Suspense } from "react";
import GoogleCallbackScreen from "@/features/auth/components/GoogleCallbackScreen";

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={null}>
      <GoogleCallbackScreen />
    </Suspense>
  );
}
