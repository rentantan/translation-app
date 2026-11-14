"""シンプルなメモリ内レート制限（単一プロセス前提）。

複数ワーカー・複数サーバーで動かす場合は Redis などの共有ストアに置き換えること。
"""
import threading
import time
from collections import defaultdict, deque

from app.config import LOGIN_MAX_FAILURES, LOGIN_LOCK_SECONDS, TRANSLATE_RATE_LIMIT


class RateLimiter:
    """period 秒の間に max_calls 回まで許可するスライディングウィンドウ。"""

    def __init__(self, max_calls: int, period: float):
        self.max_calls = max_calls
        self.period = period
        self._calls: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def _prune(self, key: str, now: float) -> deque[float]:
        calls = self._calls[key]
        while calls and now - calls[0] >= self.period:
            calls.popleft()
        return calls

    def is_limited(self, key: str) -> bool:
        with self._lock:
            return len(self._prune(key, time.monotonic())) >= self.max_calls

    def hit(self, key: str) -> bool:
        """1 回分を記録する。上限を超えていたら記録せず False を返す。"""
        with self._lock:
            now = time.monotonic()
            calls = self._prune(key, now)
            if len(calls) >= self.max_calls:
                return False
            calls.append(now)
            return True

    def reset(self, key: str) -> None:
        with self._lock:
            self._calls.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._calls.clear()


# ログイン失敗の回数（IP + ユーザー名ごと）
login_failures = RateLimiter(LOGIN_MAX_FAILURES, LOGIN_LOCK_SECONDS)

# 翻訳リクエスト数（ユーザーごと・1 分あたり）
translate_limiter = RateLimiter(TRANSLATE_RATE_LIMIT, 60)
