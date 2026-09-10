---
title: Home
layout: home
nav_order: 1
description: 소프트웨어와 하드웨어 사이 어딘가에서 만든 것들, 그리고 삽질 기록.
---

<div class="home-hero" markdown="0">
  <p class="home-hero__eyebrow">consolekakao</p>
  <h1 class="home-hero__title">만들다 막힌 자리에<br>남겨두는 기록</h1>
  <p class="home-hero__lede">
    웹 개발로 시작해 지금은 로봇이랑 센서 쪽을 만지고 있다.
    잘 된 결과보다는 어디서 어떻게 막혔는지를 주로 적어둔다.
    나중의 내가 같은 자리에서 두 번 헤매지 않았으면 해서.
  </p>
</div>

<div class="card-grid" markdown="0">
  <a class="card" href="{{ '/docs/software/software.html' | relative_url }}">
    <span class="card__index">01</span>
    <span class="card__title">소프트웨어 개발</span>
    <span class="card__desc">서버와 앱, 그리고 그 아래를 받치는 인프라. 일단 돌아가게 만든 다음, 비용과 부하를 줄여간 이야기들.</span>
    <span class="card__tags">Node.js · React Native · AWS Lambda · OpenDRIVE</span>
  </a>
  <a class="card" href="{{ '/docs/hardware/hardware.html' | relative_url }}">
    <span class="card__index">02</span>
    <span class="card__title">하드웨어 개발</span>
    <span class="card__desc">ROS2 자율주행 로봇, 라이다와 카메라 센서, 3D 설계까지. 틀려도 에러 로그 하나 안 남는 동네다.</span>
    <span class="card__tags">ROS2 · Lidar · Blender · OpenCV</span>
  </a>
  <a class="card" href="{{ '/docs/cs/cs.html' | relative_url }}">
    <span class="card__index">03</span>
    <span class="card__title">CS 지식</span>
    <span class="card__desc">작업하다 말고 "이건 왜 이렇게 되어 있지?" 싶어 옆길로 새버린 기록.</span>
    <span class="card__tags">HTTP · Redis · Network</span>
  </a>
  <a class="card" href="{{ '/docs/retrospective/retrospective.html' | relative_url }}">
    <span class="card__index">04</span>
    <span class="card__title">회고</span>
    <span class="card__desc">1년에 한 번, 뭘 했고 뭘 못 했는지. 매년 비슷한 다짐을 반복하는 중이다.</span>
    <span class="card__tags">2022 · 2024 · 2025</span>
  </a>
</div>

## 최신 글

<ul class="recent-list" markdown="0">
  <li>
    <span class="recent-list__cat">소프트웨어</span>
    <a href="{{ '/docs/software/lingbot-map-3d.html' | relative_url }}">영상 한 편으로 3D 맵 만들기 — 24GB VRAM과 싸우기</a>
  </li>
  <li>
    <span class="recent-list__cat">소프트웨어</span>
    <a href="{{ '/docs/software/opendrive-lane-routing.html' | relative_url }}">OpenDRIVE에서 "다음 갈 수 있는 길" 찾기</a>
  </li>
  <li>
    <span class="recent-list__cat">하드웨어</span>
    <a href="{{ '/docs/hardware/camera-jig-blender.html' | relative_url }}">Blender로 4방향 카메라 지그 설계하기</a>
  </li>
  <li>
    <span class="recent-list__cat">하드웨어</span>
    <a href="{{ '/docs/hardware/homeserver-case-blender.html' | relative_url }}">홈서버 케이스를 직접 짜보기</a>
  </li>
  <li>
    <span class="recent-list__cat">하드웨어</span>
    <a href="{{ '/docs/hardware/ros-5-multi-lidar.html' | relative_url }}">다중 라이다 시각화 — 센서 두 대를 하나의 좌표계로</a>
  </li>
  <li>
    <span class="recent-list__cat">회고</span>
    <a href="{{ '/docs/retrospective/2025.html' | relative_url }}">2025 회고</a>
  </li>
</ul>

---

찾는 글이 있다면 왼쪽 사이드바의 검색을 써보자. <kbd>K</kbd> 를 누르면 바로 포커스된다.
