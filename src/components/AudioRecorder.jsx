import { useState, useEffect } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

const AudioRecorder = () => {
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const {
        isRecording,
        hasPermission,
        error,
        requestPermission,
        startRecording,
        stopRecording,
        cleanup
    } = useAudioRecorder();

    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } else {
            setRecordingDuration(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const handleStartRecording = () => {
        setAudioBlob(null);
        startRecording((audioData) => {
            // Audio data callback - can be used for real-time processing
            console.log('Audio data received:', audioData.size, 'bytes');
        });
    };

    const handleStopRecording = () => {
        const chunks = stopRecording();
        if (chunks.length > 0) {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            setAudioBlob(blob);
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Audio Recorder</h2>

            {!hasPermission ? (
                <div className="space-y-4">
                    <p className="text-gray-600">Please grant microphone access to start recording.</p>
                    <button
                        onClick={requestPermission}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        Request Microphone Access
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Recording Status */}
                    <div className="flex items-center justify-center space-x-3">
                        {isRecording && (
                            <>
                                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-2xl font-mono font-bold text-gray-800">
                                    {formatDuration(recordingDuration)}
                                </span>
                            </>
                        )}
                        {!isRecording && recordingDuration === 0 && (
                            <span className="text-gray-500">Ready to record</span>
                        )}
                    </div>

                    {/* Recording Controls */}
                    <div className="flex gap-3">
                        {!isRecording ? (
                            <button
                                onClick={handleStartRecording}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <circle cx="10" cy="10" r="8" />
                                </svg>
                                Start Recording
                            </button>
                        ) : (
                            <button
                                onClick={handleStopRecording}
                                className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <rect x="6" y="6" width="8" height="8" />
                                </svg>
                                Stop Recording
                            </button>
                        )}
                    </div>

                    {/* Audio Playback */}
                    {audioBlob && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                            <p className="text-green-800 font-semibold">✓ Recording saved!</p>
                            <audio
                                controls
                                src={URL.createObjectURL(audioBlob)}
                                className="w-full"
                            />
                            <p className="text-sm text-gray-600">
                                Size: {(audioBlob.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded-lg">
                    <p className="text-red-800 font-semibold">Error:</p>
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
};

export default AudioRecorder;
