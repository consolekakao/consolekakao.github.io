---
title: 시작하기 - REDIS 톺아보기
layout: default
parent: Infra
nav_order: 1
---

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbEnXba%2FbtsqJBH1Ias%2FYR87VPiGnS1dpY6cuvIkIk%2Fimg.png){: width="200" height="200"}

<br/><br/>

#### **들어가기 앞서**

<br/>

### 레디스란?

<code>
Redis는 Remote Dictionary Server의 약자로, 오픈 소스 기반의 비관계형 데이터베이스 관리 시스템(DBMS)입니다. 디스크나 솔리드 스테이트 드라이브(SSD)가 아닌 메모리에 데이터를 저장하기 때문에 탁월한 속도, 안정성, 성능을 제공합니다.</code>
<br/><br/>

**쉽게 말해 RAM에 저장하는 데이터베이스라고 볼 수 있다.**
<br/><br/>
<br/>
**레디스의 가장 강력한 기능 중 하나는 캐싱 이다.**

<br/>

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbXRSYj%2FbtsqRRI4oyn%2FIqkyseMUyupsOlk854RypK%2Fimg.png)

<br/>

풀어 말해 백엔드를 공부하다 보면 커넥션비용이 비싸다는 말을 종종 듣게된다.

대부분 저장된 데이터를 불러오기 위해서 DB에 접근해서 SQL의 실행결과를 가져오는데

이 과정에서 불러온 데이터의 양은 적더라도 실제로는 데이터베이스와 연결을 하고 끊는 과정까지 존재하게 되고,

이를 해결하기 위해 커넥션풀과 같은 방법을 이용해 연결을 유지하는 방법으로 해결하지만 **레플리카 DB**를 따로 두거나 **샤딩**하지 않는 이상

아무리 요청이 많아도 결국 하나의 DB가 모든 트래픽을 처리해야 한다.

분명 하나의 서버에서만 이 DB에 접근하지 않을 일이 많을테니까.

그러다 보면 DB는 부하가 생기게 되고 이는 **디비가 죽어버리거나 성능저하, 유지비용 증가**를 야기하게 된다.

위에선 백엔드 관점에서 DB를 예로 들긴 했지만 React를 사용하는 프론트개발자 관점에서는 useMemo hook을 사용하는 이유를

한 번 떠올려보시면 이해가 쉽다.

리턴되기까지 오래 걸리는 무거운 함수 또는 외부에 많은 api를 요청해야 하는 함수들은 매번 재사용하면서도 찝찝하다.

그래서 우리는 서버와 더 가까운 곳에 데이터를 두기 위해 캐싱을 이용한다.

<br/><br/><br/>

### **장점**

<br/>

**처리속도**
<br/>
금융이나 채팅 같은 리얼타임이 보장되어야 하는 작업이 아니라 데이터의 변화가 잘 일어나지 않는 공지사항이나 한 번 등록하면

수정할 일이 없는 데이터들은 그냥 서버가 돌아가는 동안 DB가 아닌 메모리에 적재해 두는 방법이 수면 위로 떠오르게 된다.

DB에서 값을 가져오지 않고 메모리에 적재해 둔 데이터를 바로 가져오는 건 **시간이 수십 수백 배 어쩌면 그 이상 빠르기 때문이다.**
<br/>

**간편한 사용방법**
<br/>
아래 예제코드에서 서술하겠지만 코드가 굉장히 직관적입니다. 프론트 개발자라면 LocalStorage를 조작해 본 경험이 있을 것이다.

get을 입력하면 키값을 가져오고 Set을 입력하면 키 값을 저장한다. 다를바가 없다.
<br/><br/><br/>
**다양한 데이터타입 지원**
<br/>

위에서 LocalStorage를 언급했는데 LocalStorage에서는 String형태로만 저장되는 불편함이 있긴하다.

Redis는 다양한 데이터타입을 지원합니다. String, Set, List, Hash 등 다양한 데이터타입을 지원하기에 **러닝커브가 낮다.**

대신 공부할게 많아지겠지만 이 외에도 레플리카 지원이나 클러스터 지원 등 장점이 많지만 본 포스트에서는 다루지 않는다.
<br/><br/><br/>

### **단점**

<br/>

**생각보다 많은 공부**

영구저장이 아닌 미니 데이터베이스라는 설명이 적절한 거 같다.

아무리 작고 만만해도 다양항 데이터타입을 저장하고 핸들링하기 위해 메서드가 그만큼 많은 건 어쩔 수 없다.

<br/><br/><br/>

**일시적인 저장**

위에서 말했다시피 영구저장 되는 데이터베이스가 아니라 말 그대로 "임시" 데이터베이스라는 말이 어울리겠다.

데이터를 파일로 저장하는 게 아닌 휘발성인 메모리에 적재해 두는 방법이기때문이 영속성을 보장하지 않는다.

물론 **AOF나 RDB**방식 처럼 스냅샷을 작성하거나 로그를 복사해 매번 서버실행 시 함께 돌려주는 방법이 있지만

이 역시 서버 초기구동시간을 점점 늘리는 방법이라 마냥 해결방법은 아니다.

일시적인 저장인만큼 중요한 데이터보다는 자주 사용되면서 데이터가 <code>휘발되어도 지장이 없거나 다시 호출하면 되는 수준의 데이터를 핸들링해 주는 게 좋겠다.</code>

<br/><br/><br/>

### **사용해 보기**

<br/><br/><br/>

**설치**

본 포스트의 개발환경은 Mac으로 진행했다.

```
brew install redis
```

먼저 redis를 brew를 통해 설치.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fb3b1r9%2FbtsqRRbkL59%2FSP9eH8M6HcAah51ZPXnAKk%2Fimg.png){: width="200" height="200"}

```
redis-server
```

해당 명령어를 입력 시 redis 서버가 돌아가게 됩니다. 기본 포트는 6379를 사용한다.

여기서 불편한 점이 생긴다.

기본적으로 Redis는 foreground로 동작합니다. 때문에 터미널이 종료되면 Redis도 함께 종료되고 그래서 우리는 아리 옵션을 주어 백그라운드로 Redis 서버가 돌아가게 한다.

```
redis-server --daemonize yes
```

Redis 서버를 데몬으로 백그라운드실행 시키겠다는 옵션을 추가로 주었다.
<br/>

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FsIdmy%2FbtsqJD7o30a%2Fptmpxw9Pi9NJm1PVgIxeK0%2Fimg.png){: width="200" height="200"}

<br/>
백그라운드로 돌아가고 있는 Redis에는 redis-cli 커맨드를 통해 접속해서 명령어를 날릴 수 있다.

<br/><br/><br/>

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcAabKV%2FbtsqQ8LikOF%2FG9lkgm9aEDvRCauIvf6u4K%2Fimg.png){: width="200" height="200"}

<br/><br/><br/>

### **실습**

<br/>
이제 node express를 활용해 Redis를 통한 캐싱을 구현하는 과정을 살펴보겠다.

기본적인 타입스크립트 세팅을 해주었고 아래 명령어를 통해 express와 redis 패키지를 다운로드.

```
yarn add redis express
```

아래와 같이 코드를 작성.

```
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

간단하게 코드를 설명하면

**createClient()** 를 통해 레디스 클라이언트를 생성해 준다.

이 예제에선 로컬에서 레디스 서버가 구동되고 있고 포트도 따로 건드려주지 않았기에 자동으로 localhost:6379를 바라보게 되며
**redisClient.connect()** 를 통해 레디스와 커넥션 한다.

<br/>
express가 3030 포트의 기본 경로로 들어오는 GET 요청에 대해서 우선적으로 **redisClient.get** 를 통해

해당 키 값(resultData)의  데이터가 존재하는지 확인하고 있다면 데이터를 그대로 리턴해주고 종료한다.
<br/><br/><br/>
만약 데이터가 존재하지 않는다면 **heavyProcess** 함수의 실행결과를 리턴하고 종료한다.

**heavyProcess** 는 50억 번의 카운팅을 진행하고 50억번의 카운팅이 끝나면

현재 i값(50억)을 레디스의 resultData에 저장한다.

<br/>

바로 아래 **expire**("resultData",20); 코드는 **resultData** 라는 키의 값은 20초만 유효하다고 선언하는 코드이다.

결과적으로 heavyProcess라는 함수는 최소 20초에 한 번만 실행해도 되도록 완성되었다.

<br/>

20초가 지나고 데이터가 만료되기 전까지나 다시 동일한 요청이 올 때까진

다시 연산할 필요 없이 저장해 둔 값을 메모리에서 가져와서 전달하는 작업만 하면 된다.

이제 터미널에서 redis-server --daemonize yes를 입력해 레디스 서버를 실행해 주고 express 서버를 구동해 보았다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FJsOwE%2FbtsqKivbQo3%2FvDxCKzby4Md4wUC7Cwh8nK%2Fimg.png)
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fdf5Ccb%2FbtsqO9wRwo7%2FNtVfCwLxBbqNcGWIZeeWMk%2Fimg.png)
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbVsTYS%2FbtsqLRDGFxM%2FwX3kk6Tq1RsEFxLAJee8nk%2Fimg.png)

<br/>
http://localhost:6379 최초 접속 시 응답이 오는데까지 15.35초가 걸리는데 반해

두 번째 접속시 0.008초가 소요되었고 서버에도 heavyProcess 함수가 **한 번만 실행** 된 걸 확인할 수 있다.
<br/>

예시를 극단적으로 들었긴하지만 해외에서 받아오는 api나 요청 제한이 있는 api등

더 무거운 작업들도 많기에 성능개선을 이런식으로 해볼 수 있다.

이렇게 간단하게 노드서버에서 캐싱을 어떻게 처리하는지 간단한 예제와 함께 알아보았다.
