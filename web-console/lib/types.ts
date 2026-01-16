export interface Device {
    id: string;          // YRAT_ID (e.g., "YRAT01")
    macAddress: string;  // Bound MAC Address
    roomId?: string;     // Assigned room (nullable)
    status: 'online' | 'offline' | 'streaming';
    lastSeen: number;    // Timestamp
    ipAddress?: string;
    // Metadata
    number?: string;     // Sail number (e.g., "THA 123")
    region?: string;     // Region/Country (e.g., "Thailand")
    teamName?: string;   // Team/Sailor name (e.g., "Team Alpha")
    // Login Log
    lastLoginAt?: number;   // Last login timestamp
    lastLoginIp?: string;   // Last login IP address
    // SRT Ingress
    ingressId?: string;     // LiveKit Ingress ID
    srtUrl?: string;        // SRT streaming URL
    streamKey?: string;     // SRT stream key (secret)
}

export interface Room {
    id: string;          // Room ID (e.g., "room-001")
    name: string;        // Display name (e.g., "Race 1")
    activeDeviceId: string | null;  // Currently broadcasting device
    createdAt: number;   // Timestamp
    createdBy: string;   // Admin email
    assignedDevices: string[]; // Array of device IDs
}

// Collection Names
export const DEVICE_COLLECTION = "devices";
export const ROOM_COLLECTION = "rooms";
