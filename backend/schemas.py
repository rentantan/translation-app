from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    created_at: datetime
    
    # 警告を消すために、orm_modeをfrom_attributesに置き換える
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TranslationCreate(BaseModel):
    source_text: str
    target_lang: str

class TranslationOut(BaseModel):
    id: int
    source_text: str
    translated_text: Optional[str] = None
    target_lang: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
