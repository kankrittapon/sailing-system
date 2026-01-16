'use client';

import { rtdb } from '@/lib/firebase';
import { ref, set, get } from 'firebase/database';
import { useState, useEffect } from 'react';

interface ServerConfigEditorProps {
    onClose: () => void;
}

export default function ServerConfigEditor({ onClose }: ServerConfigEditorProps) {
    const [config, setConfig] = useState({
        serverUrl: '',
        apiBaseUrl: '',
        liveKitUrl: '',
        srtHost: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Load current config
        const configRef = ref(rtdb, 'config');
        get(configRef).then((snapshot) => {
            if (snapshot.exists()) {
                setConfig(snapshot.val());
            }
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const configRef = ref(rtdb, 'config');
            await set(configRef, {
                ...config,
                version: '1.0.0',
                lastUpdated: Date.now()
            });
            alert('Server config updated successfully!');
            onClose();
        } catch (error) {
            console.error('Failed to update config:', error);
            alert('Failed to update config');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}>
                <div style={{ color: '#fff' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: '#222',
                padding: '30px',
                borderRadius: '10px',
                maxWidth: '600px',
                width: '100%'
            }}>
                <h2 style={{ marginTop: 0, color: '#fff' }}>Server Configuration</h2>
                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '20px' }}>
                    Update server URLs for all Android devices
                </p>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>
                        Server URL
                    </label>
                    <input
                        type="text"
                        value={config.serverUrl}
                        onChange={(e) => setConfig({ ...config, serverUrl: e.target.value })}
                        placeholder="http://192.168.1.37:3000"
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: '#333',
                            color: '#fff',
                            border: '1px solid #555',
                            borderRadius: '5px'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>
                        API Base URL
                    </label>
                    <input
                        type="text"
                        value={config.apiBaseUrl}
                        onChange={(e) => setConfig({ ...config, apiBaseUrl: e.target.value })}
                        placeholder="http://192.168.1.37:3000/api"
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: '#333',
                            color: '#fff',
                            border: '1px solid #555',
                            borderRadius: '5px'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>
                        LiveKit URL
                    </label>
                    <input
                        type="text"
                        value={config.liveKitUrl}
                        onChange={(e) => setConfig({ ...config, liveKitUrl: e.target.value })}
                        placeholder="ws://192.168.1.37:7880"
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: '#333',
                            color: '#fff',
                            border: '1px solid #555',
                            borderRadius: '5px'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>
                        SRT Host
                    </label>
                    <input
                        type="text"
                        value={config.srtHost}
                        onChange={(e) => setConfig({ ...config, srtHost: e.target.value })}
                        placeholder="192.168.1.37"
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: '#333',
                            color: '#fff',
                            border: '1px solid #555',
                            borderRadius: '5px'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: '#4CAF50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.6 : 1
                        }}
                    >
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={saving}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: '#666',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: saving ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
