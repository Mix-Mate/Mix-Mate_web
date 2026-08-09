import { expect, test } from "@playwright/test";

test("관리자는 진행 현황에서 1차를 종료하고 MVP 투표로 이동한다", async ({
  page,
}) => {
  await page.goto(
    "/groups/1/home?role=admin&scenario=round1-active",
  );

  await page
    .getByRole("button", {
      name: "1차 술자리 중, 진행 현황 보기",
    })
    .click();

  await expect(page.getByTestId("admin-progress")).toBeVisible();
  await expect(page.getByRole("heading", { name: "진행 현황 보기" })).toBeVisible();

  await page
    .getByRole("button", { name: "1차 술자리 종료하기" })
    .click();

  await expect(
    page.getByRole("dialog", { name: "1차 술자리를 종료할까요?" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "종료하기", exact: true }).click();

  await expect(page).toHaveURL(/\/groups\/1\/votes\/mvp/);
  await expect(page.getByTestId("mvp-vote-screen")).toBeVisible();
});
