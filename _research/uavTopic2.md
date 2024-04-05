---
layout: research
title: "PathPlanning based on Improved Closed-Loop RRT"
author: "정해찬"
header: Research 
category: research 
permalink: /Research/:title 
tag: [UAV]
taglist: [UAV,MISSILE,AI]
---

## Temporary research introduction

---

In this study, given the necessity to generate trajectories in real-time, we adopted the fast-sampling-based RRT technique due to its rapid computation speed. As it is imperative to present feasible paths consistently, we employed the **Bidirectional RRT (BI-RRT)** approach, allowing tree expansion from both the initial and goal nodes. The concept of **online Closed-Loop Bi-RRT** is the algorithm dynamically generates trajectories while considering real-time data. This strategic approach allows for collision anticipation with predicted poses, thereby expediting trajectory generation.  Initially, it utilizes the relative positions and velocity vectors between the ego UAV and intruder to generate **Closest Point of Approach (CPA) points**, enabling collision prediction.   

Following this, the algorithm simultaneously generates trees from the start and goal points. During this process, it explores regions without collisions. If the constraints are satisfied along the entire trajectory, the node q_n is added to the graph as a new node q_new with parent q. Smooth the nodes stored in the graph using the modified CL-RRT algorithm mentioned in the previous paper to ensure the nodes have the shortest distance, then select the node with the shortest distance.

We propose a method leveraging Closest Point of Approach (CPA) information to anticipate collisions and generate a temporary obstacle, termed Rsafe, based on the intruder's CPA point. This approach aims to evade collisions effectively by treating Rsafe as a temporary obstacle. Utilizing this method offers the advantage of utilizing the algorithm employed in prior research while safely navigating dynamic obstacles. However, a drawback of this approach is the tendency to overly avoid collisions when implemented. 

Avoiding collisions excessively is deemed inefficient from both a temporal and cost perspective . Hence, we propose a methodology that not only relies on Closest Point of Approach (CPA) but also utilizes real-time ego vehicle position information to generate collision cones, allowing for the dynamic scaling of obstacles. Initially, the use of collision cones to navigate around scaled obstacles may appear to induce more aggressive maneuvering compared to employing CPA points alone. However, ultimately, this approach aims to generate paths with minimal deviation.