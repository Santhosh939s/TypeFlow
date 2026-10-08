# ⚡ Performance Engineering & Latency Standards

TypeFlow is engineered to deliver zero-friction typing with sub-millisecond input response times.

## Input Handling Pipeline

* **Direct DOM Focus**: Uncontrolled keyboard event routing directly into memory without React reconciliation bottlenecks.
* **Synchronous Caret Computation**: Visual caret coordinate positioning computed synchronously on character strike.
* **Microsecond Timestamping**: Keystroke interval delta calculations using high-resolution browser performance timers (`performance.now()`).

## Caching & Database Efficiency

* **Dual-Tier Cache**: Memory cache backed by localStorage SWR prevents unnecessary cloud requests.
* **Batch Telemetry**: Keystroke timeline points are sampled and batched to eliminate continuous I/O during active tests.
