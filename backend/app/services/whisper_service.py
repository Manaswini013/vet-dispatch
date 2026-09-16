from faster_whisper import WhisperModel


class WhisperService:
    def __init__(self):
        print("Loading Whisper model...")
        self.model = WhisperModel(
            "small",
            device="cpu",
            compute_type="int8",
        )
        print("Whisper model loaded.")

    def transcribe(self, audio_path: str):
        segments, info = self.model.transcribe(
            audio_path,
            beam_size=5,
        )

        text = " ".join(segment.text.strip() for segment in segments if segment.text.strip())

        return {
            "text": text,
            "language": info.language,
            "language_probability": float(info.language_probability),
        }


whisper_service = WhisperService()