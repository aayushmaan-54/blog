---
title: "CS Fundamentals: Computer Architecture"
description: "Computer architecture from an engineer's lens: CPU pipelines, branch prediction, caches, data representation, storage & I/O, threads, multicore limits, and what really happens when you run a program, plus projects to build next."
pubDatetime: 2026-10-16T13:00:00.000+05:30
author: Aayushmaan Soni
slug: /cs-fundamentals/computer-architecture
tags: ["computer-architecture"]
draft: false
featured: true
series:  CS Fundamentals
seriesOrder:  2
---

## Table of Contents

## Introduction
This is **Part 2** of my **CS Fundamentals** series, where I'm putting down the core CS subjects as short, to-the-point notes. They're the same notes I use myself for learning and revision, cleaned up so anyone can use them.

Each part covers the basics, but always from a **software engineer's lens**: what actually shows up when you build, deploy, and debug real systems, not just what's asked in exams.

**In this part** we look at the machine your code runs on: how a CPU executes instructions (pipelines, branch prediction, SIMD), why memory access patterns matter more than Big-O in practice (caches), how numbers and text are stored as bits, how storage and devices talk to the CPU, and where multicore stops scaling. Then we tie it all together by following one program from the disk to its exit. At the end, there's a list of projects to build so the concepts actually stick.

Read it top to bottom the first time; after that, use it as a quick reference.

## 0. From Code to Silicon
- **CPU (Central Processing Unit)**: the execution engine; does math, compares values, and moves data; extremely fast, but holds almost no data itself
- **RAM (Random Access Memory)**: the working space; holds the code and data of running programs; much bigger than the CPU's storage, much slower; **volatile** (wiped on power off)
- **Storage (SSD/HDD)**: permanent; holds files and programs while they're not running; much slower than RAM
- **I/O (Input/Output)**: everything the computer uses to talk to the outside world: keyboard, display, network card, disk
- **Von Neumann architecture**: the design almost every computer follows; **code and data live in the same memory**
  - Early computers were "programmed" by rewiring them or flipping switches
  - Key idea: an instruction is just a number, so it can be stored in memory like any other data
  - Result: a program can be saved to disk, loaded into RAM, and swapped for another one without touching the hardware → **software** as we know it
- **Compilation**: source code → compiler → **machine code** (binary instructions for one specific CPU family); interpreted/JIT languages (Python, JS, Java) do this at runtime instead
- **ISA (Instruction Set Architecture)**: the set of instructions a CPU understands; the contract between software and hardware
  - **x86-64 (AMD64)**: Intel/AMD; **CISC** (Complex Instruction Set Computer); many complex, variable-length instructions (1 to 15 bytes)
  - **ARM (AArch64)**: phones, Apple Silicon, AWS Graviton; **RISC** (Reduced Instruction Set Computer); fewer, simpler, fixed-length (4 bytes) instructions
  - The gap is smaller than it sounds: modern x86 chips break instructions into RISC-like **micro-ops** internally. Apple Silicon is efficient mostly because of its design (very wide cores, big caches, memory on the same package, newer manufacturing process); fixed-length ARM instructions just make it easier to decode many at once
  - **Engineer note**: binaries are ISA-specific → an `amd64` Docker image on an ARM Mac or Graviton server fails with `exec format error` or runs slowly under emulation (Rosetta/QEMU); build **multi-arch images** (`docker buildx --platform linux/amd64,linux/arm64`)
- **Registers**: tiny storage slots inside the CPU core; the fastest memory there is; data is loaded into registers to be worked on; very few (16 general-purpose on x86-64, 31 on ARM64)
- **Word size / 32-bit vs 64-bit**: the natural size of data the CPU handles at once; 64-bit CPU → 64-bit registers and pointers
  - 32-bit pointers can address only 2^32 bytes = **4 GB** → the old "32-bit Windows can't use more than 4 GB RAM" limit
  - 64-bit pointers take 8 bytes each → pointer-heavy data structures use more memory
- **Stack**: a region of RAM, one per thread; holds local variables, function arguments, and return addresses; grows and shrinks automatically as functions are called and return; very fast; limited size (~8 MB for the main thread on Linux) → deep recursion causes a **stack overflow**
  - When the CPU runs out of registers, it **spills** values to the stack and loads them back when needed
- **Heap**: a region of RAM for memory allocated at runtime (`malloc`, `new`, objects in Java/Go/JS); shared by all threads of a process; freed manually (C/C++) or by a garbage collector

## 1. The CPU: The Execution Engine
- **Fetch-Decode-Execute (FDE) cycle**: the loop every CPU runs, billions of times per second
  - **Fetch**: read the next instruction from memory
  - **Decode**: work out what it means (which operation, which registers)
  - **Execute**: do it (math, comparison, memory load/store, jump)
- **Program Counter (PC)**: register holding the address of the next instruction; a jump/branch just changes the PC
- **ALU (Arithmetic Logic Unit)**: the part that does the actual math: add, subtract, compare, bitwise ops (AND, OR, XOR, shifts)
- **Control Unit**: decodes instructions and tells the ALU, registers, and memory what to do
- **Clock speed (GHz)**: how many cycles per second; 3 GHz = 3 billion cycles per second (~0.3 ns per cycle)
- **IPC (Instructions Per Cycle)**: how many instructions complete per cycle on average; modern cores do several
- **Performance ≈ Clock speed × IPC**: why a modern 3 GHz chip easily beats a 10-year-old 4 GHz chip; GHz alone means little
- **Core**: an independent processing unit with its own registers, ALUs, and L1/L2 cache; an 8-core CPU can run 8 threads at the same moment
- **SMT (Simultaneous Multithreading) / Hyper-Threading**: one physical core shows up as 2 **logical** cores
  - Each logical core has its own registers and PC, but they **share** the execution units and caches
  - When one thread stalls (e.g. waiting on RAM), the other uses the idle units → typically ~15-30% more throughput, not 2x
  - That's why `nproc` shows 16 on an 8-core machine
- **Pipelining**: instead of finishing one instruction before starting the next, stages overlap like an assembly line; while instruction 1 executes, instruction 2 is being decoded and instruction 3 fetched
  - Doesn't make one instruction faster; makes many instructions finish faster
- **Branch prediction**: at an `if/else` or loop condition, the pipeline doesn't know which instruction comes next yet; instead of waiting, the CPU **guesses** (based on past behavior) and keeps going
  - **Misprediction**: wrong guess → all work after the branch is thrown away (**pipeline flush**) → ~15-20 wasted cycles
  - Modern predictors are >95% accurate on regular patterns; random data is what hurts
  - **Why can sorting an array first make a loop with `if (x > 100)` faster?**
    - Random data → the branch is random → predictor is wrong ~50% of the time
    - Sorted data → long run of `false`, then long run of `true` → predictor is almost always right
    - Classic benchmark: the sorted version runs several times faster, even though it does the same work
    - Note: with optimizations on, compilers often make this loop **branchless** (`cmov`) or vectorized (SIMD), and the difference disappears; check the assembly before assuming
- **Out-of-order execution**: the CPU runs instructions in whatever order their inputs become ready, not strictly in program order; if instruction 1 waits on RAM and instruction 2 doesn't depend on it, instruction 2 runs first; results are still committed in program order, so your program can't tell (single-threaded)
- **Speculative execution**: running instructions before knowing they're needed (e.g. past a predicted branch) and discarding them if the guess was wrong
  - **Spectre / Meltdown** (2018): discarded speculative work still leaves traces in the cache; by timing memory accesses, an attacker can read data they shouldn't; the fixes (e.g. KPTI in Linux, for Meltdown) made syscall-heavy workloads measurably slower
- **SIMD (Single Instruction, Multiple Data) / Vectorization**: one instruction works on a whole batch of values at once; e.g. add 8 integers in one instruction instead of 8 separate ones
  - x86: SSE, AVX2 (256-bit), AVX-512; ARM: NEON, SVE
  - Compilers auto-vectorize simple loops over arrays; used heavily in video, ML, JSON parsers (simdjson), and databases (DuckDB, ClickHouse)

## 2. Memory Hierarchy & Caches
- The CPU is much faster than RAM; most of the time a slow program is **waiting for data**, not computing
- Memory is a pyramid: the closer to the core, the faster, smaller, and more expensive

| Level | Where | Typical size | Latency |
|---|---|---|---|
| Registers | inside the core | ~a few KB (incl. SIMD registers) | ~0 (same cycle) |
| L1 cache | per core (separate for instructions & data) | 32-128 KB | ~1 ns |
| L2 cache | per core (per cluster on Apple chips) | 0.5-2 MB (more on Apple) | ~4 ns |
| L3 cache | shared by cores on the chip | 8-100+ MB | ~10-20 ns |
| RAM | on the motherboard | GBs | ~100 ns |
| NVMe SSD | over PCIe | TBs | ~50-100 µs |
| HDD | over SATA | TBs | ~5-10 ms |

- AMD's **3D V-Cache** stacks an extra L3 die onto the chip → fewer trips to RAM (big win for games and some databases)
- **Latency numbers every programmer should know** (scaled so 1 CPU cycle = 1 second):

| Operation | Real time | If 1 cycle = 1 second |
|---|---|---|
| 1 CPU cycle | 0.3 ns | 1 second |
| L1 cache hit | ~1 ns | ~3 seconds |
| L2 cache hit | ~4 ns | ~13 seconds |
| Branch mispredict | ~5 ns | ~15 seconds |
| L3 cache hit | ~15 ns | ~50 seconds |
| RAM access | ~100 ns | ~5.5 minutes |
| NVMe SSD random read | ~50 µs | ~2 days |
| HDD random read (seek) | ~10 ms | ~1 year |
| Network round trip, India ↔ US | ~200 ms | ~21 years |

- **Cache hit**: data found in cache → keeps running
- **Cache miss**: not found → fetch from the next level; a miss all the way to RAM stalls the core for hundreds of cycles (out-of-order execution hides some of it)
- **Hit ratio**: % of accesses served by the cache; hot loops in well-written code hit L1 >95% of the time
- **Cache line**: the CPU always moves memory in **64-byte chunks**; ask for one 4-byte `int` and you get the 15 next to it for free
- **Temporal locality**: data used now will probably be used again soon → keep it in cache
- **Spatial locality**: after address `X`, you'll probably use `X+1` → that's why whole cache lines are fetched
- **Hardware prefetcher**: notices sequential/strided access and loads the next cache lines **before** you ask; works great for arrays, does nothing for pointer chasing
- **Array vs linked list**:
  - Big-O says linked-list insert is `O(1)` and array insert is `O(N)`
  - In practice, arrays (`vector`, `ArrayList`, Go slices) win for most workloads: elements sit next to each other → one cache line brings 16 ints, and the prefetcher streams the rest
  - Linked-list nodes are scattered across RAM → nearly every `.next` can be a cache miss (~100 ns each)
  - Same reason B-trees (many keys per node) beat binary trees for databases and in-memory indexes
- **Row-major vs column-major traversal**:
  - C/C++/Java/Go store 2D arrays row by row
  - `for row: for col: a[row][col]` → walks memory in order → cache-friendly
  - Swap the loops (`a[col][row]` order) → jumps a full row each step → a cache miss per access; same Big-O, can be many times slower
- **Alignment & padding**: CPUs access a value fastest at an address that's a multiple of its size, so compilers insert padding in structs
  - `struct { char a; int b; char c; }` → 12 bytes, not 6 (padding after `a` and `c`)
  - Order fields largest → smallest → 8 bytes; matters when you have millions of them
- **Cache coherence**: each core has a private L1/L2, so two cores can cache the same line; hardware keeps them consistent using a protocol like **MESI**:
  - **Modified**: only this cache has the line, and it's been changed (RAM is out of date)
  - **Exclusive**: only this cache has it, unchanged (matches RAM)
  - **Shared**: several caches have the same clean copy
  - **Invalid**: this copy is stale; must be fetched again
  - To write, a core must own the line (E/M) → other cores' copies are marked **Invalid** → their next read misses and gets the fresh data
- **False sharing**: two threads on different cores write **different** variables that happen to sit on the **same cache line** → the line ping-pongs between cores on every write → threads that share nothing run slower than one thread
  - Fix: pad/align hot per-thread data to 64 bytes (`alignas(64)` in C++, `@Contended` in Java, padding fields in Go)

### Virtual Memory
> The OS part goes deeper; here's the hardware side.

- **Virtual memory**: every process sees its own private address space, as if it owned all the memory; addresses in your program are **virtual**, not real RAM locations
- **Page**: memory is split into fixed blocks (usually **4 KB**); the OS keeps a **page table** per process mapping virtual pages → physical pages in RAM
- **MMU (Memory Management Unit)**: hardware in the CPU that translates every virtual address to a physical one on the fly
- **TLB (Translation Lookaside Buffer)**: small cache of recent translations; a TLB miss means walking the page table (more memory accesses); **huge pages** (2 MB / 1 GB) cover more memory per entry → databases and JVMs often use them (but **Transparent** Huge Pages, where the kernel does it automatically, can cause latency spikes; Redis and MongoDB recommend turning THP off)
- **Page fault**: the page isn't in RAM (not loaded yet, or swapped to disk) → CPU traps to the OS, which loads it and resumes the program
- **Why it matters**:
  - **Isolation**: one process can't read or corrupt another's memory; touching an unmapped address → **segfault**
  - Programs can reserve more memory than physically exists; `top` shows **VIRT** (reserved) vs **RES** (actually in RAM); RES is the number to watch

## 3. Data Representation
- **Binary**: base-2; everything (numbers, text, images, instructions) is stored as bits
- **Bit**: a single 0 or 1; **Byte**: 8 bits; every memory address points to one byte
- **Hexadecimal**: base-16 (`0-9`, `A-F`, prefix `0x`); one hex digit = exactly 4 bits, two hex digits = one byte (`0xFF` = `11111111` = 255) → much easier to read than binary; used for memory addresses, colors (`#FF8800`), hashes, MAC addresses
- **Unsigned integer**: only non-negative; n bits hold `0` to `2^n − 1` (8-bit: 0 to 255)
- **Two's complement**: how signed integers are stored
  - The leftmost bit (MSB) has a **negative** weight: in 8 bits, `10000000` = −128; so MSB = 1 means negative, 0 means positive
  - Range for n bits: `−2^(n−1)` to `2^(n−1) − 1` (8-bit: −128 to 127; 32-bit: about ±2.1 billion)
  - To negate: flip all bits, add 1 → `5` = `00000101`, `−5` = `11111011`
  - Why it's used: the same adder circuit handles both addition and subtraction, and there's only one zero
- **Integer overflow**: result doesn't fit in the type, so the extra high bits are cut off and the value wraps around
  - 8-bit unsigned: `255 + 1` = `1 00000000` → 9th bit dropped → `0`
  - 32-bit signed: `2,147,483,647 + 1` → `−2,147,483,648`
  - Language behavior differs: Java/Go wrap silently, Rust panics in debug builds, signed overflow in C/C++ is **undefined behavior**
  - Real-world: YouTube's view counter overflowed 32-bit on "Gangnam Style" (2014); **Y2038**: Unix time stored as signed 32-bit seconds overflows on 19 Jan 2038; a table with an `INT` primary key stops accepting inserts at ~2.1 billion rows → use `BIGINT` for IDs
- **Bitwise operations**: `&` (AND), `|` (OR), `^` (XOR), `~` (NOT), `<<` / `>>` (shift); done directly in hardware, one cycle each (integer division can take tens of cycles)
  - `x << 1` = `x * 2`, `x >> 1` = `x / 2` (non-negative), `x & 1` → odd?, `(x & (x − 1)) == 0` → power of two (for x > 0)
  - Compilers already turn `x * 8` into a shift, so write the readable version; bitwise ops matter for flags and packing data
  - **Bitmasks / flags**: pack many booleans into one integer
    - `READ = 1 << 0`, `WRITE = 1 << 1`, `ADMIN = 1 << 2`
    - set: `perms |= WRITE`; check: `(perms & ADMIN) != 0` (parentheses matter: in C/Java/JS, `==`/`!=` bind tighter than `&`); clear: `perms &= ~WRITE`
    - Seen everywhere: Linux file permissions (`chmod 755` = `111 101 101` = `rwx r-x r-x`), feature flags, and subnet masks (`IP & mask` = network address, from Part 1)
- **Floating point (IEEE 754)**: how decimals like `3.14` are stored; works like scientific notation in binary: **sign × 1.fraction × 2^exponent**
  - `float32`: 1 sign bit, 8 exponent bits (bias 127), 23 fraction bits; ~7 significant digits
  - `float64` (`double`): 1 sign, 11 exponent (bias 1023), 52 fraction; ~15-16 significant digits; default in JS and Python
  - Example, 5.75 as `float32`:
    - 5 = `101`, 0.75 = 0.5 + 0.25 = `.11` → `101.11`
    - Normalize: `1.0111 × 2^2`
    - Sign `0`, exponent 2 + 127 = 129 = `10000001`, fraction `0111` followed by zeros
    - → `0 10000001 01110000000000000000000` = `0x40B80000`
  - **Why is `0.1 + 0.2 == 0.3` false?**
    - Just like 1/3 = `0.333...` never ends in decimal, 1/10 never ends in binary (`0.000110011001100...`)
    - It gets rounded to fit in 52 bits; the small errors from 0.1 and 0.2 add up → `0.30000000000000004`
    - Compare floats with a tolerance: `abs(a − b) < 1e-9`, never `==`
  - **Never use floats for money**: store integers in the smallest unit (₹10.50 → `1050` paise) or use a decimal type (`NUMERIC` in Postgres, `BigDecimal` in Java, `Decimal` in Python)
  - **JS gotcha**: all JS numbers are `float64` → integers are exact only up to `2^53 − 1` (`Number.MAX_SAFE_INTEGER`); 64-bit IDs from an API (e.g. Snowflake IDs) silently lose digits in `JSON.parse` → send them as strings
- **Endianness**: the order bytes of a multi-byte value are stored in memory; e.g. `0x12345678` stored at address 100:

| Address | 100 | 101 | 102 | 103 |
|---|---|---|---|---|
| **Big-endian** (most significant byte first) | `12` | `34` | `56` | `78` |
| **Little-endian** (least significant byte first) | `78` | `56` | `34` | `12` |

  - x86 and ARM (as normally used) are **little-endian**; network protocols use **big-endian** ("network byte order")
  - Matters when you write raw sockets or parse binary formats: convert with `htons`/`htonl`/`ntohs`/`ntohl` (C) or `binary.BigEndian` (Go), `struct.pack('>I', ...)` (Python)
- **ASCII**: 7 bits, 128 characters (English letters, digits, punctuation, control characters)
- **Unicode**: gives every character in every language (and every emoji) a unique number called a **code point** (`A` = U+0041, `😀` = U+1F600); it's a mapping, not an encoding
- **UTF-8**: how code points are stored as bytes; variable length: 1 byte for ASCII (fully backward compatible), 2-3 bytes for most other scripts (Hindi `न` = 3 bytes), 4 bytes for emoji; used by ~98% of the web
  - **Length ≠ bytes ≠ characters**: `"😀".length` is `2` in JS (UTF-16 units), 4 bytes in UTF-8, and one visible character → validate DB column limits and API limits in bytes or characters on purpose
  - MySQL's `utf8` stores only up to 3 bytes → emoji fail to insert; use `utf8mb4`

## 4. Storage & I/O
- **SRAM vs DRAM**:
  - **SRAM** (Static RAM): used for CPU caches; ~6 transistors per bit; very fast, expensive, low density; keeps data as long as it has power
  - **DRAM** (Dynamic RAM): used for main memory; 1 transistor + 1 capacitor per bit; dense and cheap, but capacitors leak, so every row is re-written (**refreshed**) roughly every 64 ms
- **Sequential vs random access**: reading consecutive addresses is faster than jumping around at **every** level (cache lines, prefetching, disk mechanics), even in "Random Access" Memory
- **HDD (Hard Disk Drive)**: magnetic platters spinning at 5,400-7,200 RPM, read by a moving arm
  - **Random I/O is terrible**: the arm must move (**seek**) and wait for the platter to rotate → ~10 ms per random read → only ~100 random reads/sec
  - **Sequential I/O is decent**: data just streams under the head → ~150-250 MB/s
- **SSD (Solid State Drive)**: NAND flash chips, no moving parts
  - **SATA SSD** (~550 MB/s, limited by the old interface) vs **NVMe SSD** (over PCIe, several GB/s, hundreds of thousands of random reads/sec)
  - Random reads in tens of µs → the cost of jumping around dropped ~100x compared to HDDs; index-heavy databases (B-tree lookups jump around the disk) got much faster
  - Writes happen in pages, but erases happen in bigger blocks, and each block survives a limited number of writes → sequential/append-only writes are still kinder to SSDs (one reason LSM-tree databases like RocksDB and Cassandra write that way)
- **Append-only logs**: **Kafka** writes messages only to the end of a log file → purely sequential disk writes + the OS page cache + zero-copy sends → very high throughput even on HDDs ([Kafka Architecture](/blogs/kafka-architecture))
- **Page cache & durability**: `write()` usually just copies data into the OS **page cache** in RAM and returns; the disk write happens later
  - Power loss before then → data is gone; databases call **`fsync()`** to force data to disk before confirming a commit
  - That's why "durable" writes are slower, and why disabling fsync makes benchmarks look amazing
- **Polling vs Interrupts**: how the CPU finds out a device (disk, network card) is done
  - **Polling**: CPU keeps checking "done yet?" → wastes cycles when events are rare
  - **Interrupts**: device sends a signal when it's done; CPU pauses the current work, runs a small handler, resumes → efficient when events are rare
  - At very high event rates, interrupts themselves become overhead → Linux batches network interrupts (NAPI), and high-performance systems poll on purpose (DPDK, SPDK, `io_uring` polling mode)
- **DMA (Direct Memory Access)**: devices copy data **directly to/from RAM** without the CPU moving each byte; the CPU just says "read this block into this address" and gets an interrupt when it's done → the CPU is free during the transfer
- **PCIe**: high-speed link between the CPU and devices like GPUs, NVMe SSDs, and fast network cards; made of **lanes** (x1, x4, x16); a GPU typically uses x16, an NVMe SSD x4; bandwidth roughly doubles every generation
- **CPU vs GPU**:
  - **CPU**: a few powerful cores; big caches, branch prediction, out-of-order execution; built for **low latency** on complex, branchy logic
  - **GPU**: thousands of simple cores + very high-bandwidth memory (VRAM); built for **throughput**: the same simple operation on millions of values (pixels, matrix math); bad at branchy code
  - Why GPUs dominate graphics and ML (neural networks are mostly matrix multiplication)
  - Data must be copied over PCIe into VRAM → for small jobs, the copy can take longer than the CPU would

## 5. Processes, Threads & Concurrency
> The OS part covers scheduling and synchronization in depth; this is the view from the CPU.

- **Process**: a running instance of a program; the OS gives it its own virtual address space, open files and sockets, and at least one thread; processes are isolated from each other
- **Thread**: a single flow of execution inside a process; to the CPU, a thread is just **a PC + register values + its own stack**; threads of the same process share the heap, globals, code, and open files
- **Context switch**: the OS saves the running thread's registers and PC to memory and loads another thread's; costs a few microseconds directly, plus cold caches and TLB afterwards; switching between processes is more expensive (different address space)
- **Concurrency**: dealing with many tasks by interleaving them; one core can juggle thousands of threads by switching between them quickly
- **Parallelism**: actually running tasks at the same instant on different cores
- **CPU-bound vs I/O-bound**: CPU-bound work (image processing, hashing) needs more cores; I/O-bound work (waiting on DB, network, disk) needs better waiting (async, more concurrent requests); most web backends are I/O-bound
- **Multithreading**: multiple threads in one process; cheap communication (shared memory), but sharing is the danger
  - **Race condition**: `count++` is actually 3 steps: load, add, store; two threads interleave → both read 10, both write 11 → one update lost
  - **Mutex / lock**: only one thread enters the critical section at a time; correct, but threads now wait for each other
  - **Deadlock**: thread A holds lock X and waits for Y; thread B holds Y and waits for X → both wait forever; avoid by always taking locks in the same order
- **Multiprocessing**: multiple processes; isolated memory → a crash or bug in one doesn't corrupt the others; communication needs **IPC** (Inter-Process Communication: pipes, sockets, shared memory) → slower and more work than sharing a variable
- **Real-world examples**:
  - **Chrome** runs tabs and sites in separate processes → uses a lot of RAM, but a crashing tab doesn't kill the browser, and a malicious site can't read your bank tab's memory
  - **Python/Ruby GIL (Global Interpreter Lock)**: standard CPython and Ruby let only one thread run interpreter code at a time → 8 threads doing CPU-heavy math on 8 cores is no faster than 1; threads still help for I/O (the GIL is released while waiting); for CPU-bound work use `multiprocessing` (Python 3.13+ also has an optional free-threaded build without the GIL); Java, Go, C++, and Rust threads run truly in parallel
  - **Node.js**: old thread-per-request servers needed 10,000 threads for 10,000 connections (lots of RAM and context switching); Node uses **one main thread + an event loop**: while one request waits on I/O, it handles others → great for I/O-heavy servers; but one CPU-heavy loop blocks **every** request → move such work to `worker_threads` or another service ([JavaScript Under the Hood](/blogs/javascript-under-the-hood))
  - **Go goroutines**: lightweight threads managed by the Go runtime (start with ~2 KB stacks), multiplexed onto a few OS threads → you can run hundreds of thousands of them

## 6. Multicore & Scaling Limits
- **The power wall**: until ~2005, each new CPU generation simply had a higher clock speed; then heat became the limit (power rises steeply with frequency and voltage), and clocks stalled around 3-5 GHz (today's boost clocks reach ~6 GHz)
  - Chip makers added **more cores** instead → a single-threaded program no longer gets faster on new hardware by itself; software has to be parallel to use the extra power
- **Amdahl's Law**: the serial part of a program limits the total speedup, no matter how many cores you add
  - `Speedup = 1 / ((1 − P) + P / N)`, where P = parallel fraction, N = cores
  - 95% parallel on 64 cores → `1 / (0.05 + 0.95/64)` ≈ **15x**, not 64x; even with infinite cores, max is **20x**
  - In practice the serial part is things like locks, a single DB connection, or merging results; find and shrink it before adding cores
- **Memory ordering**: because of store buffers, caches, and out-of-order execution (and compiler optimizations), one core can see another core's writes **in a different order** than they were made
  - x86 has a fairly strict ordering; ARM is weaker → a bug in homemade lock-free code can stay hidden on an x86 laptop and appear on an ARM (Graviton) server
  - **Memory barriers/fences** force ordering; in practice, use your language's mutexes, atomics, and channels instead of plain shared flags (Java `volatile`/`AtomicInteger`, C++ `std::atomic`, Go `sync/atomic`)
- **Atomics**: CPU instructions that do a read-modify-write as one indivisible step (atomic add, **compare-and-swap / CAS**); the core holds the cache line exclusively during the operation, so no other core can step in between
  - Faster than a mutex, but not free: many cores hammering one atomic counter fight over one cache line → for very hot counters, use per-core/per-thread counters and sum them when needed
- **NUMA (Non-Uniform Memory Access)**: on big multi-socket servers, each CPU socket has its own nearby RAM; accessing the other socket's RAM is noticeably slower; databases and high-performance apps pin threads and memory to the same socket (`numactl`); rarely matters on laptops or small cloud VMs

## 7. Putting It All Together: What Happens When You Run a Program
- Everything from the sections above, in one journey: you compile a small C/Go/Rust program that loops over a large array of integers, sums the positive ones, and writes the total to a file

### Part 1: From source code to a process
1. **Compile**: the compiler turns source code into **machine code** for your ISA (x86-64 or ARM64) and saves it as an executable file on the SSD (ELF on Linux, Mach-O on macOS, PE on Windows); with optimizations on, it may already use **SIMD** instructions for the loop
2. **Run** `./sum`: the shell asks the OS to start it (`fork` + `exec` on Linux)
3. **Process created**: the OS creates a new **virtual address space** and maps the executable into it; apart from the file's headers, nothing is read from disk yet (a C program also gets the dynamic linker and `libc` mapped in; Go binaries are usually static)
4. **Thread scheduled**: the OS places the main thread on a core: sets up its **stack**, loads its registers, and sets the **PC** to the program's first instruction

### Part 2: The first instructions
1. **Fetch** → the virtual address goes to the **MMU** → **TLB miss** → page table walk → page isn't in RAM yet → **page fault** → OS reads that page of the executable from the SSD (via **DMA**) into RAM, or finds it already in the page cache if the file was used recently, updates the page table, resumes the program (pages are loaded **on demand** like this)
2. The instruction isn't in L1, L2, or L3 → **cache miss** → fetched from RAM as a whole **64-byte cache line**, so the next several instructions come along for free (**spatial locality**)
3. **Decode & execute**: e.g. `sum = 0` → the ALU puts 0 in a **register**; the **pipeline** is already fetching and decoding the instructions after it

### Part 3: The hot loop
1. **Memory**: the first element misses the cache → one 64-byte line brings in 16 `int`s → the next 15 reads are L1 hits; the **hardware prefetcher** sees the sequential pattern and fetches the next lines ahead of time → the loop barely waits on RAM (this is why arrays beat linked lists)
2. **Branch prediction**: for `if (x > 0)`, the CPU guesses the outcome and keeps the pipeline full; on random data it's often wrong → **pipeline flush** each time; on sorted data it's almost always right
3. **Out-of-order execution**: while one load waits, independent instructions (loop counter, address calculation, next loads) keep running
4. **SIMD**: if vectorized, the loop compares and adds 8 numbers per instruction (AVX2), often branch-free
5. **Overflow**: if the sum is a 32-bit `int` and the total crosses ~2.1 billion, it silently wraps (or is undefined behavior in C) → use a 64-bit type for sums
6. **Context switches & interrupts**: meanwhile, timer interrupts let the OS run other threads; your thread may be paused and resumed, possibly on another core with cold caches

### Part 4: Writing the result
1. **System call**: the program calls `write()`; the CPU switches from **user mode** to **kernel mode** (only the kernel may talk to hardware)
2. **Page cache**: the kernel copies the bytes into the page cache in RAM and returns right away; the data isn't on disk yet
3. **`fsync()`** (if you want it durable): the kernel sends the write to the NVMe SSD over **PCIe**; the SSD pulls the data from RAM via **DMA**; your thread blocks and the core runs something else (**context switch**)
4. **Interrupt**: the SSD signals completion; the OS marks your thread runnable and schedules it back onto a core
5. **Exit**: the program calls `exit()`; the OS frees its memory, closes its files, and the process is gone

### Summary
```
Compile      → source → machine code for the ISA (maybe SIMD) → executable on disk
Run          → fork/exec → new process + virtual address space → thread on a core, PC = entry point
First fetch  → MMU/TLB miss → page fault → page loaded from SSD (DMA) → cache miss → 64-byte line into L1
Loop         → cache lines + prefetcher → branch prediction (flush on miss) → out-of-order + SIMD
Write        → syscall (kernel mode) → page cache → fsync → PCIe + DMA → interrupt → thread resumes
Exit         → OS frees memory and files
```

## 8. What to Do Next
Build these in order; each one reuses what you learned in the previous one.

1. **Inspect your own machine**: run `lscpu` (cores, threads, cache sizes), `lscpu -e`, `getconf LEVEL1_DCACHE_LINESIZE` (cache line size), `free -h`, `lsblk`, and `lstopo` (from the `hwloc` package; draws your CPU/cache layout); find each section's concepts in the output
2. **Read the assembly**: write a small C function with a loop and an `if`, paste it into [Compiler Explorer](https://godbolt.org); compare `-O0` vs `-O2`; spot the loop, the branch, register use, `cmov`, and SIMD instructions
3. **Measure the hardware**: write micro-benchmarks for sorted vs unsorted branching, row vs column traversal, array vs linked list, and false sharing (with and without 64-byte padding); run them with `perf stat -e cache-misses,branch-misses` and explain every result using this post
4. **Bits & binary formats**: print the bits of an `int` and a `float`; build a permission system using bitmasks; parse a binary file header (BMP or WAV) by hand, dealing with endianness
5. **Concurrency lab**: increment a shared counter from 8 threads: no lock (watch updates get lost) → mutex → atomic → per-thread counters summed at the end; benchmark each
6. **CHIP-8 emulator**: a tiny virtual CPU with registers, memory, a program counter, and ~35 opcodes; you implement the fetch-decode-execute loop yourself
7. **Build a computer from logic gates**: [Nand2Tetris](https://www.nand2tetris.org/) takes you from a single NAND gate to an ALU, a CPU, an assembler, and a working computer

**Resources**
- [Computer Systems: A Programmer's Perspective (CS:APP)](https://csapp.cs.cmu.edu/): the best book on this topic for software engineers; covers everything here in depth
- [What Every Programmer Should Know About Memory - Ulrich Drepper](https://people.freebsd.org/~lstewart/articles/cpumemory.pdf): deep dive into caches, NUMA, and memory performance
- [Cowgod's CHIP-8 Technical Reference](http://devernay.free.fr/hacks/chip8/C8TECH10.HTM): everything you need for project 6
- [Nand2Tetris](https://www.nand2tetris.org/): free course and book for project 7
