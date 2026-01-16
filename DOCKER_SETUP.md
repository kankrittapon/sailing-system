# Sailing System - All-in-One Docker Setup

## Quick Start

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env with your Firebase credentials
nano .env

# 3. Start all services
docker compose up -d

# 4. Check logs
docker compose logs -f

# 5. Stop all services
docker compose down
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| **Web Console** | 3000 | Next.js Admin Dashboard |
| **LiveKit** | 7880 | WebRTC Media Server |
| **LiveKit TURN** | 7881 | NAT Traversal |
| **LiveKit RTP** | 50000-50050 | Media Packets (UDP) |
| **Mosquitto** | 1883 | MQTT Broker |
| **Mosquitto WS** | 9001 | MQTT WebSocket |
| **RTMP Ingress** | 1935 | RTMP Input |
| **SRT Bridge** | 8885 | SRT Input (UDP) |

## Access Points

- **Admin Console**: http://localhost:3000/admin
- **Login Page**: http://localhost:3000/login
- **Control Room**: http://localhost:3000/control/[roomId]
- **Viewer**: http://localhost:3000/live?room=[roomId]

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Firebase (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_db_url

# LiveKit (Pre-configured)
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=kanfullbuster_the_key_secure_32
LIVEKIT_API_SECRET=kanfullbuster_the_admin_secret_secure_32
```

## Production Deployment

### With Cloudflare Tunnel (Recommended)

```bash
# Install cloudflared
winget install --id Cloudflare.cloudflared

# Create tunnel
cloudflared tunnel create sailing-system

# Configure tunnel (config.yml)
tunnel: <TUNNEL_ID>
credentials-file: /path/to/credentials.json

ingress:
  - hostname: yourdomain.com
    service: http://localhost:3000
  - service: http_status:404

# Run tunnel
cloudflared tunnel run sailing-system
```

### Port Forwarding

If not using Cloudflare Tunnel, forward these ports:

```
7880 (TCP/UDP) → LiveKit WebSocket
50000-50050 (UDP) → LiveKit RTP
```

## Troubleshooting

### Web Console won't start
```bash
# Check logs
docker compose logs web-console

# Rebuild
docker compose build web-console
docker compose up -d web-console
```

### LiveKit connection issues
```bash
# Check LiveKit logs
docker compose logs livekit

# Verify ports
netstat -an | grep 7880
```

### Firebase errors
- Verify `.env` file exists
- Check Firebase credentials
- Ensure Firebase Realtime Database is enabled

## Development

```bash
# Run web console locally (outside Docker)
cd web-console
npm install
npm run dev

# Run Docker services only
docker compose up -d mosquitto redis livekit livekit-ingress ffmpeg-bridge
```

## Updating

```bash
# Pull latest images
docker compose pull

# Restart services
docker compose up -d
```

## Backup

```bash
# Backup volumes
docker run --rm -v sailing-system_mosquitto_data:/data -v $(pwd):/backup alpine tar czf /backup/mosquitto-backup.tar.gz /data

# Restore
docker run --rm -v sailing-system_mosquitto_data:/data -v $(pwd):/backup alpine tar xzf /backup/mosquitto-backup.tar.gz -C /
```
