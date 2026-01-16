import { rtdb } from '@/lib/firebase';
import { ref, get, update } from 'firebase/database';
import { NextRequest, NextResponse } from 'next/server';

// GET: List all devices with status
export async function GET() {
    try {
        const devicesRef = ref(rtdb, 'devices');
        const snapshot = await get(devicesRef);

        if (!snapshot.exists()) {
            return NextResponse.json({ devices: [] });
        }

        const devices = snapshot.val();
        return NextResponse.json({ devices: Object.values(devices) });
    } catch (error) {
        console.error('Error fetching devices:', error);
        return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
    }
}

// POST: Force disconnect device
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { deviceId } = body;

        if (!deviceId) {
            return NextResponse.json({ error: 'Missing deviceId' }, { status: 400 });
        }

        const deviceRef = ref(rtdb, `devices/${deviceId}`);
        await update(deviceRef, {
            status: 'offline',
            lastSeen: Date.now()
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error disconnecting device:', error);
        return NextResponse.json({ error: 'Failed to disconnect device' }, { status: 500 });
    }
}
