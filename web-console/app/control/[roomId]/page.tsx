'use client';

import { rtdb } from '@/lib/firebase';
import { Room } from '@/lib/types';
import { ref, onValue, off } from 'firebase/database';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LiveKitRoom, GridLayout, ParticipantTile, useTracks, useRoomContext } from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';

function ControlGrid() {
    const room = useRoomContext();
    const tracks = useTracks([
        { source: Track.Source.Camera, withPlaceholder: false },
    ], { onlySubscribed: false });

    const params = useParams();
    const roomId = params.roomId as string;
    const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);

    useEffect(() => {
        const roomRef = ref(rtdb, `rooms/${roomId}/activeDeviceId`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            setActiveDeviceId(snapshot.val());
        });
        return () => off(roomRef);
    }, [roomId]);

    const handleTake = async (deviceId: string) => {
        try {
            await fetch('/api/room/switch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId, deviceId })
            });
        } catch (error) {
            console.error('Failed to switch device:', error);
        }
    };

    return (
        <div style={{ padding: '20px', background: '#111', minHeight: '100vh', color: '#fff' }}>
            <header style={{ marginBottom: '20px' }}>
                <h1>🎬 Control Room: {roomId}</h1>
                <p style={{ color: '#aaa' }}>Active: {activeDeviceId || 'None'}</p>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
            }}>
                {tracks.map((track) => {
                    const deviceId = track.participant.identity;
                    const isActive = deviceId === activeDeviceId;

                    return (
                        <div
                            key={track.participant.sid}
                            style={{
                                background: '#222',
                                borderRadius: '8px',
                                padding: '10px',
                                border: isActive ? '3px solid #4CAF50' : '1px solid #444'
                            }}
                        >
                            <div style={{ position: 'relative', aspectRatio: '16/9', background: '#000' }}>
                                <ParticipantTile />
                            </div>
                            <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                <h3 style={{ margin: '5px 0' }}>{deviceId}</h3>
                                <button
                                    onClick={() => handleTake(deviceId)}
                                    disabled={isActive}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        background: isActive ? '#4CAF50' : '#667eea',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: isActive ? 'not-allowed' : 'pointer',
                                        fontSize: '1rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {isActive ? '✅ LIVE' : 'TAKE'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {tracks.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    No devices streaming to this room yet.
                </div>
            )}
        </div>
    );
}

export default function ControlRoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomId = params.roomId as string;

    const [token, setToken] = useState('');
    const [url, setUrl] = useState('');

    useEffect(() => {
        if (!roomId) return;

        (async () => {
            try {
                const resp = await fetch('/api/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        roomName: roomId,
                        participantName: `admin-control`,
                        role: 'admin'
                    }),
                });
                const data = await resp.json();
                setToken(data.token);
                setUrl(data.wsUrl);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [roomId]);

    if (!roomId) {
        return <div style={{ color: '#fff', padding: 20 }}>No room specified.</div>;
    }

    if (token === '') {
        return <div style={{ color: '#fff', padding: 20 }}>Loading control room...</div>;
    }

    return (
        <LiveKitRoom
            video={false}
            audio={false}
            token={token}
            serverUrl={url}
            data-lk-theme="default"
        >
            <ControlGrid />
        </LiveKitRoom>
    );
}
