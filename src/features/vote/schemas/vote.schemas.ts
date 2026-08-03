import { z } from "zod";

export const mvpVoteSubmissionSchema = z
  .object({
    groupId: z.string().min(1),
    voterId: z.string().min(1),
    candidateId: z.string().min(1),
  })
  .refine((value) => value.voterId !== value.candidateId, {
    message: "자기 자신에게는 투표할 수 없습니다.",
    path: ["candidateId"],
  });

export const attendanceVoteSubmissionSchema = z.object({
  groupId: z.string().min(1),
  memberId: z.string().min(1),
  choice: z.enum(["ATTEND", "ABSENT"]),
});
