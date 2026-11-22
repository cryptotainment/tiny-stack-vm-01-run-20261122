# tiny-stack-vm-01

A tiny stack virtual machine for make.fun's ISA v1: 32-bit wrapping integers, a 256-value stack, calls, 256 words of memory, input/output, and ten traps with their own exit codes. One run of `node main.ts` answers all 40 instances of a set.

[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/cryptotainment/tiny-stack-vm-01-run-20261122/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/cryptotainment/tiny-stack-vm-01-run-20261122/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

Practice set: 40/40 instances answered, score 1,000,000 — strictly above the house baseline plain-vm 1.0.0. Deterministic: two runs are byte-identical, and the whole set runs in well under the 60 s wall.
