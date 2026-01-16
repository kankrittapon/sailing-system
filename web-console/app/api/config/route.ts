import { NextRequest, NextResponse } from 'next/server';

// Server Configuration Endpoint
// Returns current server URL for Android app to discover dynamically
export async function GET(req: NextRequest) {
    try {
        // Get server URL from environment or request headers
        const serverUrl = process.env.NEXT_PUBLIC_API_URL ||
            `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('host')}`;

        const liveKitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880';

        return NextResponse.json({
            apiBaseUrl: `${serverUrl}/api`,
            liveKitUrl: liveKitUrl,
            version: '1.0.0',
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('Config error:', error);
        return NextResponse.json({ error: 'Failed to get config' }, { status: 500 });
    }
}
