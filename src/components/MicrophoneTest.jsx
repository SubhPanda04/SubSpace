import { useState } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

const MicrophoneTest = () => {
    const [permissionStatus, setPermissionStatus] = useState('not-requested');
    const { hasPermission, error, requestPermission } = useAudioRecorder();

    const handleRequestPermission = async () => {
        setPermissionStatus('requesting');
        const granted = await requestPermission();
        setPermissionStatus(granted ? 'granted' : 'denied');
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Microphone Access Test</h2>

            <div className="space-y-4">
                <div className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-sm font-semibold mb-2">Permission Status:</p>
                    <p className={`text-lg font-bold ${permissionStatus === 'granted' ? 'text-green-600' :
                            permissionStatus === 'denied' ? 'text-red-600' :
                                'text-gray-600'
                        }`}>
                        {permissionStatus.toUpperCase()}
                    </p>
                </div>

                {!hasPermission && (
                    <button
                        onClick={handleRequestPermission}
                        disabled={permissionStatus === 'requesting'}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        {permissionStatus === 'requesting' ? 'Requesting...' : 'Request Microphone Access'}
                    </button>
                )}

                {hasPermission && (
                    <div className="p-4 bg-green-100 border border-green-400 rounded-lg">
                        <p className="text-green-800 font-semibold">✓ Microphone access granted!</p>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-100 border border-red-400 rounded-lg">
                        <p className="text-red-800 font-semibold">Error:</p>
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MicrophoneTest;
