// Deepgram API for speech-to-text transcription
class DeepgramService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3;
    }

    async connect(onTranscript, onError) {
        if (!this.apiKey) {
            const error = 'Deepgram API key is required';
            console.error(error);
            if (onError) onError(error);
            return false;
        }

        try {
            // Deepgram WebSocket URL for real-time transcription
            const url = `wss://api.deepgram.com/v1/listen?encoding=webm&sample_rate=16000&language=en&punctuate=true&interim_results=true`;

            this.socket = new WebSocket(url, ['token', this.apiKey]);

            this.socket.onopen = () => {
                console.log('Connected to Deepgram');
                this.isConnected = true;
                this.reconnectAttempts = 0;
            };

            this.socket.onmessage = (message) => {
                try {
                    const data = JSON.parse(message.data);

                    // Handle transcript results
                    if (data.channel && data.channel.alternatives && data.channel.alternatives.length > 0) {
                        const transcript = data.channel.alternatives[0].transcript;
                        const isFinal = data.is_final;

                        if (transcript && transcript.length > 0 && onTranscript) {
                            onTranscript({
                                text: transcript,
                                isFinal: isFinal,
                                confidence: data.channel.alternatives[0].confidence
                            });
                        }
                    }
                } catch (err) {
                    console.error('Error parsing Deepgram response:', err);
                    if (onError) onError(err.message);
                }
            };

            this.socket.onerror = (error) => {
                console.error('Deepgram WebSocket error:', error);
                this.isConnected = false;
                if (onError) onError('WebSocket connection error');
            };

            this.socket.onclose = () => {
                console.log('Deepgram connection closed');
                this.isConnected = false;

                // Auto-reconnect logic
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
                    setTimeout(() => this.connect(onTranscript, onError), 1000 * this.reconnectAttempts);
                }
            };

            return true;
        } catch (error) {
            console.error('Failed to connect to Deepgram:', error);
            if (onError) onError(error.message);
            return false;
        }
    }

    sendAudio(audioData) {
        if (this.socket && this.isConnected && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(audioData);
        } else {
            console.warn('Cannot send audio: WebSocket not connected');
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
            console.log('Disconnected from Deepgram');
        }
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts
        };
    }
}

export default DeepgramService;

