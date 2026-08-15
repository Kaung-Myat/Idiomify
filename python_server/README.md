# Idiomify Python Pronunciation Scoring

This server provides an open-source pronunciation scoring endpoint using **faster-whisper**.

## Run

```bash
cd python_server
source .venv/bin/activate   # or: python -m venv .venv && pip install -r requirements.txt

# Either entry works:
uvicorn app.main:app --host 0.0.0.0 --port 8000
# uvicorn main:app --host 0.0.0.0 --port 8000
```

Use port **8000** so it matches the Next.js client (`NEXT_PUBLIC_PYTHON_SCORE_URL` / SpeakPanel).

## Endpoint

- `POST /score`
  - `target` (form field, required)
  - `audio` (file upload, required)

Returns:

```json
{ "accuracy": 0-100, "transcript": "..." }
```

## Environment variables

- `WHISPER_MODEL_SIZE` (default: `base`)
- `WHISPER_DEVICE` (default: `cpu`)
- `WHISPER_COMPUTE_TYPE` (default: `int8`)
