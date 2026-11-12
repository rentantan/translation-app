from translator import split_text


def test_short_text_is_single_chunk():
    assert split_text("hello") == ["hello"]


def test_chunks_roundtrip_and_respect_limit():
    text = ("これはテストの文章です。" * 60) + "\n" + ("This is a sentence. " * 40)
    chunks = split_text(text, 100)
    assert "".join(chunks) == text
    assert all(len(c) <= 100 for c in chunks)


def test_prefers_sentence_boundaries():
    text = "あ" * 80 + "。" + "い" * 80
    chunks = split_text(text, 100)
    assert chunks[0].endswith("。")


def test_prefers_newlines():
    text = "a" * 50 + ". word\n" + "x" * 90
    chunks = split_text(text, 100)
    assert chunks[0].endswith("\n")


def test_hard_split_when_no_boundary():
    text = "x" * 250
    assert [len(c) for c in split_text(text, 100)] == [100, 100, 50]
