---
title: React에서 Lottie 사용하기
layout: default
parent: Frontend
nav_order: 1
---

### Lottie란

<br/>

**애니메이션을 JSON으로 변환한 파일이다.**

**디자이너는 Lottie를 통해 애니메이션을 이미지처럼 간단하게 옮길 수 있고**

**크기를 늘리거나 줄여도 해상도가 변하지 않는 장점이 있다.**

<br/>

### 개발 측면에서 Lottie란

<br/>

Adobe 에프터이펙트로 만든 애니메이션 이미지를 가벼운 json 확장자로 export 하여 간단하게 웹 또는 앱(ReactNative)에서 애니메이션 구현을 가능하게 하는 라이브러리다.

결국 귀찮게 **애니메이션을 구해오지 않아도 되고 무거운 파일크기를 신경 쓰지 않아도 된다.**

또, 오픈소스처럼 무료로 공유되는 생태계가 점차 커지고 있어 디자이너가 없거나 예산 규모가 작은 개발팀에게 단비 같은 존재다.

<br/><br/>

### 설치

```
yarn add react-lottie
yarn add -D @types/react-lottie  //타입 스크립트 사용시 추가설치.
```

<br/><br/>

### 애니메이션 구해오기

[lottiefiles.com](https://lottiefiles.com/platform)

<br/>

**원하는 애니메이션을 원하는 속도, 색상으로 변경한 뒤 Json파일로 내려받아 프로젝트 내 폴더에 위치시켜 준다.**

### 코드 적용

<br/>

```
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

  return (
      <Lottie options={defaultOptions} width={300} height={300} />
  );
};
```

### 결과

![](https://blog.kakaocdn.net/dn/moC8j/btrXalUtMsw/GoNOfd9MUpYavumNeN0Vtk/img.gif)

<br/><br/>

### 추가 옵션 참고 (공식문서)

[https://lottiereact.com/](https://lottiereact.com/)
