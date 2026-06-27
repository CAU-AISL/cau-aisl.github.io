---
layout: research
title: "Reactive Collision Avoidance Using Probabilistic Ellipsoidal Geometry and Bi-Directional Collision Cone"
author: "우종현"
header: Research 
category: research 
permalink: /Research/:title 
tag: [AERIAL]
taglist: [GUIDANCE,NAVIGATION,CONTROL,AERIAL,SPACE,ROBOTICS]
---

## Reactive Collision Avoidance Using Probabilistic Ellipsoidal Geometry and Bi-Directional Collision Cone

---
In practice, the states of dynamic obstacles cannot be estimated exactly: sensor noise, distance-measurement errors, and tracking latency make the predicted closest point of approach (CPA) uncertain.
Conventional collision-cone methods rely on fixed-size bounding volumes and acceleration commands that drive the vehicle onto the boundary, so estimation uncertainty easily leads to safety-margin violations.
Moreover, traditional aiming-point cones can produce post-avoidance trajectories that re-intrude into the obstacle’s bounding volume.

![img](/assets/img/AerialTopic1/fig5.png)
We propose a reactive collision avoidance system that explicitly accounts for prediction uncertainty.

- **Probabilistic ellipsoidal bounding box**: Using PCA on queued CPA data and a Gaussian collision-probability model, the bounding box is adaptively shaped and sized along the most uncertain directions—conservative when uncertainty is high, compact when confidence is high.

- **Bi-directional collision cone**: Two cones, anchored at the current position and at the goal point, share a common cross-section whose candidate aiming points keep the vehicle clear of the bounding box even after the maneuver. The geometry is solved in an affine space (ellipsoid to sphere) to reduce computational cost.

![img](/assets/img/AerialTopic1/Cones_Ani.gif)

- Single- and multiple-obstacle scenarios and 500-run Monte Carlo simulations show the method preserves the safety radius far more reliably while producing substantially smaller trajectory deviation than baseline collision-cone methods.
![img](/assets/img/AerialTopic1/single_scene_fig.png)
![img](/assets/img/AerialTopic1/multi_scene_fig.png)