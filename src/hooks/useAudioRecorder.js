import { useState, useRef, useCallback, useEffect } from 'react';
import AudioService from '../services/audioService';

// Custom hook for managing audio recording state
export const useAudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [error, setError] = useState(null);
    const audioServiceRef = useRef(null);

    if (!audioServiceRef.current) {
        audioServiceRef.current = new AudioService();
    }

    useEffect(() => {
        return () => {
            if (audioServiceRef.current) {
                audioServiceRef.current.releaseMicrophone();
            }
        };
    }, []);

    const requestPermission = useCallback(async () => {
        try {
            await audioServiceRef.current.requestMicrophoneAccess();
            setHasPermission(true);
            setError(null);
            return true;
        } catch (err) {
            setError(err.message);
            setHasPermission(false);
            return false;
        }
    }, []);

    const startRecording = useCallback((onDataAvailable) => {
        try {
            audioServiceRef.current.startRecording(onDataAvailable);
            setIsRecording(true);
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    }, []);

    const stopRecording = useCallback(() => {
        const chunks = audioServiceRef.current.stopRecording();
        setIsRecording(false);
        return chunks;
    }, []);

    const cleanup = useCallback(() => {
        audioServiceRef.current.releaseMicrophone();
        setHasPermission(false);
        setIsRecording(false);
    }, []);

    return {
        isRecording,
        hasPermission,
        error,
        requestPermission,
        startRecording,
        stopRecording,
        cleanup,
    };
};
