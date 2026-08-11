import os
import re
import tempfile
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel


app = FastAPI(title="Idiomify Pronunciation Scoring")

# Allow Next.js dev server calls (and any local demo port).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_SIZE = os.environ.get("WHISPER_MODEL_SIZE", "base")  # base, small, medium, large-v3
DEVICE = os.environ.get("WHISPER_DEVICE", "cpu")  # cpu or cuda
COMPUTE_TYPE = os.environ.get("WHISPER_COMPUTE_TYPE", "int8")  # int8 for CPU, int8_float16/float16 for GPU

# Lazy model init to speed up cold starts.
_model: Optional[WhisperModel] = None


def get_model() -> WhisperModel:
    global _model
    if _model is None:
        _model = WhisperModel(
            MODEL_SIZE,
            device=DEVICE,
            compute_type=COMPUTE_TYPE,
        )
    return _model


def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s']", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def levenshtein(a: str, b: str) -> int:
    if a == b:
        return 0
    if not a:
        return len(b)
    if not b:
        return len(a)

    rows = len(a) + 1
    cols = len(b) + 1
    matrix = [[0] * cols for _ in range(rows)]

    for i in range(rows):
        matrix[i][0] = i
    for j in range(cols):
        matrix[0][j] = j

    for i in range(1, rows):
        for j in range(1, cols):
            cost = 0 if a[i - 1] == b[j - 1] else 1
            matrix[i][j] = min(
                matrix[i - 1][j] + 1,      # deletion
                matrix[i][j - 1] + 1,      # insertion
                matrix[i - 1][j - 1] + cost,  # substitution
            )

    return matrix[len(a)][len(b)]


def similarity_percent(target: str, transcript: str) -> int:
    a = normalize_text(target)
    b = normalize_text(transcript)
    if not a or not b:
        return 0
    if a == b:
        return 100

    distance = levenshtein(a, b)
    max_len = max(len(a), len(b))
    score = round((1 - distance / max_len) * 100)
    return max(0, min(100, score))


def transcribe_audio(model: WhisperModel, audio_path: str) -> str:
    segments, _info = model.transcribe(
        audio_path,
        language="en",
        vad_filter=True,
        beam_size=5,
    )
    parts = []
    for seg in segments:
        text = seg.text.strip()
        if text:
            parts.append(text)
    return " ".join(parts)


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/score")
def score(
    target: str = Form(...),
    audio: UploadFile = File(...),
):
    if not target.strip():
        return {"error": "target is required"}

    # Persist upload to a temp file so faster-whisper can read it.
    suffix = os.path.splitext(audio.filename or "audio.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_path = tmp.name
        tmp.write(audio.file.read())

    try:
        model = get_model()
        transcript = transcribe_audio(model, tmp_path)
        accuracy = similarity_percent(target, transcript)

        return {
            "accuracy": accuracy,
            "transcript": transcript,
        }
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass
