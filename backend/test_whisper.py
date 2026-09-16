from app.services.whisper_service import whisper_service

result = whisper_service.transcribe("audio/test.wav")

print("\nTranscript:")
print(result["text"])

print("\nDetected language:")
print(result["language"])

print("\nLanguage probability:")
print(result["language_probability"])