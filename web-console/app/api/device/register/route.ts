import { rtdb } from '@/lib/firebase';
import { Device } from '@/lib/types';
import { ref, get, set, update, query, orderByChild, equalTo } from 'firebase/database';
import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

// Boat ID Validation Pattern
const BOAT_ID_PATTERN = /^YRAT\d{2}$/; // YRAT01 to YRAT99
const MIN_BOAT_NUMBER = 1;
const MAX_BOAT_NUMBER = 99;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { boatId, macAddress } = body;

    if (!boatId || !macAddress) {
      return NextResponse.json({ error: 'Missing boatId or macAddress' }, { status: 400 });
    }

    // 1. Validate Boat ID format
    if (!BOAT_ID_PATTERN.test(boatId)) {
      return NextResponse.json({
        error: `Invalid Boat ID format. Must be YRAT01-YRAT99 (e.g., YRAT01)`
      }, { status: 400 });
    }

    // Extract boat number and validate range
    const boatNumber = parseInt(boatId.replace('YRAT', ''));
    if (boatNumber < MIN_BOAT_NUMBER || boatNumber > MAX_BOAT_NUMBER) {
      return NextResponse.json({
        error: `Boat number must be between ${MIN_BOAT_NUMBER} and ${MAX_BOAT_NUMBER}`
      }, { status: 400 });
    }

    // 2. Check if MAC is already bound to another device
    const devicesRef = ref(rtdb, 'devices');
    const macQuery = query(devicesRef, orderByChild('macAddress'), equalTo(macAddress));
    const macSnapshot = await get(macQuery);

    if (macSnapshot.exists()) {
      const existingDevices = macSnapshot.val();
      const existingDeviceId = Object.keys(existingDevices)[0];

      // If MAC is bound to a different device, reject
      if (existingDeviceId !== boatId) {
        return NextResponse.json({
          error: `This device is already registered as ${existingDeviceId}`
        }, { status: 403 });
      }
    }

    // 2. Check if device exists
    const deviceRef = ref(rtdb, `devices/${boatId}`);
    const deviceSnap = await get(deviceRef);
    const deviceSnapshot = await get(deviceRef);
    const existingDevice = deviceSnapshot.exists() ? deviceSnapshot.val() as Device : null;

    if (existingDevice) {
      // If device exists but MAC doesn't match, reject
      if (existingDevice.macAddress !== macAddress) {
        return NextResponse.json({
          error: 'This Boat ID is already bound to another device'
        }, { status: 403 });
      }

      // Update existing device with login log
      await update(deviceRef, {
        lastSeen: Date.now(),
        status: 'online',
        lastLoginAt: Date.now(),
        lastLoginIp: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      });
    } else {
      // New device - create entry with login log
      const newDevice: Device = {
        id: boatId,
        macAddress: macAddress,
        status: 'online',
        lastSeen: Date.now(),
        lastLoginAt: Date.now(),
        lastLoginIp: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      };
      await set(deviceRef, newDevice);
    }

    // 3. Get assigned room (or use device ID as fallback)
    const roomId = existingDevice?.roomId || boatId;

    // 4. Generate LiveKit Token
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: boatId,
    });

    at.addGrant({
      roomJoin: true,
      room: roomId,  // Use assigned room instead of device ID
      canPublish: true,
      canSubscribe: true
    });

    const token = await at.toJwt();

    return NextResponse.json({ token, wsUrl, roomId });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
