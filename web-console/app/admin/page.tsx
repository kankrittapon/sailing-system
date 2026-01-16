'use client';

import { auth, rtdb } from '@/lib/firebase';
import { Device } from '@/lib/types';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, onValue, off, set, update } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DeviceEditor from '@/components/DeviceEditor';
import BoatIdGenerator from '@/components/BoatIdGenerator';
import ServerConfigEditor from '@/components/ServerConfigEditor';

export default function AdminPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [showBoatIdGenerator, setShowBoatIdGenerator] = useState(false);
    const [showServerConfig, setShowServerConfig] = useState(false);
    const [rooms, setRooms] = useState<any[]>([]);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
            if (!u) {
                router.push('/login');
            } else {
                setUser(u);
            }
        });

        // Realtime listener for devices (RTDB)
        const devicesRef = ref(rtdb, 'devices');
        const unsubscribeRTDB = onValue(devicesRef, (snapshot) => {
            if (snapshot.exists()) {
                const devicesData = snapshot.val();
                const devs: Device[] = Object.values(devicesData);
                // Sort by ID with null check
                devs.sort((a, b) => {
                    if (!a?.id || !b?.id) return 0;
                    return a.id.localeCompare(b.id, undefined, { numeric: true });
                });
                setDevices(devs);
            } else {
                setDevices([]);
            }
            setLoading(false);
        });

        // Realtime listener for rooms
        const roomsRef = ref(rtdb, 'rooms');
        const unsubscribeRooms = onValue(roomsRef, (snapshot) => {
            if (snapshot.exists()) {
                const roomsData = snapshot.val();
                const roomsList = Object.values(roomsData);
                setRooms(roomsList);
            } else {
                setRooms([]);
            }
        });

        return () => {
            unsubscribeAuth();
            off(devicesRef);
            off(roomsRef);
        };
    }, [router]);

    if (loading) return <div style={{ color: '#fff', padding: 20 }}>Loading...</div>;

    return (
        <div style={{ padding: '20px', background: '#111', minHeight: '100vh', color: '#fff' }}>
            {editingDevice && (
                <DeviceEditor
                    device={editingDevice}
                    onClose={() => setEditingDevice(null)}
                />
            )}

            {showBoatIdGenerator && (
                <BoatIdGenerator
                    onClose={() => setShowBoatIdGenerator(false)}
                />
            )}

            {showServerConfig && (
                <ServerConfigEditor
                    onClose={() => setShowServerConfig(false)}
                />
            )}

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Sailing Admin Console</h1>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                        onClick={() => setShowServerConfig(true)}
                        style={{
                            padding: '8px 16px',
                            background: '#FF9800',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '4px'
                        }}
                    >
                        ⚙️ Server Config
                    </button>
                    <button
                        onClick={() => setShowBoatIdGenerator(true)}
                        style={{
                            padding: '8px 16px',
                            background: '#4CAF50',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '4px'
                        }}
                    >
                        Generate Boat IDs
                    </button>
                    <span>{user?.email || 'Guest'}</span>
                    <button
                        onClick={() => signOut(auth)}
                        style={{ padding: '8px 16px', background: '#d32f2f', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Room Management Section */}
            <section style={{ marginBottom: '40px', background: '#222', padding: '20px', borderRadius: '8px' }}>
                <h2 style={{ marginBottom: '15px' }}>🎬 Room Management</h2>
                <RoomManager devices={devices} />
            </section>

            {/* Device List */}
            <section>
                <h2 style={{ marginBottom: '15px' }}>📱 Registered Devices</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    {devices.map((device) => (
                        <div
                            key={device.id || `device-${Math.random()}`}
                            style={{
                                background: '#222',
                                padding: '15px',
                                borderRadius: '8px',
                                border: `2px solid ${device.status === 'online' ? '#4CAF50' : '#666'}`
                            }}
                        >
                            <h3 style={{ margin: '0 0 10px 0' }}>{device.id}</h3>
                            <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#aaa' }}>
                                Status: <span style={{ color: device.status === 'online' ? '#4CAF50' : '#999' }}>
                                    {device.status}
                                </span>
                            </p>
                            {device.number && (
                                <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#aaa' }}>
                                    Number: {device.number}
                                </p>
                            )}
                            {device.teamName && (
                                <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#aaa' }}>
                                    Team: {device.teamName}
                                </p>
                            )}
                            {device.region && (
                                <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#aaa' }}>
                                    Region: {device.region}
                                </p>
                            )}
                            <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#aaa' }}>
                                Room: {device.roomId || 'Not assigned'}
                            </p>
                            <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#aaa' }}>
                                MAC: {device.macAddress?.slice(0, 17)}
                            </p>
                            {device.lastLoginAt && (
                                <p style={{ margin: '5px 0', fontSize: '0.85rem', color: '#777' }}>
                                    Last Login: {new Date(device.lastLoginAt).toLocaleString()}
                                </p>
                            )}
                            {device.lastLoginIp && (
                                <p style={{ margin: '5px 0', fontSize: '0.85rem', color: '#777' }}>
                                    From: {device.lastLoginIp}
                                </p>
                            )}

                            {/* Room Assignment */}
                            <div style={{ marginTop: '10px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '5px' }}>
                                    Assign to Room:
                                </label>
                                <select
                                    value={device.roomId || ''}
                                    onChange={async (e) => {
                                        const roomId = e.target.value || null;
                                        const deviceRef = ref(rtdb, `devices/${device.id}`);
                                        await update(deviceRef, { roomId });
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '6px',
                                        background: '#333',
                                        color: '#fff',
                                        border: '1px solid #555',
                                        borderRadius: '4px',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    <option value="">No Room</option>
                                    {rooms.map((room: any) => (
                                        <option key={room.id} value={room.id}>
                                            {room.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
                                <button
                                    onClick={() => window.open(`/live?boat=${device.id}`, '_blank')}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        background: '#2196F3',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Watch Live
                                </button>
                                <button
                                    onClick={() => setEditingDevice(device)}
                                    style={{
                                        padding: '8px 12px',
                                        background: '#FF9800',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={async () => {
                                        if (confirm(`Delete device ${device.id}?`)) {
                                            const deviceRef = ref(rtdb, `devices/${device.id}`);
                                            await set(deviceRef, null);
                                        }
                                    }}
                                    style={{
                                        padding: '8px 12px',
                                        background: '#f44336',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

function RoomManager({ devices }: { devices: any[] }) {
    const [rooms, setRooms] = useState<any[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');

    useEffect(() => {
        const roomsRef = ref(rtdb, 'rooms');
        const unsubscribe = onValue(roomsRef, (snapshot) => {
            if (snapshot.exists()) {
                const roomsData = snapshot.val();
                const roomsList = Object.values(roomsData);
                setRooms(roomsList);
            } else {
                setRooms([]);
            }
        });
        return () => off(roomsRef);
    }, []);

    const createRoom = async () => {
        if (!newRoomName.trim()) return;

        const roomId = `room-${Date.now()}`;
        const roomRef = ref(rtdb, `rooms/${roomId}`);
        await set(roomRef, {
            id: roomId,
            name: newRoomName,
            activeDeviceId: null,
            createdAt: Date.now(),
            createdBy: 'admin',
            assignedDevices: []
        });

        setNewRoomName('');
        setShowCreateForm(false);
    };

    const assignDevice = async (roomId: string, deviceId: string) => {
        const deviceRef = ref(rtdb, `devices/${deviceId}`);
        await update(deviceRef, { roomId });
    };

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                {!showCreateForm ? (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        style={{
                            padding: '10px 20px',
                            background: '#4CAF50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        + Create Room
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            placeholder="Room name (e.g., Race 1)"
                            style={{
                                flex: 1,
                                padding: '10px',
                                background: '#333',
                                color: '#fff',
                                border: '1px solid #555',
                                borderRadius: '5px'
                            }}
                        />
                        <button
                            onClick={createRoom}
                            style={{
                                padding: '10px 20px',
                                background: '#4CAF50',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            Create
                        </button>
                        <button
                            onClick={() => setShowCreateForm(false)}
                            style={{
                                padding: '10px 20px',
                                background: '#666',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                {rooms.map((room: any) => (
                    <div key={room.id} style={{ background: '#333', padding: '15px', borderRadius: '8px' }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>{room.name}</h3>
                        <p style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '10px' }}>
                            Active: {room.activeDeviceId || 'None'}
                        </p>
                        <select
                            onChange={(e) => assignDevice(room.id, e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                background: '#444',
                                color: '#fff',
                                border: '1px solid #555',
                                borderRadius: '4px',
                                marginBottom: '10px'
                            }}
                        >
                            <option value="">Assign device...</option>
                            {devices.map((device) => (
                                <option key={device.id} value={device.id}>
                                    {device.id} {device.roomId === room.id ? '✓' : ''}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => window.open(`/control/${room.id}`, '_blank')}
                            style={{
                                width: '100%',
                                padding: '10px',
                                background: '#667eea',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                marginBottom: '5px'
                            }}
                        >
                            Open Control Room
                        </button>
                        <button
                            onClick={async () => {
                                if (confirm(`Delete room "${room.name}"? Devices will be unassigned.`)) {
                                    // Unassign all devices from this room
                                    const devicesInRoom = devices.filter(d => d.roomId === room.id);
                                    for (const device of devicesInRoom) {
                                        const deviceRef = ref(rtdb, `devices/${device.id}`);
                                        await update(deviceRef, { roomId: null });
                                    }
                                    // Delete room
                                    const roomRef = ref(rtdb, `rooms/${room.id}`);
                                    await set(roomRef, null);
                                }
                            }}
                            style={{
                                width: '100%',
                                padding: '10px',
                                background: '#f44336',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer'
                            }}
                        >
                            🗑️ Delete Room
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case 'streaming': return '#4CAF50';
        case 'online': return '#FFC107';
        case 'offline': return '#F44336';
        default: return '#ccc';
    }
}
