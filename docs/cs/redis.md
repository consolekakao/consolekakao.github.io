---
title: 시작하기 - Redis 톺아보기
layout: default
parent: CS 지식
nav_order: 2
summary: Express에 캐싱을 붙여 15.35초를 0.008초로
description: RAM에 저장하는 데이터베이스. Node Express에 캐싱을 붙여 15.35초를 0.008초로 만든 예제.
---

# 시작하기 - Redis 톺아보기
{: .no_toc }

같은 요청에 같은 답을 주는데 매번 DB까지 다녀올 이유가 있을까.
Redis를 붙여서 15.35초 걸리던 응답을 0.008초로 만들어봤다.

<details open markdown="block">
  <summary>목차</summary>
  {: .text-delta }
- TOC
{:toc}
</details>

---

## Redis란

> Redis는 Remote Dictionary Server의 약자로, 오픈 소스 기반의 비관계형
> 데이터베이스 관리 시스템(DBMS)이다. 디스크나 솔리드 스테이트 드라이브(SSD)가 아닌
> 메모리에 데이터를 저장하기 때문에 탁월한 속도, 안정성, 성능을 제공한다.

**쉽게 말해 RAM에 저장하는 데이터베이스라고 볼 수 있다.**

레디스의 가장 강력한 기능 중 하나는 **캐싱**이다.

![캐싱 구조 다이어그램](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbXRSYj%2FbtsqRRI4oyn%2FIqkyseMUyupsOlk854RypK%2Fimg.png)
*DB 앞에 한 겹 두고, 있으면 바로 주고 없을 때만 DB까지 간다*

## 왜 필요한가

백엔드를 공부하다 보면 커넥션 비용이 비싸다는 말을 종종 듣게 된다.

대부분 저장된 데이터를 불러오기 위해 DB에 접근해서 SQL 실행 결과를 가져오는데,
이 과정에서 불러온 데이터의 양은 적더라도 실제로는 **데이터베이스와 연결하고 끊는
과정**까지 존재하게 된다.

이를 해결하려고 커넥션 풀 같은 방법으로 연결을 유지하지만,
**레플리카 DB**를 따로 두거나 **샤딩**하지 않는 이상 아무리 요청이 많아도
결국 하나의 DB가 모든 트래픽을 처리해야 한다.
분명 하나의 서버에서만 이 DB에 접근하지 않을 일이 많을 테니까.

그러다 보면 DB는 부하가 생기게 되고, 이는 **DB가 죽어버리거나 성능 저하, 유지비용 증가**를
야기하게 된다.

{: .note }
> 백엔드 관점에서 DB를 예로 들었지만, React를 쓰는 프론트 개발자라면
> `useMemo`를 쓰는 이유를 떠올려보면 이해가 쉽다.
> 리턴되기까지 오래 걸리는 무거운 함수를 매번 다시 실행하는 게 찝찝한 그 마음,
> 그대로다.

그래서 우리는 서버와 더 가까운 곳에 데이터를 두기 위해 캐싱을 이용한다.

## 장점

**처리 속도**

금융이나 채팅 같은 리얼타임이 보장되어야 하는 작업이 아니라,
데이터의 변화가 잘 일어나지 않는 공지사항이나 한 번 등록하면 수정할 일이 없는
데이터들은 그냥 서버가 돌아가는 동안 DB가 아닌 메모리에 적재해 두는 방법이
수면 위로 떠오르게 된다.

DB에서 값을 가져오지 않고 메모리에 적재해 둔 데이터를 바로 가져오는 건
**시간이 수십 수백 배, 어쩌면 그 이상 빠르기 때문이다.**
이건 뒤에서 숫자로 확인한다.

**간편한 사용 방법**

아래 예제 코드에서 서술하겠지만 코드가 굉장히 직관적이다.
프론트 개발자라면 LocalStorage를 조작해 본 경험이 있을 것이다.
`get`을 입력하면 값을 가져오고 `set`을 입력하면 값을 저장한다. 다를 바가 없다.

**다양한 데이터 타입 지원**

위에서 LocalStorage를 언급했는데, LocalStorage는 String 형태로만 저장되는
불편함이 있다. Redis는 String, Set, List, Hash 등 다양한 데이터 타입을 지원하기에
**러닝커브가 낮다.**

대신 공부할 게 많아지겠지만, 이 외에도 레플리카 지원이나 클러스터 지원 등
장점이 많다. 본 글에서는 다루지 않는다.

## 단점

**생각보다 많은 공부**

영구 저장이 아닌 미니 데이터베이스라는 설명이 적절한 것 같다.
아무리 작고 만만해도 다양한 데이터 타입을 저장하고 핸들링하기 위해
메서드가 그만큼 많은 건 어쩔 수 없다.

**일시적인 저장**

위에서 말했다시피 영구 저장되는 데이터베이스가 아니라,
말 그대로 "임시" 데이터베이스라는 말이 어울리겠다.

데이터를 파일로 저장하는 게 아닌 휘발성인 메모리에 적재해 두는 방법이기 때문에
영속성을 보장하지 않는다.

물론 **AOF나 RDB** 방식처럼 스냅샷을 작성하거나 로그를 복사해 매번 서버 실행 시
함께 돌려주는 방법이 있지만, 이 역시 서버 초기 구동 시간을 점점 늘리는 방법이라
마냥 해결책은 아니다.

{: .warning }
> 일시적인 저장인 만큼 중요한 데이터보다는, 자주 사용되면서
> **휘발되어도 지장이 없거나 다시 호출하면 되는 수준의 데이터**를 다루는 게 좋겠다.

## 설치

본 글의 개발 환경은 Mac이다.

```bash
brew install redis
```

![brew install redis 실행 결과](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fb3b1r9%2FbtsqRRbkL59%2FSP9eH8M6HcAah51ZPXnAKk%2Fimg.png){: width="400" }
*brew로 간단히 설치된다*

```bash
redis-server
```

해당 명령어를 입력하면 Redis 서버가 돌아간다. 기본 포트는 **6379**를 사용한다.

### 문제 - 터미널을 닫으면 Redis도 죽는다

{: .problem }
> **증상** 기본적으로 Redis는 foreground로 동작한다.
> 터미널이 종료되면 Redis도 함께 종료된다.

{: .solution }
> **해결** `--daemonize yes` 옵션으로 백그라운드 실행시킨다.

```bash
redis-server --daemonize yes
```

![데몬으로 실행된 redis 프로세스](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FsIdmy%2FbtsqJD7o30a%2Fptmpxw9Pi9NJm1PVgIxeK0%2Fimg.png){: width="200" }
*데몬으로 백그라운드 실행 중*

백그라운드로 돌아가고 있는 Redis에는 `redis-cli` 커맨드로 접속해서 명령어를 날릴 수 있다.

![redis-cli 접속 화면](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcAabKV%2FbtsqQ8LikOF%2FG9lkgm9aEDvRCauIvf6u4K%2Fimg.png){: width="200" }
*get / set 만 알면 일단 시작할 수 있다*

## 실습 - Express에 캐싱 붙이기

이제 Node Express를 활용해 Redis를 통한 캐싱을 구현해보겠다.
기본적인 타입스크립트 세팅을 해주고 아래 명령어로 패키지를 설치한다.

```bash
yarn add redis express
```

```typescript
import express from "express";
import { createClient } from "redis";
import { Request, Response } from "express-serve-static-core";

const server = express();

const redisClient = createClient();
redisClient.connect();

const heavyProcess = () => {
  console.log("heavyProcess called");
  for (let i = 1; i <= 5000000000; i++) {
    if (i === 5000000000) {
      redisClient.set("resultData", i);
      redisClient.expire("resultData", 20);
      return i.toString();
    }
  }
};

server.get("/", async (req: Request, res: Response) => {
  const data = await redisClient.get("resultData");
  if (data) {
    res.send(data);
    return;
  }
  res.send(heavyProcess());
  return;
});

server.listen(3030, () => {
  console.log("server on");
});
```

간단하게 코드를 설명하면,

`createClient()`로 레디스 클라이언트를 생성한다. 이 예제에선 로컬에서 레디스 서버가
구동되고 있고 포트도 따로 건드리지 않았기에 자동으로 `localhost:6379`를 바라보게 되며,
`redisClient.connect()`로 레디스와 커넥션한다.

Express가 3030 포트의 기본 경로로 들어오는 GET 요청에 대해 우선 `redisClient.get`으로
해당 키(`resultData`)의 데이터가 존재하는지 확인하고, 있다면 그대로 리턴하고 종료한다.

만약 데이터가 존재하지 않는다면 `heavyProcess` 함수의 실행 결과를 리턴한다.
`heavyProcess`는 **50억 번의 카운팅**을 진행하고, 끝나면 현재 값을 `resultData`에 저장한다.

바로 아래 `expire("resultData", 20)`은 `resultData` 키의 값이 **20초만 유효**하다고
선언하는 코드다.

결과적으로 `heavyProcess`는 최소 20초에 한 번만 실행해도 되도록 완성되었다.
20초가 지나고 데이터가 만료되기 전까지는 다시 연산할 필요 없이
저장해 둔 값을 메모리에서 가져와서 전달하는 작업만 하면 된다.

## 결과

터미널에서 `redis-server --daemonize yes`로 레디스를 실행하고 Express 서버를 구동했다.

![첫 요청 응답 시간](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FJsOwE%2FbtsqKivbQo3%2FvDxCKzby4Md4wUC7Cwh8nK%2Fimg.png)
*최초 접속 — 15.35초*

![두 번째 요청 응답 시간](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fdf5Ccb%2FbtsqO9wRwo7%2FNtVfCwLxBbqNcGWIZeeWMk%2Fimg.png)
*두 번째 접속 — 0.008초*

![서버 로그](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbVsTYS%2FbtsqLRDGFxM%2FwX3kk6Tq1RsEFxLAJee8nk%2Fimg.png)
*heavyProcess는 딱 한 번만 실행됐다*

| 항목 | 캐시 미스 (최초) | 캐시 히트 (2회차) | 변화 |
|:--|--:|--:|--:|
| 응답 시간 | 15.35 s | 0.008 s | **약 1,900배 단축** |
| `heavyProcess` 실행 | 1회 | 0회 | — |
| 캐시 유효 기간 | — | 20 s | TTL |

최초 접속 시 응답이 오는 데까지 15.35초가 걸리는 데 반해,
두 번째 접속 시 0.008초가 소요되었고, 서버에도 `heavyProcess` 함수가
**한 번만 실행**된 걸 확인할 수 있다.

예시를 극단적으로 들긴 했지만, 해외에서 받아오는 API나 요청 제한이 있는 API 등
더 무거운 작업들도 많기에 성능 개선을 이런 식으로 해볼 수 있다.

## 마치며

`get`과 `set` 두 개만 알면 시작할 수 있다는 게 Redis의 제일 큰 장점이라고 생각한다.
LocalStorage 써본 사람이라면 코드를 읽는 데 5분도 안 걸린다.

다만 쉬운 만큼 **어디에 쓸지 판단하는 게 진짜 일**이라는 생각이 든다.
20초짜리 TTL을 20초로 정한 근거가 이 예제에는 없다. 실제 서비스에서는
"이 데이터가 몇 초까지 낡아도 괜찮은가"를 정하는 게 캐싱 코드를 짜는 것보다
훨씬 어려운 결정일 것 같다.

<!-- TODO(수치): AOF / RDB 를 켰을 때 서버 초기 구동 시간이 얼마나 늘어나는지 재보기 -->

다음엔 이런 걸 해보면 좋겠다.

- **캐시 무효화 전략** — TTL 말고, 데이터가 바뀔 때 키를 지우는 방식을 붙여보고 싶다.
- **Cache Stampede** — TTL이 만료되는 순간 요청이 몰리면 전부 DB로 쏟아진다. 이걸 어떻게 막는지.
- **AOF vs RDB 실측** — 영속성 옵션을 켰을 때 구동 시간과 데이터 손실 범위를 직접 비교해보기.
- **Redis를 세션 스토어로** — 서버를 여러 대 띄웠을 때의 세션 공유 문제에 적용해보기.
