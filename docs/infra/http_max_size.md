---
title: HTTP Header는 용량제한이 있을까?
layout: default
parent: Infra
nav_order: 2
---

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fb3UUv1%2FbtrVzYAcxK1%2FHAl5bBvparDlQutCm8KaF1%2Fimg.png){: width="400" height="400"}

API를 만드는 도중 Axios를 통해 POST 하는 과정에서 왜 데이터를 헤더에 다 안 보내고 굳이 Body에 싣어서 날릴까 의문이 들었다.

그냥 헤더에 다 때려박으면 안될까 싶어서 찾아봤다.

아무래도 데이터크기 이슈가 있지 않을까 찾아봤는데 일단 정답은 **HTTP 스펙상 헤더의 크기제한은 없다.**

하지만 우리가 사용하는 **엔진에서 이를 제한**하고있다.

엔진에서 제한하는 기본 스펙은 아래와 같다.

- 아파치 - 8K
- Nginx - 4K-8K
- IIS - 8K-16K
- 톰캣 - 8K – 48K
- 노드(<13) - 8K; (>13) - 16K

엔진별로 헤더 크기를 바꾸거나 일부 엔진은 **제한을 풀 수 있는 기능을 제공**하지만

<code>
제한되지 않은 HTTP 헤더 크기는 서버를 공격에 노출시키고 유기적 트래픽을 제공하는 용량을 감소시킬 수 있기에 추천하지 않는다.
</code>

참고 [Maximum on HTTP header values?](https://stackoverflow.com/questions/686217/maximum-on-http-header-values)
