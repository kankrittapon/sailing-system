'use client';

import { LiveKitRoom, GridLayout, ParticipantTile, useTracks } from '@livekit/components-react';
import '@livekit/components-styles';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Track } from 'livekit-client';
import { rtdb } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';

function VideoView({ roomId }: { roomId: string }) {
    const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);

    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: false },
        ],
        { onlySubscribed: false }
    );

    // Listen to active device changes from RTDB
    useEffect(() => {
        const roomRef = ref(rtdb, `rooms/${roomId}/activeDeviceId`);
        const unsubscribe = onValue(roomRef, (snapshot) => {
            setActiveDeviceId(snapshot.val());
        });
        return () => off(roomRef);
    }, [roomId]);

    // Filter to show only active device
    const activeTracks = activeDeviceId
        ? tracks.filter(track => track.participant.identity === activeDeviceId)
        : [];

    if (activeTracks.length === 0) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000',
                color: '#fff',
                fontSize: '1.5rem'
            }}>
                {activeDeviceId ? `Waiting for ${activeDeviceId}...` : 'No device selected'}
            </div>
        );
    }

    return (
        <GridLayout tracks={activeTracks} style={{ height: '100vh' }}>
            <ParticipantTile />
        </GridLayout>
    );
}

export default function LivePage() {
    const searchParams = useSearchParams();
    const roomId = searchParams.get('room') || searchParams.get('boat'); // Support both for backward compatibility

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
                        participantName: `viewer-${Math.floor(Math.random() * 1000)}`,
                        role: 'viewer'
                    }),
                });
                const data = await resp.json();
                setToken(data.token);
                setUrl(data.wsUrl);
                console.log('✅ Connected to LiveKit Server');
            } catch (e) {
                console.error(e);
            }
        })();
    }, [roomId]);

    if (!roomId) {
        return (
            <div style={{ padding: 20, color: '#fff', background: '#111', minHeight: '100vh' }}>
                <h1>No room specified</h1>
                <p>Use ?room=ROOM_ID or ?boat=DEVICE_ID</p>
            </div>
        );
    }

    if (token === '') {
        return <div style={{ color: '#fff', padding: 20 }}>Loading stream...</div>;
    }

    return (
        <LiveKitRoom
            video={false}
            audio={true}
            token={token}
            serverUrl={url}
            data-lk-theme="default"
            onDisconnected={() => console.log('Disconnected from LiveKit')}
        >
            <VideoView roomId={roomId} />
        </LiveKitRoom>
    );
}
