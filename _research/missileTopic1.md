---
layout: research
title: "Missile Guidance Filter / Guidance Law"
author: "김형빈"
header: Research 
category: research 
tag: [MISSILE]
taglist: [UAV,MISSILE,AI]
---

## Guidance Law

---

Guidance law enables the missile to reach the target by forming a collision triangle before the interception. There are various types of guidance laws studied and proposed such as True Proportional Navigation(TPN), Pure Proportional Navigation(PPN), Augmented Proportional Navigation(APN), Pure Pursuit, Deviated Pure Pursuit, Optimal Control Guidance(OCG) and etc. We focus on PPN as the basis of our guidance law research.

![image1](/assets/img/missileTopic1/image1.jpg)


Reaching the target(interception) is not the only goal for the missile. It must satisfy with the mission requirements such as desired impact angle, desired impact time, error convergence before interception thus guaranteeing the collision triangle, thrust effort minimizing, maneuvering target and others. Satisfying the requirements thus maximizing the mission capabilities of the missile can be done by proposing the better guidance law!

![image2](/assets/img/missileTopic1/image2.jpg)


## Guidance Filter

---

Strapdown seekers which are typically mounted on the missiles only measure look angle between the missile and the target. In order to validate the guidance command, line-of-sight(LOS) angle rate is needed thus it must be estimated through guidance filter. Besides the necessity of estimation of LOS angle rate, missiles with strapdown seekers are vulnerable to missing target thus resulting in losing lock-on condition for their poor field-of-view(FOV) limit. Target state estimation must be appropriately performed in order to track down the target even if the measurements are lost thus appropriate guidance command can be validated. We deal with the guidance filter which can estimate the target state though measurements are lost or saturated thus maximize the physical mission capabilities and requirements.


![image3](/assets/img/missileTopic1/image3.jpg)
