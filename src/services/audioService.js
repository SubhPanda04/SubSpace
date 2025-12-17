// Audio Service - Handles microphone access and audio recording
class AudioService {
    constructor() {
        this.mediaRecorder = null;
        this.audioStream = null;
        this.audioChunks = [];
        this.isRecording = false;
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

    releaseMicrophone() {
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
            this.audioStream = null;
        }
    }
}

export default AudioService;
