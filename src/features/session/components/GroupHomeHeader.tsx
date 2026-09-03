"use client";

import { useRouter } from "next/navigation";
import { useState, type ComponentProps } from "react";
import MainHomeExitPopup from "@/modals/user/MainHomeExitPopup";
import { appRoutes } from "@/shared/lib/navigation/routes";
import Header from "@/shared/ui/Header";

type GroupHomeHeaderProps = Omit<ComponentProps<typeof Header>, "onBack">;

export default function GroupHomeHeader(props: GroupHomeHeaderProps) {
  const router = useRouter();
  const [exitPopupOpen, setExitPopupOpen] = useState(false);

  return (
    <>
      <Header {...props} onBack={() => setExitPopupOpen(true)} />
      <MainHomeExitPopup
        open={exitPopupOpen}
        onClose={() => setExitPopupOpen(false)}
        onConfirm={() => {
          setExitPopupOpen(false);
          router.replace(appRoutes.home());
        }}
      />
    </>
  );
}
