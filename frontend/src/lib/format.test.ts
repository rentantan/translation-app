import { formatRelativeTime } from "./format";

test("相対時刻を表示する", () => {
  const now = new Date("2025-01-10T12:00:00+09:00");
  expect(formatRelativeTime("2025-01-10T11:59:40+09:00", now)).toBe("たった今");
  expect(formatRelativeTime("2025-01-10T11:55:00+09:00", now)).toBe("5分前");
  expect(formatRelativeTime("2025-01-10T09:00:00+09:00", now)).toBe("3時間前");
  expect(formatRelativeTime("2025-01-08T12:00:00+09:00", now)).toBe("2日前");
  expect(formatRelativeTime("invalid", now)).toBe("");
});
