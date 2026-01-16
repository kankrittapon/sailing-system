// lib/livekit.ts - LiveKit Server SDK Helper
import { IngressClient, IngressInput } from 'livekit-server-sdk';

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY!;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET!;
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL!;

export async function createSRTIngress(deviceId: string, roomName: string) {
    const ingressClient = new IngressClient(LIVEKIT_URL.replace('ws://', 'http://').replace('wss://', 'https://'), LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

    try {
        const ingress = await ingressClient.createIngress(IngressInput.RTMP_INPUT, {
            name: `${deviceId}-ingress`,
            roomName: roomName,
            participantName: deviceId,
            participantIdentity: deviceId,
        });

        return {
            ingressId: ingress.ingressId,
            streamKey: ingress.streamKey,
            url: ingress.url,
        };
    } catch (error) {
        console.error('Failed to create ingress:', error);
        throw error;
    }
}

export async function deleteIngress(ingressId: string) {
    const ingressClient = new IngressClient(LIVEKIT_URL.replace('ws://', 'http://').replace('wss://', 'https://'), LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

    try {
        await ingressClient.deleteIngress(ingressId);
        return { success: true };
    } catch (error) {
        console.error('Failed to delete ingress:', error);
        throw error;
    }
}

export async function listIngresses() {
    const ingressClient = new IngressClient(LIVEKIT_URL.replace('ws://', 'http://').replace('wss://', 'https://'), LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

    try {
        const ingresses = await ingressClient.listIngress({});
        return ingresses;
    } catch (error) {
        console.error('Failed to list ingresses:', error);
        throw error;
    }
}
