---
title: React에서 Lottie 사용하기
layout: default
parent: 소프트웨어 개발
nav_order: 6
summary: 디자이너 없이 애니메이션 붙이기
description: 디자이너 없이 로딩 애니메이션이 필요할 때. After Effects 애니메이션을 JSON으로 받아 쓰는 방법.
---

# React에서 Lottie 사용하기
{: .no_toc }

로딩 화면 하나 만드는데 GIF를 쓰자니 화질이 깨지고, 직접 CSS로 그리자니
그럴싸하게 안 나온다. 그럴 때 요긴한 게 Lottie다.

<details open markdown="block">
  <summary>목차</summary>
  {: .text-delta }
- TOC
{:toc}
</details>

---

## Lottie란

**애니메이션을 JSON으로 변환한 파일이다.**

디자이너는 Lottie를 통해 애니메이션을 이미지처럼 간단하게 옮길 수 있고,
크기를 늘리거나 줄여도 해상도가 변하지 않는 장점이 있다.

### 개발 측면에서

Adobe After Effects로 만든 애니메이션을 가벼운 json 확장자로 export하여,
웹 또는 앱(React Native)에서 간단하게 애니메이션 구현을 가능하게 하는 라이브러리다.

결국 귀찮게 **애니메이션을 구해오지 않아도 되고 무거운 파일 크기를 신경 쓰지 않아도 된다.**

또, 오픈소스처럼 무료로 공유되는 생태계가 점차 커지고 있어
디자이너가 없거나 예산 규모가 작은 개발팀에게 단비 같은 존재다.

| 방식 | 확대 시 화질 | 색상 변경 | 비고 |
|:--|:--|:--|:--|
| GIF | 깨짐 | 불가 | 프레임 수만큼 용량 증가 |
| 스프라이트 시트 | 깨짐 | 불가 | 이미지 관리 부담 |
| **Lottie (JSON)** | **유지** | **가능** | 벡터 기반. 플레이어 라이브러리 필요 |

<!-- TODO(수치): 같은 로딩 애니메이션을 GIF와 Lottie JSON으로 각각 뽑아 파일 용량을 비교한 표 추가 -->

## 설치

```bash
yarn add react-lottie
yarn add -D @types/react-lottie  # 타입스크립트 사용 시 추가 설치
```

## 애니메이션 구해오기

[lottiefiles.com](https://lottiefiles.com/platform)

원하는 애니메이션을 원하는 속도, 색상으로 변경한 뒤 JSON 파일로 내려받아
프로젝트 내 폴더에 위치시켜 준다.

사실 여기가 Lottie의 진짜 장점이라고 생각한다. GIF였다면 색 하나 바꾸려고
디자이너를 찾아가야 하는데, 사이트에서 바로 바꿔 다시 받으면 그만이다.

## 코드 적용

```jsx
import React from "react";
import Lottie from "react-lottie";
import LoadingJson from "../assets/loading.json";

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: LoadingJson,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

return <Lottie options={defaultOptions} width={300} height={300} />;
```

`animationData`에 내려받은 JSON을 그대로 꽂으면 된다.
`loop`와 `autoplay`만 켜두면 로딩 화면 용도로는 더 손댈 게 없다.

## 결과

![적용된 로딩 애니메이션](https://blog.kakaocdn.net/dn/moC8j/btrXalUtMsw/GoNOfd9MUpYavumNeN0Vtk/img.gif)
*300 × 300으로 띄웠지만 벡터라 크기를 바꿔도 그대로다*

## 마치며

디자이너 없이도 그럴싸한 로딩 화면을 만들 수 있다는 게 제일 크다.
예전에는 GIF를 구해와서 배경색이 안 맞으면 포기하거나 직접 편집했는데,
지금은 그럴 일이 없어졌다.

다만 플레이어 라이브러리가 번들에 같이 들어간다는 점은 감안해야 한다.
애니메이션 하나 쓰자고 라이브러리를 넣는 게 맞는지는 프로젝트마다 다르지 싶다.

다음엔 이런 걸 해보면 좋겠다.

- **`lottie-react` / `dotlottie`와 비교** — `react-lottie`는 업데이트가 뜸한 것 같은데, 번들 크기와 유지보수 상태를 한번 비교해보고 싶다.
- **인터랙션 연동** — 스크롤이나 클릭에 맞춰 특정 프레임 구간만 재생시키는 방식.
- **직접 만들어보기** — 남이 만든 걸 받아 쓰기만 했는데, After Effects로 간단한 것 하나쯤은 직접 뽑아보고 싶다.

## 참고

- [Lottie React 공식 문서](https://lottiereact.com/)
