import { rtdb } from '@/lib/firebase';
import { ref, update } from 'firebase/database';
import { NextRequest, NextResponse } from 'next/server';

// POST: Switch active device in room
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roomId, deviceId } = body;

        if (!roomId) {
            return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });
        }

        const roomRef = ref(rtdb, `rooms/${roomId}`);
        await update(roomRef, {
            activeDeviceId: deviceId || null,
            lastUpdated: Date.now()
        });

        return NextResponse.json({ success: true, activeDeviceId: deviceId });
    } catch (error) {
        console.error('Error switching device:', error);
        return NextResponse.json({ error: 'Failed to switch device' }, { status: 500 });
    }
}
