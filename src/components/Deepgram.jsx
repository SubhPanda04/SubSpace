import { useState, useEffect, useRef } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useDeepgram } from '../hooks/useDeepgram';

const Deepgram = () => {
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [totalDuration, setTotalDuration] = useState(0);
    const [showCopied, setShowCopied] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;

    const {
        isRecording,
        hasPermission,
        error: audioError,
        requestPermission,
        startRecording,
        stopRecording,
    } = useAudioRecorder();

    const {
        transcript,
        interimTranscript,
        isConnected,
        error: deepgramError,
        connect,
        sendAudio,
        clearTranscript,
    } = useDeepgram(apiKey);

    const hasConnectedRef = useRef(false);

    useEffect(() => {
        if (apiKey && !isConnected && !hasConnectedRef.current) {
            hasConnectedRef.current = true;
            connect();
        }
    }, [apiKey, isConnected]);

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
                setTotalDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const handleStartRecording = async () => {
        if (!hasPermission) {
            const granted = await requestPermission();
            if (!granted || !isConnected) {
                return;
            }
        }

        if (!isConnected) {
            return;
        }

        startRecording((audioData) => {
            sendAudio(audioData);
        });
    };

    const handleStopRecording = () => {
        stopRecording();
        setRecordingDuration(0);
    };

    const handleClearAll = () => {
        setIsDeleting(true);
        setTimeout(() => {
            clearTranscript();
            setRecordingDuration(0);
            setTotalDuration(0);
            setIsDeleting(false);
        }, 300);
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(transcript);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="h-screen bg-black relative overflow-hidden">
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center p-8">
                {/* Header */}
                <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-8 max-w-3xl mx-auto w-full">
                    <div className="flex items-center gap-2.5">
                        <div className="text-white/90 text-sm font-light tracking-[0.3em]">WISPR</div>
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${isConnected ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-white/30'}`}></div>
                    </div>
                    {totalDuration > 0 && (
                        <div className="text-white/50 text-xs font-mono tabular-nums">{formatDuration(totalDuration)}</div>
                    )}
                </div>

                {/* Main Card - Glassmorphic */}
                <div className="w-full max-w-2xl">
                    <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 shadow-2xl shadow-black/40">
                        {/* Transcript Display */}
                        <div className="min-h-[400px] max-h-[400px] overflow-y-auto mb-8 px-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {transcript || interimTranscript ? (
                                <div className="space-y-3">
                                    {transcript && (
                                        <p className="text-white/95 text-lg leading-relaxed whitespace-pre-wrap">
                                            {transcript}
                                        </p>
                                    )}
                                    {interimTranscript && (
                                        <p className="text-white/40 text-lg leading-relaxed italic">
                                            {interimTranscript}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.08] mx-auto flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                            </svg>
                                        </div>
                                        <p className="text-white/30 text-sm">
                                            {!hasPermission ? 'Enable microphone to begin' : 'Press to record'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-4">
                            {/* Circular Record Button */}
                            <div className="relative">
                                {!isRecording ? (
                                    <button
                                        onClick={handleStartRecording}
                                        disabled={!isConnected && hasPermission}
                                        className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 disabled:from-white/10 disabled:to-white/10 shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 disabled:shadow-none transition-all duration-300 ease-out flex items-center justify-center group"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-white group-disabled:bg-white/30 transition-all duration-200 pointer-events-none"></div>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleStopRecording}
                                        className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 shadow-xl shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 transition-all duration-300 ease-out flex items-center justify-center relative"
                                    >
                                        <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping pointer-events-none"></div>
                                        <div className="w-5 h-5 rounded bg-white transition-all duration-200 pointer-events-none"></div>
                                    </button>
                                )}
                                {isRecording && (
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-xs font-mono whitespace-nowrap transition-opacity duration-200">
                                        {formatDuration(recordingDuration)}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2.5 relative">
                                <button
                                    onClick={copyToClipboard}
                                    disabled={!transcript}
                                    className={`w-12 h-12 rounded-full backdrop-blur-sm bg-white/[0.08] hover:bg-white/[0.15] disabled:bg-white/[0.03] border border-white/[0.08] flex items-center justify-center group transition-all duration-300 ease-out ${showCopied ? 'scale-110 bg-emerald-500/20 border-emerald-500/30' : ''}`}
                                    title="Copy"
                                >
                                    {showCopied ? (
                                        <svg className="w-4 h-4 text-emerald-400 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-white/70 group-disabled:text-white/20 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </button>
                                <button
                                    onClick={handleClearAll}
                                    disabled={!transcript && totalDuration === 0}
                                    className={`w-12 h-12 rounded-full backdrop-blur-sm bg-white/[0.08] hover:bg-white/[0.15] disabled:bg-white/[0.03] border border-white/[0.08] flex items-center justify-center group transition-all duration-300 ease-out ${isDeleting ? 'scale-90 bg-red-500/20 border-red-500/30' : ''}`}
                                    title="Clear"
                                >
                                    <svg className={`w-4 h-4 text-white/70 group-disabled:text-white/20 transition-all duration-300 ease-out ${isDeleting ? 'rotate-12' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>

                                {/* Copy Toast */}
                                {showCopied && (
                                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-4 py-2.5 backdrop-blur-xl bg-emerald-500/20 border border-emerald-500/30 rounded-xl shadow-lg transition-all duration-200 ease-out">
                                        <p className="text-emerald-300 text-xs font-medium whitespace-nowrap">Copied!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Error Display */}
                        {(audioError || deepgramError) && (
                            <div className="mt-6 px-4 py-3 backdrop-blur-sm bg-red-500/10 border border-red-500/20 rounded-xl transition-all duration-300 ease-out">
                                <p className="text-red-300 text-xs text-center">{audioError || deepgramError}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Deepgram;
