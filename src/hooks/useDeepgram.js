import { useState, useRef, useCallback } from 'react';
import DeepgramService from '../services/deepgramService';

// Hook for managing Deepgram transcription
export const useDeepgram = (apiKey) => {
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const deepgramServiceRef = useRef(null);

    if (!deepgramServiceRef.current && apiKey) {
        deepgramServiceRef.current = new DeepgramService(apiKey);
    }

    const connect = useCallback(async () => {
        if (!deepgramServiceRef.current) {
            setError('Deepgram service not initialized. API key required.');
            return false;
        }

        const handleTranscript = (result) => {
            if (result.isFinal) {
                setTranscript(prev => prev + ' ' + result.text);
                setInterimTranscript('');
            } else {
                setInterimTranscript(result.text);
            }
        };

        const handleError = (err) => {
            setError(err);
            setIsConnected(false);
        };

        const success = await deepgramServiceRef.current.connect(handleTranscript, handleError);
        setIsConnected(success);
        setError(null);
        return success;
    }, [apiKey]);

    const sendAudio = useCallback((audioData) => {
        if (deepgramServiceRef.current) {
            deepgramServiceRef.current.sendAudio(audioData);
        }
    }, []);

    const disconnect = useCallback(() => {
        if (deepgramServiceRef.current) {
            deepgramServiceRef.current.disconnect();
            setIsConnected(false);
        }
    }, []);

    const clearTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    return {
        transcript,
        interimTranscript,
        isConnected,
        error,
        connect,
        sendAudio,
        disconnect,
        clearTranscript,
    };
};
