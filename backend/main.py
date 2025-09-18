from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from googletrans import Translator

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

translator = Translator()

class TranslationRequest(BaseModel):
    text: str
    target_lang: str = "en"

MAX_CHUNK = 500  # 長文対策

@app.post("/translate")
def translate(request: TranslationRequest):
    text = request.text
    chunks = [text[i:i+MAX_CHUNK] for i in range(0, len(text), MAX_CHUNK)]
    translated_text = ""
    for chunk in chunks:
        try:
            translated_text += translator.translate(chunk, dest=request.target_lang).text
        except Exception:
            return {"translated_text": "翻訳に失敗しました"}
    return {"translated_text": translated_text}
