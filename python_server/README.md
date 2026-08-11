# Idiomify Python Pronunciation Scoring

This server provides an open-source pronunciation scoring endpoint using **faster-whisper**.

## Run

```bash
cd python_server
pip install -r requirements.txt

# CPU (default)
uvicorn main:app --host 0.0.0.0 --port 8000
```

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
