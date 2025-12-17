import { useState, useEffect } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useDeepgram } from '../hooks/useDeepgram';

const Deepgram = () => {
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isKeyPressed, setIsKeyPressed] = useState(false);
    const [hotkey, setHotkey] = useState('Space');
    const [apiKey, setApiKey] = useState('');
    const [isApiKeySet, setIsApiKeySet] = useState(false);

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
        disconnect,
        clearTranscript,
    } = useDeepgram(apiKey);

    // Duration timer
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

    // Push-to-talk keyboard handler
    useEffect(() => {
        if (!hasPermission || !isConnected) return;

        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.code === hotkey && !isKeyPressed && !isRecording) {
                e.preventDefault();
                setIsKeyPressed(true);
                clearTranscript();
                startRecording((audioData) => {
                    sendAudio(audioData);
                });
            }
        };

        const handleKeyUp = (e) => {
            if (e.code === hotkey && isKeyPressed) {
                e.preventDefault();
                setIsKeyPressed(false);
                stopRecording();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [hasPermission, isConnected, isKeyPressed, isRecording, hotkey, startRecording, stopRecording, sendAudio, clearTranscript]);

    const handleSetApiKey = async () => {
        if (apiKey.trim()) {
            setIsApiKeySet(true);
            await connect();
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getHotkeyDisplay = (code) => {
        const keyMap = {
            'Space': 'Spacebar',
            'KeyR': 'R',
            'KeyT': 'T',
            'ControlLeft': 'Ctrl',
        };
        return keyMap[code] || code;
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(transcript);
            alert('Transcript copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Wispr Flow</h2>

            {/* API Key Setup */}
            {!isApiKeySet ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Deepgram API Key
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your Deepgram API key"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={handleSetApiKey}
                        disabled={!apiKey.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg"
                    >
                        Connect to Deepgram
                    </button>
                </div>
            ) : !hasPermission ? (
                <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800">✓ Connected to Deepgram</p>
                    </div>
                    <p className="text-gray-600">Please grant microphone access to use voice input.</p>
                    <button
                        onClick={requestPermission}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg"
                    >
                        Request Microphone Access
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Connection Status */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Status:</span>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm font-semibold">{isConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>
                    </div>

                    {/* Hotkey Configuration */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Push-to-Talk Hotkey
                        </label>
                        <select
                            value={hotkey}
                            onChange={(e) => setHotkey(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isRecording}
                        >
                            <option value="Space">Spacebar</option>
                            <option value="KeyR">R Key</option>
                            <option value="KeyT">T Key</option>
                            <option value="ControlLeft">Ctrl Key</option>
                        </select>
                    </div>

                    {/* Recording Indicator */}
                    <div className="text-center space-y-3">
                        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full transition-all ${isRecording
                            ? 'bg-red-100 border-4 border-red-500 scale-110'
                            : 'bg-gray-100 border-4 border-gray-300'
                            }`}>
                            <div className={`w-10 h-10 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
                                }`}></div>
                        </div>

                        {isRecording ? (
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-red-600">LISTENING...</p>
                                <p className="text-2xl font-mono font-bold text-gray-800">
                                    {formatDuration(recordingDuration)}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Release <kbd className="px-2 py-1 bg-gray-200 rounded font-mono text-xs">
                                        {getHotkeyDisplay(hotkey)}
                                    </kbd> to stop
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-gray-600">Ready</p>
                                <p className="text-sm text-gray-600">
                                    Hold <kbd className="px-2 py-1 bg-gray-200 rounded font-mono text-xs">
                                        {getHotkeyDisplay(hotkey)}
                                    </kbd> to speak
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Transcript Display */}
                    <div className="min-h-32 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-700">Transcript</h3>
                            {transcript && (
                                <button
                                    onClick={copyToClipboard}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                                >
                                    Copy
                                </button>
                            )}
                        </div>
                        <div className="text-gray-800 space-y-2">
                            {transcript && <p className="leading-relaxed">{transcript}</p>}
                            {interimTranscript && (
                                <p className="text-gray-500 italic">{interimTranscript}</p>
                            )}
                            {!transcript && !interimTranscript && (
                                <p className="text-gray-400 text-sm">Your transcription will appear here...</p>
                            )}
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Tip:</strong> Hold the hotkey and speak. Your voice will be transcribed in real-time!
                        </p>
                    </div>
                </div>
            )}

            {/* Errors */}
            {(audioError || deepgramError) && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded-lg">
                    <p className="text-red-800 font-semibold">Error:</p>
                    <p className="text-red-700 text-sm">{audioError || deepgramError}</p>
                </div>
            )}
        </div>
    );
};

export default Deepgram;
