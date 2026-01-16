import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roomName, participantName, role } = body;

        if (!roomName || !participantName) {
            return NextResponse.json({ error: 'Missing roomName or participantName' }, { status: 400 });
        }

        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;
        const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

        if (!apiKey || !apiSecret || !wsUrl) {
            return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
        }

        const at = new AccessToken(apiKey, apiSecret, {
            identity: participantName,
        });

        if (role === 'driver') {
            at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
        } else if (role === 'admin') {
            at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true, canPublishData: true });
        } else {
            // Default / Viewer
            at.addGrant({ roomJoin: true, room: roomName, canPublish: false, canSubscribe: true });
        }

        const token = await at.toJwt();

        return NextResponse.json({ token, wsUrl });
    } catch (error) {
        console.error('Token generation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
