/** 「3分前」のような相対時刻。1週間以上前は日時を表示する */
export const formatRelativeTime = (dateString: string, now = new Date()): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  if (minutes < 24 * 60) return `${Math.floor(minutes / 60)}時間前`;
  if (minutes < 7 * 24 * 60) return `${Math.floor(minutes / (24 * 60))}日前`;
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
