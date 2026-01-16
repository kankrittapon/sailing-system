'use client';

import { rtdb } from '@/lib/firebase';
import { Device } from '@/lib/types';
import { ref, update } from 'firebase/database';
import { useState } from 'react';

interface DeviceEditorProps {
    device: Device;
    onClose: () => void;
}

export default function DeviceEditor({ device, onClose }: DeviceEditorProps) {
    const [formData, setFormData] = useState({
        number: device.number || '',
        region: device.region || '',
        teamName: device.teamName || ''
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const deviceRef = ref(rtdb, `devices/${device.id}`);
            await update(deviceRef, {
                number: formData.number,
                region: formData.region,
                teamName: formData.teamName
            });
            onClose();
        } catch (error) {
            console.error('Failed to update device:', error);
            alert('Failed to update device');
        } finally {
            setSaving(false);
        }
    };

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
                maxWidth: '500px',
                width: '100%'
            }}>
                <h2 style={{ marginTop: 0, color: '#fff' }}>Edit Device: {device.id}</h2>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>
                        Sail Number
                    </label>
                    <input
                        type="text"
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        placeholder="e.g., THA 123"
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
                        Region/Country
                    </label>
                    <input
                        type="text"
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        placeholder="e.g., Thailand"
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
                        Team/Sailor Name
                    </label>
                    <input
                        type="text"
                        value={formData.teamName}
                        onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                        placeholder="e.g., Team Alpha"
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
                        {saving ? 'Saving...' : 'Save'}
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
