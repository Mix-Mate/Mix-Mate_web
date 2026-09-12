import { Suspense } from "react";
import KakaoCallbackScreen from "@/features/auth/components/KakaoCallbackScreen";

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={null}>
      <KakaoCallbackScreen />
    </Suspense>
  );
}
