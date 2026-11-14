"""翻訳処理。長文を自然な位置で分割して Google 翻訳に渡す。"""
import re
from typing import Awaitable, Callable

from googletrans import Translator

MAX_CHUNK = 500

# 分割位置の優先順位: 改行 > 文末 > 読点・カンマ > 空白
_BREAK_PATTERNS = [
    re.compile(r"\n"),
    re.compile(r"[。．！？!?]|\.(?=\s)"),
    re.compile(r"[、，,;；]"),
    re.compile(r"\s"),
]


def split_text(text: str, max_len: int = MAX_CHUNK) -> list[str]:
    """text を max_len 以下のチャンクに分割する。

    区切り文字は直前のチャンク側に残すので、"".join(chunks) == text が成り立つ。
    """
    chunks: list[str] = []
    rest = text
    while len(rest) > max_len:
        window = rest[:max_len]
        cut = 0
        for pattern in _BREAK_PATTERNS:
            matches = list(pattern.finditer(window))
            # あまりに短いチャンクにならないよう、後半にある区切りだけを採用
            if matches and matches[-1].end() > max_len // 3:
                cut = matches[-1].end()
                break
        if cut == 0:
            cut = max_len  # 区切りが見つからなければ強制分割
        chunks.append(rest[:cut])
        rest = rest[cut:]
    if rest:
        chunks.append(rest)
    return chunks


def _trailing_whitespace(s: str) -> str:
    return s[len(s.rstrip()):]


async def google_translate(text: str, dest: str, src: str = "auto") -> tuple[str, str]:
    """text を翻訳して (翻訳結果, 検出された原文の言語) を返す。"""
    chunks = split_text(text)
    pieces: list[str] = []
    detected: str | None = None

    async with Translator() as translator:
        for chunk in chunks:
            if not chunk.strip():
                pieces.append(chunk)
                continue
            result = await translator.translate(chunk, dest=dest, src=src)
            if detected is None:
                detected = result.src
            # Google 翻訳は末尾の改行や空白を落とすので、元の区切りを復元する
            pieces.append(result.text + _trailing_whitespace(chunk))

    return "".join(pieces).rstrip(), (detected or src).lower()


TranslateFn = Callable[[str, str, str], Awaitable[tuple[str, str]]]


def get_translate_fn() -> TranslateFn:
    """FastAPI の依存関係。テストではこれを差し替える。"""
    return google_translate
