// Handles microphone access and audio recording
class AudioService {
    constructor() {
        this.mediaRecorder = null;
        this.audioStream = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.audioBuffer = [];
        this.bufferSize = 4096;
    }

    async requestMicrophoneAccess() {
        try {
            this.audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 16000,
                }
            });
            return true;
        } catch (error) {
            console.error('Microphone access denied:', error);
            throw new Error('Microphone access denied');
        }
    }

    startRecording(onDataAvailable) {
        if (!this.audioStream) {
            throw new Error('Microphone not initialized');
        }

        this.audioChunks = [];
        this.audioBuffer = [];
        this.mediaRecorder = new MediaRecorder(this.audioStream);

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
                if (onDataAvailable) {
                    onDataAvailable(event.data);
                }
            }
        };

        // Collect data every 100ms for real-time streaming
        this.mediaRecorder.start(100);
        this.isRecording = true;
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            return this.audioChunks;
        }
        return [];
    }

    // Convert audio blob to ArrayBuffer for Deepgram
    async blobToArrayBuffer(blob) {
        return await blob.arrayBuffer();
    }

    // Convert audio data to base64 for transmission
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Get audio stream for direct processing
    getAudioStream() {
        return this.audioStream;
    }

    releaseMicrophone() {
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
            this.audioStream = null;
        }
    }
}

export default AudioService;

