---
title: Home
layout: home
nav_order: 1
description: 소프트웨어와 하드웨어 사이 어딘가에서 만든 것들, 그리고 삽질 기록.
---

<div class="home-hero" markdown="0">
  <p class="home-hero__eyebrow">consolekakao</p>
  <h1 class="home-hero__title">만들다 막힌 지점을<br>기록으로 남긴다</h1>
  <p class="home-hero__lede">
    웹 개발로 시작해 지금은 로봇과 센서 쪽을 만지고 있다.
    잘 된 결과보다 어디서 어떻게 막혔는지를 주로 적는다.
    나중의 내가 같은 데서 두 번 막히지 않도록.
  </p>
</div>

<div class="card-grid" markdown="0">
  <a class="card" href="{{ '/docs/software/software.html' | relative_url }}">
    <span class="card__index">01</span>
    <span class="card__title">소프트웨어 개발</span>
    <span class="card__desc">서버, 앱, 프론트엔드, 클라우드 인프라. 돌아가게 만든 뒤에 비용과 부하를 줄인 이야기.</span>
    <span class="card__tags">Node.js · React Native · AWS Lambda · S3</span>
  </a>
  <a class="card" href="{{ '/docs/hardware/hardware.html' | relative_url }}">
    <span class="card__index">02</span>
    <span class="card__title">하드웨어 개발</span>
    <span class="card__desc">ROS2 기반 자율주행 로봇, 라이다와 카메라 센서. 에러 로그조차 안 남는 세계.</span>
    <span class="card__tags">ROS2 · Lidar · Gazebo · OpenCV</span>
  </a>
  <a class="card" href="{{ '/docs/cs/cs.html' | relative_url }}">
    <span class="card__index">03</span>
    <span class="card__title">CS 지식</span>
    <span class="card__desc">작업하다 말고 "이건 왜 이렇게 되어 있지?" 싶어 옆길로 샌 기록.</span>
    <span class="card__tags">HTTP · Redis · Network</span>
  </a>
  <a class="card" href="{{ '/docs/retrospective/retrospective.html' | relative_url }}">
    <span class="card__index">04</span>
    <span class="card__title">회고</span>
    <span class="card__desc">1년에 한 번, 뭘 했고 뭘 못 했는지. 매년 같은 다짐을 반복하는 중.</span>
    <span class="card__tags">2022 · 2024 · 2025</span>
  </a>
</div>

## 최근에 쓴 것

<ul class="recent-list" markdown="0">
  <li>
    <span class="recent-list__cat">하드웨어</span>
    <a href="{{ '/docs/hardware/ros-5-multi-lidar.html' | relative_url }}">다중 라이다 시각화 — 센서 두 대를 하나의 좌표계로</a>
  </li>
  <li>
    <span class="recent-list__cat">하드웨어</span>
    <a href="{{ '/docs/hardware/ros-4-line-tracing.html' | relative_url }}">카메라 센서를 이용한 라인 트레이싱</a>
  </li>
  <li>
    <span class="recent-list__cat">하드웨어</span>
    <a href="{{ '/docs/hardware/ros-3-lidar.html' | relative_url }}">Lidar를 이용한 측위</a>
  </li>
  <li>
    <span class="recent-list__cat">소프트웨어</span>
    <a href="{{ '/docs/software/home-server-monitoring.html' | relative_url }}">남는 PC를 홈서버로 — RN 모니터링 앱 만들기</a>
  </li>
  <li>
    <span class="recent-list__cat">회고</span>
    <a href="{{ '/docs/retrospective/2025.html' | relative_url }}">2025 회고</a>
  </li>
</ul>

---

찾는 글이 있으면 왼쪽 사이드바의 검색을 쓰면 된다. <kbd>K</kbd> 를 누르면 바로 포커스된다.
