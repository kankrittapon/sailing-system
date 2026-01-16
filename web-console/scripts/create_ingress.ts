
import { IngressClient, IngressInput, IngressVideoEncodingPreset, IngressAudioEncodingPreset } from 'livekit-server-sdk';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

console.log('API Key:', apiKey ? 'Found' : 'Missing');
console.log('Secret:', apiSecret ? 'Found' : 'Missing');
console.log('URL:', wsUrl);

if (!apiKey || !apiSecret || !wsUrl) {
    console.error('Missing credentials');
    process.exit(1);
}

const ingressClient = new IngressClient(wsUrl, apiKey, apiSecret);

async function ensureIngress() {
    try {
        const list = await ingressClient.listIngress({
            roomName: 'YRAT01',
        });

        let ingress = list.find(i => i.inputType === IngressInput.RTMP_INPUT);

        if (ingress) {
            console.log('-------------------------------------------');
            console.log('Found Existing Ingress:');
            console.log('Ingress ID:', ingress.ingressId);
            console.log('Stream Key:', ingress.streamKey);
            console.log('URL:', ingress.url);
            console.log('-------------------------------------------');
        } else {
            console.log('No existing ingress found. Creating new one...');
            ingress = await ingressClient.createIngress(
                IngressInput.RTMP_INPUT,
                {
                    name: 'YRAT01-Bridge',
                    roomName: 'YRAT01',
                    participantName: 'ingress-YRAT01',
                    participantIdentity: 'ingress-YRAT01',
                    video: {
                        source: 0,
                        encodingOptions: {
                            case: 'preset',
                            value: IngressVideoEncodingPreset.H264_720P_30FPS_3_LAYERS
                        }
                    } as any,
                    audio: {
                        source: 0,
                        encodingOptions: {
                            case: 'preset',
                            value: IngressAudioEncodingPreset.OPUS_STEREO_96KBPS
                        }
                    } as any
                }
            );
            console.log('-------------------------------------------');
            console.log('Ingress Created Successfully!');
            console.log('Stream Key:', ingress.streamKey);
            console.log('URL:', ingress.url);
            console.log('-------------------------------------------');
        }

    } catch (error) {
        console.error('Error managing ingress:', error);
    }
}

ensureIngress();
