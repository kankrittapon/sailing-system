import { rtdb } from '@/lib/firebase';
import { Room } from '@/lib/types';
import { ref, get, set, remove, update } from 'firebase/database';
import { NextRequest, NextResponse } from 'next/server';

// GET: List all rooms
export async function GET() {
    try {
        const roomsRef = ref(rtdb, 'rooms');
        const snapshot = await get(roomsRef);

        if (!snapshot.exists()) {
            return NextResponse.json({ rooms: [] });
        }

        const rooms = snapshot.val();
        return NextResponse.json({ rooms: Object.values(rooms) });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
    }
}

// POST: Create new room
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, createdBy } = body;

        if (!name || !createdBy) {
            return NextResponse.json({ error: 'Missing name or createdBy' }, { status: 400 });
        }

        const roomId = `room-${Date.now()}`;
        const newRoom: Room = {
            id: roomId,
            name,
            createdAt: Date.now(),
            createdBy,
            assignedDevices: []
        };

        const roomRef = ref(rtdb, `rooms/${roomId}`);
        await set(roomRef, newRoom);

        return NextResponse.json({ room: newRoom });
    } catch (error) {
        console.error('Error creating room:', error);
        return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }
}

// PUT: Update room (assign/unassign devices)
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { roomId, assignedDevices } = body;

        if (!roomId || !Array.isArray(assignedDevices)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const roomRef = ref(rtdb, `rooms/${roomId}`);
        await update(roomRef, { assignedDevices });

        // Update devices with roomId
        for (const deviceId of assignedDevices) {
            const deviceRef = ref(rtdb, `devices/${deviceId}`);
            await update(deviceRef, { roomId });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating room:', error);
        return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
    }
}

// DELETE: Delete room
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const roomId = searchParams.get('roomId');

        if (!roomId) {
            return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });
        }

        const roomRef = ref(rtdb, `rooms/${roomId}`);
        await remove(roomRef);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting room:', error);
        return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
    }
}
