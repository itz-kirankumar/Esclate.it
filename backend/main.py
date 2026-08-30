import os
import tempfile
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydub import AudioSegment
from openai import OpenAI
from pydantic import BaseModel
import json

app = FastAPI(title="Escalate.it - AI Media Processing Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI
# Make sure to set OPENAI_API_KEY in your environment
client = OpenAI()

class GrievanceContext(BaseModel):
    transcriptText: str

@app.post("/api/v1/process-audio")
async def process_audio(audio: UploadFile = File(...)):
    """
    High-End Media Pipeline:
    1. Receives raw audio blob from frontend.
    2. Converts it in-memory to compressed MP3 (Supported by Whisper, reduces latency).
    3. Transcribes using OpenAI Whisper.
    """
    if not audio.filename:
        raise HTTPException(status_code=400, detail="No audio file provided")

    try:
        # Create a temporary file to store the incoming webm/blob
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_in:
            temp_in.write(await audio.read())
            temp_in_path = temp_in.name

        # Convert to highly compressed MP3 using Pydub
        temp_out_path = temp_in_path.replace(".webm", ".mp3")
        audio_segment = AudioSegment.from_file(temp_in_path)
        audio_segment.export(temp_out_path, format="mp3", bitrate="64k")

        # Transcribe with Whisper
        with open(temp_out_path, "rb") as mp3_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=mp3_file
            )

        # Cleanup temp files
        os.remove(temp_in_path)
        os.remove(temp_out_path)

        return {"transcript": transcription.text}

    except Exception as e:
        print(f"Media Pipeline Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))