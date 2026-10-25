---
title: "CS Fundamentals: OS - Operating System"
description:  Operating System
pubDatetime: 2026-10-10T22:11:07.000+05:30
author: Aayushmaan Soni
slug: /cs-fundamentals/os
tags: ["os"]
draft: true
featured: false
series:  CS Fundamentals
seriesOrder:  3
---

0. What an OS Is
- What the OS does: manages hardware, isolates programs from each other, gives them simple interfaces (files, sockets, processes)
- Kernel vs user space; CPU privilege levels (rings)
- System calls: the only way into the kernel (links back to "traps" in Comp Arch); see them with strace
- Kernel types: monolithic (Linux), microkernel, hybrid (Windows, macOS)
- Boot process: firmware (BIOS/UEFI) → bootloader (GRUB) → kernel → init (systemd) → login

1. Processes
- What a process is; the PCB (process control block); process states (new, ready, running, waiting, terminated)
- fork() and copy-on-write, exec(), wait(); how a shell runs a command
- Zombie and orphan processes; why PID 1 is special (the "Docker container won't stop" problem → use tini or --init)
- Signals: SIGTERM vs SIGKILL vs SIGINT, SIGHUP; graceful shutdown in apps and Kubernetes
- Exit codes: 137 = killed by SIGKILL (often the OOM killer), 143 = SIGTERM
- Tools: ps, top / htop, /proc/<pid>/

2. Threads
- Thread vs process (link back to Comp Arch); what threads share and what they don't
- User threads vs kernel threads; threading models (1:1, M:N); green threads, goroutines, Java virtual threads
- Thread pools, and why you don't create one thread per request

3. CPU Scheduling
- Goals and trade-offs: throughput, latency, fairness; preemptive vs non-preemptive scheduling
- Algorithms: FCFS, SJF/SRTF, Priority, Round Robin, Multilevel (Feedback) Queue; starvation and aging
- What Linux actually uses: CFS, replaced by EEVDF in kernel 6.6; nice values
- Engineer side: CPU limits in containers, CFS throttling (why a pod is slow at 50% CPU), load average

4. Synchronization
- Race conditions and the critical section problem: mutual exclusion, progress, bounded waiting
- Peterson's solution (brief), and the hardware help it needs (test-and-set, CAS; link back to Comp Arch atomics)
- Mutex vs spinlock; semaphores (wait / signal, also called P / V); counting vs binary semaphores
- Condition variables, monitors, read-write locks
- Classic problems: producer–consumer, readers–writers, dining philosophers (each one mapped to a real system)
- Priority inversion (the Mars Pathfinder story) and priority inheritance

5. Deadlocks
- The 4 conditions (Coffman); resource allocation graphs
- Prevention, avoidance (Banker's), detection and recovery
- In practice: lock ordering, timeouts, tryLock; how Postgres and MySQL detect deadlocks and kill one transaction

6. IPC (Inter-Process Communication)
- Pipes (| in the shell), named pipes, message queues, shared memory, Unix domain sockets, signals
- Real uses: Docker's socket (/var/run/docker.sock), Postgres shared memory, Nginx master and worker processes

7. Memory Management
- Address binding; contiguous allocation; fragmentation (internal vs external)
- Paging: page table structure (multi-level, hashed, inverted); segmentation (brief)
- Demand paging, page faults (minor vs major), copy-on-write
- Page replacement: FIFO, Optimal, LRU, Clock; Belady's anomaly
- Thrashing and working sets
- Engineer side: swap, overcommit, the OOM killer, container memory limits, how malloc gets memory from the kernel (brk / mmap), why RSS never shrinks after a spike

8. Storage & File Systems
- File concept, file types and structure, access methods (sequential, direct, indexed)
- Directory structures (single-level → tree → acyclic graph)
- Inodes, hard links vs symlinks, "everything is a file"
- File descriptors: stdin, stdout, stderr; ulimit -n and "too many open files"; redirection (2>&1)
- Allocation methods (contiguous, linked, indexed); free space management (brief)
- Journaling (ext4, XFS); page cache and fsync (link back to Comp Arch)
- Mounts; virtual filesystems (/proc, /sys, tmpfs); overlay filesystems (how Docker image layers work)

9. I/O & Devices
- Device types (block, character, network); device drivers; /dev
- Disk scheduling algorithms (brief) and Linux I/O schedulers
- I/O models: blocking → non-blocking → select / poll → epoll → io_uring; how this powers Node.js, Nginx, and Go's network code

10. Protection & Security
- Access matrix → ACLs and capabilities lists
- Linux permissions (rwx, chmod, owner/group/others), setuid, sudo
- Linux capabilities (CAP_NET_BIND_SERVICE explains your "ports below 1024 need root" note in Networking)
- Sandboxing: seccomp, SELinux / AppArmor (brief)

11. Virtualization & Containers
- VMs vs containers; hypervisors (type 1 vs type 2)
- Namespaces (PID, network, mount, user, ...) give isolation; cgroups give resource limits
- "A container is just a process with namespaces and cgroups"

12. Putting It All Together: What Happens When You Run docker run -p 8080:80 nginx

13. What to Do Next (projects)
1. Inspect your system: strace ls, /proc, lsof, vmstat, free, ulimit -a
2. Write a shell in C: fork, exec, wait, pipes, redirection, signals
3. Producer–consumer with a mutex and condition variables, then a thread pool
4. Simulators for CPU scheduling and page replacement (compare FIFO, LRU, and Clock on the same input)
5. Build a container from scratch: unshare, chroot / pivot_root, cgroups (about 100 lines of Go)
6. Event-loop server with epoll, then compare it to thread-per-connection
7. A tiny filesystem with FUSE
8. Stretch: go through xv6 (MIT 6.S081) and add a system call

Resources: OSTEP (Operating Systems: Three Easy Pieces), which is free and the best fit for your style; xv6 and its book; The Linux Programming Interface; Brendan Gregg's articles on Linux performance; Liz Rice's "Containers from Scratch" talk.
