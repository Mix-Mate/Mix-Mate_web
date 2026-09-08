"use client";

import { useState } from "react";
import { uploadParticipantsExcel } from "../api/admin-participant.api";
import type { ParticipantExcelUploadResult } from "../types/participant.types";

type UploadParticipantsExcelResult =
  | { ok: true; data: ParticipantExcelUploadResult }
  | { ok: false; message: string };

export function useUploadParticipantsExcelMutation() {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (
    groupId: string,
    file: File,
  ): Promise<UploadParticipantsExcelResult> => {
    setIsPending(true);

    try {
      const data = await uploadParticipantsExcel(groupId, file);
      return { ok: true, data };
    } catch (error) {
      return {
        ok: false,
        message:
          error instanceof Error ? error.message : "엑셀 업로드에 실패했습니다.",
      };
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
}
