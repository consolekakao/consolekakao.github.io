---
title: AWS Lambda로 이미지 리사이징 후 S3에 저장하기
layout: default
parent: 소프트웨어 개발
nav_order: 3
summary: 2.0MB 원본을 310KB로, 서버는 경로에서 제외
description: 썸네일 생성을 백엔드에서 떼어내 람다로 넘긴 과정. 2.0MB 원본이 310KB가 되기까지.
---

# AWS Lambda로 이미지 리사이징 후 S3에 저장하기
{: .no_toc }

[앞 글](./aws-lambda-api-server.html)에서 람다에 함수를 올리는 것까지 해봤으니,
이제 원래 하려던 걸 할 차례다. 다량의 썸네일 이미지를 효율적으로 생성하고
서버 부하를 줄이기 위해, 리사이징을 백엔드에서 통째로 떼어내 람다에 맡겼다.

<details open markdown="block">
  <summary>목차</summary>
  {: .text-delta }
- TOC
{:toc}
</details>

---

## 배경

백엔드가 Node.js로 굴러가서, 리사이징 같은 **CPU 소모가 큰 작업** 때문에
이미지 업로드는 백엔드에 맡기지 않고 람다에 전적으로 의존하기로 했다.

단순 캡처 파일이 아니라 실제로 촬영한 이미지가 스펙상 한 번에 10~20장 정도
업/다운로드되는 걸 생각하고 진행했다.

| 조건 | 값 | 판단 |
|:--|:--|:--|
| 한 번에 처리할 장수 | 10 ~ 20장 | 원본 제공은 무리 |
| 업로드 주체 | 어드민만 | 문제 발생 시 유연하게 대처 가능 |
| 어드민 업로드 빈도 | 1일 30회 미만 | 콜드스타트가 UX를 크게 해치지 않음 |
| 다운로드 주체 | 일반 사용자 | 여기가 병목. 반드시 경량화 필요 |

업로드는 어드민에서만 진행하기에 큰 이슈가 없었지만, 사용자가 한 번에 10~20장의
이미지를 받아야 하기에 **원본 제공은 무리**라고 생각했다.

그나마 다행인 건 어드민에서만 업로드가 진행될 거라 문제 발생 시 좀 유연하게 대처해도
될 거라 생각했고, 어드민 업로드가 1일 30회 미만일 것 같아 콜드스타트 환경도
UX를 그렇게 해치지 않을 거라 판단했다.

## 구조 잡기

프론트에서 S3로 바로 업로드하도록 구조를 잡았다.
아래와 같은 아키텍처가 나오게 할 예정이다. 보다시피 **서버와는 완전히 분리**되었다.

![프론트 → S3 → Lambda → S3 아키텍처](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FchYcV1%2FbtrXHCaWVMB%2FERkK5uhKVhtrozK4AfUBXk%2Fimg.png)
*백엔드 서버가 이 흐름 어디에도 등장하지 않는다*

## 리사이징 처리하기

남들은 어떻게 해결하나 서칭을 좀 해봤는데, 모바일 사용자를 고려해 만드는 프로젝트라
굳이 이미지가 클 필요가 없고 어차피 축소되어 보이기에,
이미지 자체를 리사이징해서 작게 만드는 방법을 많이 사용하고 있었다.

iOS와 Android 같은 모바일 디바이스는 가로 사이즈가 400px보다 작거나 크게 벗어나지
않기에 **400px 정사각형**으로 리사이징을 진행했다.

추후 템플릿이나 PC를 지원하게 될 경우를 생각해 **배열로 만들어** 사이즈를 편하게
추가할 수 있도록 구현했다.

```javascript
const sharp = require("sharp");
const aws = require("aws-sdk");
const s3 = new aws.S3();

const Bucket = "버킷이름";

// 여기에 { name: "w_800", width: 800 } 같은 식으로 추가만 하면 된다
const transforms = [
  { name: "w_400", width: 400 },
];

exports.handler = async (event, context, callback) => {
  const key = event.Records[0].s3.object.key;
  const sanitizedKey = key.replace(/\+/g, " ");
  const parts = sanitizedKey.split("/");
  const filename = parts[parts.length - 1];

  try {
    const image = await s3.getObject({ Bucket, Key: sanitizedKey }).promise();

    await Promise.all(
      transforms.map(async (item) => {
        const resizedImg = await sharp(image.Body)
          .resize({ width: item.width })
          .toBuffer();
        return await s3
          .putObject({
            Bucket,
            Body: resizedImg,
            Key: `images/${item.name}/resize_${String(
              new Date().getTime()
            ).substring(7)}_${filename}`,
          })
          .promise();
      })
    );
    console.log("success!");
    const response = {
      statusCode: 200,
      headers: {},
      body: JSON.stringify("success"),
    };
    callback(null, response);
  } catch (err) {
    const response = {
      statusCode: 500,
      headers: {},
      body: JSON.stringify(err),
    };
    callback(null, response);
    console.log("error!", err);
  }
};
```

S3 버킷의 IAM 정책 설정 방법과 람다 배포 과정은
[AWS Lambda로 API 서버 만들기](./aws-lambda-api-server.html)에서 확인하면 된다.

## 함수 호출하기

람다 함수가 호출되면 원하는 사이즈에 맞게 리사이징된 이미지가 별도로 저장되게 했으니,
이제 **S3에서 이미지 업로드가 감지되면** 함수를 호출시켜야 한다.

버킷 → 속성 → 이벤트 알림에서 하나 추가해주자. 이름은 원하는 대로 지으면 된다.

![S3 이벤트 알림 생성 화면](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbRuIo7%2FbtrXLq7DYxT%2Fmq79btX8Nf2aA6DWOkIH2k%2Fimg.png){: width="600" }
*접두사로 `images/origin` 을 지정했다*

![이벤트 대상으로 람다 함수 지정](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FEsNSN%2FbtrXHCorIB1%2Fiai8SyIoie8O9hQhgq15p1%2Fimg.png){: width="600" }
*이제 원본이 올라오면 자동으로 함수가 깨어난다*

### 접두사를 지정하지 않으면 무한 루프에 빠진다

{: .warning }
> 나는 `images/origin` 경로에 이미지가 추가되면 함수를 호출하도록 **접두사**를 넣어줬다.
> 이걸 빼먹으면 람다가 만든 결과물이 다시 이벤트를 일으켜서
> 같은 버킷 안에서 무한히 리사이징이 돌게 된다. 본인 폴더 구조에 알맞게 수정하자.

## 성능 체크

다 만들었으면 성능 체크를 빼먹을 수 없다.

구글에서 강아지를 검색하고 이런 귀염 뽀작한 이미지를 구해왔다. 용량은 `2.0MB`다.

![테스트에 사용한 강아지 원본 이미지](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FBwGoa%2FbtrXHXFCjKF%2F6cpdPzy2LaKEJkJsaIQQv1%2Fimg.png){: width="600" }
*이 친구로 테스트했다*

![리사이징 전 S3 객체 목록](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbuGpuJ%2FbtrXIyyBRqP%2FrPDxxHUf8jzCNms179EKNk%2Fimg.png)
*리사이징 전 — dog.png, 2.0MB*

![리사이징 후 S3 객체 목록](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FeqPR95%2FbtrXJWlty95%2Ft2iStn2AJkeIGGkVLhnrK1%2Fimg.png)
*리사이징 후 — resize_873491_dog.png, 310.8KB*

| 항목 | 리사이징 전 | 리사이징 후 | 변화 |
|:--|--:|--:|--:|
| 파일 용량 | 2.0 MB | 310.8 KB | **약 -85%** |
| 원본 대비 비율 | 100 % | 약 15 % | — |
| 업로드 → 결과물 생성 | 09:54:30 | 09:54:34 | 약 4초 |

단순 계산으로 `15%` 수준으로 용량이 떨어졌다.
업로드 시각과 결과물 생성 시각의 차이는 4초였는데, 콜드스타트가 포함된 값이라
실제 처리 시간은 이보다 훨씬 짧을 거다.

물론 원본의 사이즈에 따라 천차만별이겠지만 사이즈가 줄어드는 건 분명하니 아무튼 성공이다.

<!-- TODO(수치): CloudWatch에서 웜스타트 기준 Duration(ms)과 Memory 사용량을 뽑아 추가 -->

10~20장을 한 번에 받는다고 하면 원본은 20~40MB, 리사이징본은 3~6MB다.
모바일에서 이 차이는 체감이 크다.

## 마치며

이제 프론트나 외부 서비스에서 S3로 이미지를 업로드하더라도, 알아서 다양한 사이즈의
썸네일 이미지를 생성해 디바이스에 적절한 이미지를 제공할 수 있게 됐다.

무엇보다 좋은 건 **백엔드가 이 흐름에서 완전히 빠졌다**는 점이다.
싱글스레드인 Node가 200MB짜리 업로드를 받아 리사이징까지 하는 그림을 상상하며
불안해했는데, 아예 경로에서 지워버리니 걱정할 게 없어졌다.

다만 대량의 이미지 업로드 시 **람다의 동시 실행 제한**에 주의가 필요하다.
어드민이 하루 30회 쓰는 지금은 문제가 없지만, 일반 사용자에게 업로드를 열어주는
순간 이 부분을 다시 봐야 한다.

다음엔 이런 걸 해보면 좋겠다.

- **WebP 변환 추가** — 같은 400px이라도 포맷만 바꿔서 얼마나 더 줄어드는지 재보고 싶다.
- **사이즈 배열 확장** — `transforms`에 800px, 1200px을 추가해 PC와 템플릿까지 커버하기.
- **CloudFront 붙이기** — 지금은 S3에서 직접 받는다. CDN을 앞에 두면 응답 시간이 얼마나 줄어들까.
- **동시 실행 제한 테스트** — 20장을 동시에 올렸을 때 스로틀이 걸리는 지점을 찾아두고 싶다.
