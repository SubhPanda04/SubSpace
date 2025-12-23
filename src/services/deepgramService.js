import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

class DeepgramService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.deepgram = null;
        this.connection = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3;
    }

    async connect(onTranscript, onError) {
        if (!this.apiKey) {
            const error = 'Deepgram API key is required';
            console.error('[DeepgramService]', error);
            if (onError) onError(error);
            return false;
        }

        try {
            this.deepgram = createClient(this.apiKey);

            this.connection = this.deepgram.listen.live({
                model: 'nova-2',
                language: 'en',
                punctuate: true,
                interim_results: true,
            });

            const connectionOpened = await new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    console.error('[DeepgramService] Connection timeout');
                    resolve(false);
                }, 10000);

                this.connection.on(LiveTranscriptionEvents.Open, () => {
                    clearTimeout(timeout);
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    resolve(true);
                });

                this.connection.on(LiveTranscriptionEvents.Error, (error) => {
                    console.error('[DeepgramService] Connection error:', error);
                    clearTimeout(timeout);
                    this.isConnected = false;
                    if (onError) onError('Connection error');
                    resolve(false);
                });
            });

            if (!connectionOpened) {
                console.error('[DeepgramService] Failed to open connection');
                return false;
            }

            this.connection.on(LiveTranscriptionEvents.Transcript, (data) => {
                try {
                    const transcript = data.channel?.alternatives?.[0]?.transcript;
                    const isFinal = data.is_final;

                    if (transcript && transcript.length > 0 && onTranscript) {
                        onTranscript({
                            text: transcript,
                            isFinal: isFinal,
                            confidence: data.channel?.alternatives?.[0]?.confidence || 0
                        });
                    }
                } catch (err) {
                    console.error('[Deepgram] Error parsing transcript:', err);
                    if (onError) onError(err.message);
                }
            });

            this.connection.on(LiveTranscriptionEvents.Error, (error) => {
                console.error('Deepgram error:', error);
                this.isConnected = false;
                if (onError) onError('Connection error');
            });

            this.connection.on(LiveTranscriptionEvents.Close, () => {
                this.isConnected = false;

                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    setTimeout(() => this.connect(onTranscript, onError), 1000 * this.reconnectAttempts);
                }
            });

            return true;
        } catch (error) {
            console.error('Failed to connect to Deepgram:', error);
            if (onError) onError(error.message);
            return false;
        }
    }

    sendAudio(audioData) {
        if (this.connection && this.isConnected) {
            this.connection.send(audioData);
        }
    }

    disconnect() {
        if (this.connection) {
            this.connection.finish();
            this.connection = null;
            this.isConnected = false;
        }
    }
}

export default DeepgramService;
