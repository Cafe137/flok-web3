# Deploying Flok to Ethereum Swarm

## Overview

The Flok frontend is a static React SPA that can be uploaded to Swarm and accessed
via a gateway (e.g. `bzz.limo`) or an ENS name. Collaborative editing works via a
separately-hosted `flok-server` that both participants point their browsers at.

---

## Building

```sh
npm run build
# output: packages/web/dist/
```

Upload `packages/web/dist/` to Swarm (set `index.html` as both the index and error
document so the hash-router routes work on direct navigation).

---

## Connecting two machines

The session layer uses three channels, all routed through a `flok-server` instance:

| Endpoint | Protocol | Purpose |
|---|---|---|
| `/signal` | WebSocket | WebRTC signaling — lets peers discover each other |
| `/doc` | WebSocket | Y.js CRDT sync relay (fallback when WebRTC is unavailable) |
| `/pubsub` | WebSocket | Eval message relay → local REPLs (TidalCycles, SuperCollider, …) |

### 1. Run a server

The server must be reachable by both machines (local LAN, VPS, or ngrok tunnel).

```sh
# from the monorepo root
node packages/web/bin/flok-web.js --port 3000

# or globally installed
flok-web --port 3000
```

### 2. Point browsers at the server

Visit the Swarm-hosted frontend with a `?server=` query param **once**:

```
https://flok.eth/#/s/my-session?server=https://myserver.com
```

On load the app:
1. Reads `?server=https://myserver.com`
2. Saves it to `localStorage["flok:server"]`
3. Strips the param from the URL immediately

Every subsequent session in that browser uses the stored server URL automatically.
To switch servers, visit again with a different `?server=` value.

Both machines need to do this once with the same server URL. After that, sharing
plain session links (no `?server=`) works as normal.

### 3. Use the same session name

Both machines open the same session URL:

```
https://flok.eth/#/s/my-session
```

They connect to the server, discover each other via WebRTC signaling, then sync
the shared Y.js document (P2P via WebRTC once connected, WebSocket relay as fallback).

---

## REPL evaluation

Code *editing* syncs P2P. Code *evaluation* (sending to TidalCycles, SuperCollider,
etc.) is relayed through the server's `/pubsub` endpoint to a local `flok-repl`
process on each machine.

```sh
# run on each machine that has a REPL
flok-repl -H wss://myserver.com -s my-session -t tidal
```

Each machine only receives eval messages for the targets it has a REPL registered for.

---

## Without a server

| Feature | Works? |
|---|---|
| Single-browser editing | Yes (IndexedDB persistence) |
| Two tabs, same browser | Yes (shared IndexedDB) |
| Two different machines | No |
| REPL evaluation | No |

Cross-machine sync requires a running `flok-server` reachable by both peers.
