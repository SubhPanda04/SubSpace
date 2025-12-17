// Deepgram Service - Handles Deepgram API for speech-to-text transcription
class DeepgramService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.socket = null;
        this.isConnected = false;
    }

    async connect(onTranscript, onError) {
        // TODO: Implement Deepgram WebSocket connection
        console.log('Connecting to Deepgram...');
    }

    sendAudio(audioData) {
        if (this.socket && this.isConnected) {
            this.socket.send(audioData);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.isConnected = false;
        }
    }
}

export default DeepgramService;
