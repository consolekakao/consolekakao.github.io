---
title: AWS Lambda를 이용해 이미지 리사이징 후 S3 저장하기
layout: default
parent: Infra
nav_order: 4
---

## 시작

<br/><br/>

다량의 썸네일 이미지생성을 처리하기 위한 서버를 구현해야 한다.

백엔드가 NodeJs로 굴러가서 리사이징 같은 CPU 소모가 큰 작업 때문에 이미지 업로드는

백엔드에 맡기지 않고 람다에 전적으로 의존하기로 했다.

### 구조 잡기

<br/><br/>

단순 캡처파일이 아니라 실제로 촬영한 이미지가 스펙상 한 번에 10~20장 정도 업/다운로드를 생각하고 진행했다.

업로드는 어드민에서만 진행하기에 큰 이슈가 없었지만 사용자가 한 번에 10~20장의 이미지를

받아야 하기에 원본제공은 무리라고 생각했다.

그나마 다행인 건 어드민에서만 업로드가 진행될 거라 문제 발생 시 좀 유연하게 대처해도 될 거라 생각했고

어드민에서 업로드는 1일 30회 미만으로 될거같아 ColdStart 환경도 UX를 그렇게 해치지 않을 거라 판단했다.

프론트에서 S3로 바로 업로드 진행하도록 구조를 잡았다.

아래와 같은 아키텍처가 나오게 할 예정이다. 보다시피 서버와는 완전히 분리되었다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FchYcV1%2FbtrXHCaWVMB%2FERkK5uhKVhtrozK4AfUBXk%2Fimg.png){: width="800" height="200"}

<br/><br/>

### 리사이징 처리하기

남들은 어떻게 해결하나 서칭을 좀 해보는데 모바일 사용자를 고려해 만드는 프로젝트기에 굳이

이미지가 클 필요가 없고 어차피 축소되어서 보이기에 이미지 자체를 리사이징 해서

작게 만드는 방법을 많이 사용하고 있었다.

<br/><br/>

Ios와 Android 같은 모바일 디바이스의 경우 가로사이즈가 400px보다 작거나 크게 벗어나지 않기에

400px의 정사각형으로 이미지 리사이징을 진행했다.

추후 템플릿이나 피시를 지원하게 될 경우를 생각해 배열로 만들어 사이즈가 편하게 추가되도록 구현했다.

AWS람다에 업로드되어 적용될 코드라 낯설 수 있지만 아무튼 코드는 아래와 같다.

<br/><br/>

```
const sharp = require("sharp");
const aws = require("aws-sdk");
const s3 = new aws.S3();

const Bucket = "버킷이름";
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

<br/><br/>

권한 설정이나 람다 업로드에 관한 내용은 [[AWS] lambda로 API서버 만들기](https://bdev.tistory.com/26) 에서 확인하면 된다.

<br/><br/>

### 함수 호출하기

<br/><br/>

람다의 함수가 호출되면 원하는 사이즈에 맞게 리사이징 된 이미지가 별도로 저장되게 했으니

이제 S3에서 이미지 업로드가 감지되면 함수를 호출시켜야 한다.

버킷 - 속성 - 이벤트 알림에서 아래와 같이 하나 추가해 주자 이름은 원하는 대로 네이밍 하자.

나는 images/origin 경로에 이미지파일이 추가되면 함수를 호출할 거라 접두사를 저렇게 넣어줬다.

본인 폴더 구조에 알맞게 수정하자.

<br/><br/>

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbRuIo7%2FbtrXLq7DYxT%2Fmq79btX8Nf2aA6DWOkIH2k%2Fimg.png){: width="600" height="600"}

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FEsNSN%2FbtrXHCorIB1%2Fiai8SyIoie8O9hQhgq15p1%2Fimg.png){: width="600" height="600"}

<br/><br/>

### 성능체크

<br/><br/>

다 만들었으면 성능체크를 빼먹을 수 없다.

구글에서 강아지를 검색하고 이런 귀염 뽀작한 이미지를 구해왔다. 용량은 <code>2.0MB</code>다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FBwGoa%2FbtrXHXFCjKF%2F6cpdPzy2LaKEJkJsaIQQv1%2Fimg.png){: width="600" height="600"}

리사이징 전

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbuGpuJ%2FbtrXIyyBRqP%2FrPDxxHUf8jzCNms179EKNk%2Fimg.png)

리사이징 후

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FeqPR95%2FbtrXJWlty95%2Ft2iStn2AJkeIGGkVLhnrK1%2Fimg.png)

<br/><br/>

단순계산으로 <code>15%</code> 수준으로 용량이 떨어졌다.

물론 원본의 사이즈에 따라 천차만별이겠지만 사이즈가 줄어드는 건 분명하니 아무튼 성공이다.

<br/><br/>

이제 프론트나 외부서비스에서 S3로 이미지를 업로드 하더라도 알아서 다양한 사이즈의 썸네일 이미지를

생성해 디바이스에 적절한 이미지를 제공할 수 있다.
