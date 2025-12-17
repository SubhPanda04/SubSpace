import { useState, useEffect } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

const PushToTalk = () => {
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [isKeyPressed, setIsKeyPressed] = useState(false);
    const [hotkey, setHotkey] = useState('Space');

    const {
        isRecording,
        hasPermission,
        error,
        requestPermission,
        startRecording,
        stopRecording,
    } = useAudioRecorder();

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
        if (!hasPermission) return;

        const handleKeyDown = (e) => {
            // Prevent recording if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.code === hotkey && !isKeyPressed && !isRecording) {
                e.preventDefault();
                setIsKeyPressed(true);
                setAudioBlob(null);
                startRecording((audioData) => {
                    console.log('Audio chunk:', audioData.size, 'bytes');
                });
            }
        };

        const handleKeyUp = (e) => {
            if (e.code === hotkey && isKeyPressed) {
                e.preventDefault();
                setIsKeyPressed(false);
                const chunks = stopRecording();
                if (chunks.length > 0) {
                    const blob = new Blob(chunks, { type: 'audio/webm' });
                    setAudioBlob(blob);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [hasPermission, isKeyPressed, isRecording, hotkey, startRecording, stopRecording]);

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

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Push-to-Talk Recorder</h2>

            {!hasPermission ? (
                <div className="space-y-4">
                    <p className="text-gray-600">Please grant microphone access to use push-to-talk.</p>
                    <button
                        onClick={requestPermission}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        Request Microphone Access
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
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
                        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full transition-all ${isRecording
                                ? 'bg-red-100 border-4 border-red-500 scale-110'
                                : 'bg-gray-100 border-4 border-gray-300'
                            }`}>
                            <div className={`w-12 h-12 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
                                }`}></div>
                        </div>

                        {isRecording ? (
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-red-600">RECORDING...</p>
                                <p className="text-3xl font-mono font-bold text-gray-800">
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
                                    </kbd> to record
                                </p>
                            </div>
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
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Size: {(audioBlob.size / 1024).toFixed(2)} KB</span>
                                <span>Type: {audioBlob.type}</span>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Tip:</strong> Hold down the hotkey to start recording, release to stop.
                            Your audio will be saved and you can play it back.
                        </p>
                    </div>
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

export default PushToTalk;
