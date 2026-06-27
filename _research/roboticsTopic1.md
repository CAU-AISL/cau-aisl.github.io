---
layout: research
title: "Hierarchical Safety-Aware Coordination and Control for Connectivity-Preserving Cooperative Multi-Robot"
author: "윤홍렬"
header: Research 
category: research 
permalink: /Research/:title 
tag: [ROBOTICS]
taglist: [GUIDANCE,NAVIGATION,CONTROL,AERIAL,SPACE,ROBOTICS]
---

Narrow passages and occlusions amplify mutual blocking at chokepoints and dead ends, while greedy exploration can spread the team beyond reliable communication range and fragment it.
Prior goal-driven and frontier-based methods typically assume global maps or idealized communication, or treat safety, dynamic feasibility, and connectivity as secondary constraints—so high-level goals frequently conflict with low-level safety filtering, causing oscillation, stalls, or team fragmentation.
Research on robotics focuses on the design, modeling, and control of autonomous robotic systems, including ground robots, manipulators, and legged/wheeled platforms.
Our work integrates state estimation, sensor fusion, and advanced control algorithms to achieve reliable autonomy in complex environments.

We propose a hierarchical framework that decouples low-rate communication-aware coordination from high-rate decentralized execution.
A centralized layer performs belief-map updates, boundary-aligned target sampling, Hungarian assignment, adaptive leader–follower role switching, and a Directed Minimum Spanning Tree (D-MST) communication backbone.
Each agent then replans locally with A* and executes nominal commands through a decentralized high-order control barrier function quadratic program (HOCBF-QP) that enforces obstacle avoidance, inter-agent collision avoidance, and link-conditioned connectivity in real time.
Across diverse cluttered corridor maps, the framework maintains bounded team separation, mitigates bottlenecks, and recovers from local trapping—achieving substantially higher success rates than a frontier-based baseline while preserving connectivity and safety.

## Boundary-Based Target Sampling
Instead of brittle scoring heuristics, candidate exploration targets are sampled along the outward boundary of the explored region and filtered with a distance constraint that keeps the team from fragmenting.
![img](/assets/img/RoboticsTopic1/figure_1.png)

## Decentralized HOCBF-QP Safety Filter
Each agent minimally modifies its nominal goal-seeking command to satisfy three relative-degree-two constraints simultaneously: static obstacle avoidance, inter-agent collision avoidance, and D-MST parent–child connectivity.

## Qualitative Results
The framework reproduces the three intended cooperative behaviors:

1. **Congestion-mitigated traversal** — agents pass tight passages without persistent deadlocks, with role hand-off resolving local bottlenecks.
![img](/assets/img/RoboticsTopic1/figure_2.png)
2. **Exploration with bounded separation** — the team disperses in open regions for coverage but stays cohesive near connectivity-critical branches.
![img](/assets/img/RoboticsTopic1/figure_3.png)
3. **Role-aware trap recovery** — when an agent is trapped, roles are reassigned so the team escapes as a connectivity-aware chain.
![img](/assets/img/RoboticsTopic1/figure_4.png)