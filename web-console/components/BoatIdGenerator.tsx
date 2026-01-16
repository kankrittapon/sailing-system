'use client';

import { rtdb } from '@/lib/firebase';
import { ref, set } from 'firebase/database';
import { useState } from 'react';

interface BoatIdGeneratorProps {
    onClose: () => void;
}

export default function BoatIdGenerator({ onClose }: BoatIdGeneratorProps) {
    const [startNumber, setStartNumber] = useState(1);
    const [endNumber, setEndNumber] = useState(10);
    const [generating, setGenerating] = useState(false);

    const generateBoatIds = async () => {
        setGenerating(true);
        try {
            const promises = [];
            for (let i = startNumber; i <= endNumber; i++) {
                const boatId = `YRAT${i.toString().padStart(2, '0')}`;
                const deviceRef = ref(rtdb, `devices/${boatId}`);

                // Pre-create device with placeholder
                promises.push(set(deviceRef, {
                    id: boatId,
                    macAddress: 'pending',
                    status: 'offline',
                    lastSeen: 0,
                    number: '',
                    region: '',
                    teamName: ''
                }));
            }

            await Promise.all(promises);
            alert(`Generated ${endNumber - startNumber + 1} Boat IDs successfully!`);
            onClose();
        } catch (error) {
            console.error('Failed to generate Boat IDs:', error);
            alert('Failed to generate Boat IDs');
        } finally {
            setGenerating(false);
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
                <h2 style={{ marginTop: 0, color: '#fff' }}>Generate Boat IDs</h2>
                <p style={{ color: '#aaa', fontSize: '0.9rem' }}>
                    Pre-create Boat IDs (YRAT01-YRAT99) in database
                </p>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#aaa' }}>
                        Start Number (1-99)
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="99"
                        value={startNumber}
                        onChange={(e) => setStartNumber(parseInt(e.target.value))}
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
                        End Number (1-99)
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="99"
                        value={endNumber}
                        onChange={(e) => setEndNumber(parseInt(e.target.value))}
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

                <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '20px' }}>
                    Will generate: YRAT{startNumber.toString().padStart(2, '0')} to YRAT{endNumber.toString().padStart(2, '0')}
                    ({endNumber - startNumber + 1} devices)
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={generateBoatIds}
                        disabled={generating || startNumber > endNumber}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: '#4CAF50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: (generating || startNumber > endNumber) ? 'not-allowed' : 'pointer',
                            opacity: (generating || startNumber > endNumber) ? 0.6 : 1
                        }}
                    >
                        {generating ? 'Generating...' : 'Generate'}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={generating}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: '#666',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: generating ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
