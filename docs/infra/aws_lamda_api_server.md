---
title: AWS Lambda를 통한 API 서버 만들기
layout: default
parent: Infra
nav_order: 3
---

### 시작

작업 중 다중 이미지 업로드를 구현할 일이 생겼다.

한 번에 열 장 정도 업로드 될 걸로 예상하지만 휴대폰으로 찍은 고화질 사진이기에 심하면

한 번에 200MB 정도 업로드 되는 최악의 경우를 대비해야겠다고 생각했다.

백엔드에서 리사이징을 진행하더라도 일단 업로드받아서 처리하는데 싱글스레드인 nodeJS가

버텨줄지 의문이었고 클러스터를 믿고 의존하기엔 애매했다.

프론트에서 리사이징 시켜서 업로드해 버릴까 생각도 했지만 좀 더 찾아보기로 했다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbrRk0W%2FbtrXCI8Vsi3%2FXF2tFQyRmudRpkkhngTac1%2Fimg.png){: width="400" height="800"}

사실 serverless는 니꼴라스같은 유튜버가 혁신이네 뭐네 하면서 강의하는 것만 봤지 실제로 써볼 생각은 안 했다.

서버가 있는데 왜 써..? 굳이..?

근데 서버 인스턴스 하나 더 구축하는 게 더 귀찮을 거라 생각했고 람다를 통해서 관리포인트를 줄이기로 했다.

최종 목적은 s3 이미지 업로드지만 처음 구현해 보는 거라 간단한 예제로 시도해 보고자 예전에 만들어두었던

sms발송 코드를 가져왔다. sms 발송코드의 히스토리는 [여기에서](https://bdev.tistory.com/13) 확인할 수 있다.

<br/><br/>

### 기본 세팅

<br/>
처음 구현은 은근히 까다롭다.

IAM을 통해 자격증명을 받아 AccessKey와 AccessSecretKey를 발급받고 하는 과정은 [공식문서](https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/cli-configure-quickstart.html)를 통해 확인할 수 있다.

본 글에서는 위 링크대로 기본 세팅이 되어있다는 전제하에 작성했다.

```
brew install awscli
```

우선 aws를 로컬에서 편하게 다루게 <code>awscli</code>를 설치해 준다.

다음 <code>aws configure</code> 명령어를 통해 기본 환경설정 파일을 열어주고

위에서 발급받았던 액세스키와 시크릿키를 보안자격증명 페이지에서 가져와서 넣어준다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcRlDQD%2FbtrXzZD7tR3%2Fm4qp2HOJ022L8sUOhjoTF1%2Fimg.png)

특별히 할 거 없이 한국을 리전으로 잡았다면 대괄호 안에 있는 대로 리전과 포맷을 적어주면 된다.

여기 입력한 값은 아래 경로에 저장되니 참고하자.  사실 aws configure 다시쳐도 수정가능하다.

**~/.aws/credentials**

<br/><br/>

### 권한등록

AccessKey로 사용자를 등록해 주었으니 이제 이 **사용자가 S3와 람다에 접근가능하게** 권한을 가져오자.

본 글에서는 간단한 sms발송 코드만 구현하기에 S3권한은 사실 필요 없지만 목적은 s3업로드이기에 함께 권한을 요청할 거다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcS6o5h%2FbtrXChRg2oL%2FICCDbKWofIiwz3YOkbs6L1%2Fimg.png)

보안자격증명 - 액세스 관리 - 사용자에 들어가 지정된 AccessKey를 선택 후

우측 권한추가에 정책추가를 누르고 위 두 정책을 검색해서 추가해 준다.

이후 역할에서도 권한을 아래와 같이 똑같이 부여해 주자.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FR2CL9%2FbtrXDAimGy3%2FM6pB7IleqvvBaKxE47RAA1%2Fimg.png)
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FSxiGt%2FbtrXBlNxUNf%2F0MylTko62jeT8zYzHCpXT0%2Fimg.png)
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fm3suH%2FbtrXBNv7PG5%2FYgsfDW6fkSUCWCQPi7Nk4k%2Fimg.png)
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbM6zuT%2FbtrXBYYAmx3%2FP64Zcz8zHHfybgxjMH9MS0%2Fimg.png)
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FthqSA%2FbtrXyj3Tfiw%2FTY9GzYYjWvrxoxMHXCpJuK%2Fimg.png)

### 코드작성

이제 로컬에서 코드를 작성하자.

```
const coolsms = require("coolsms-node-sdk").default;
const messageService = new coolsms(
  "api키 자리",
  "api secret키 자리"
);

exports.handler = function (event, context, callback) {
  try {
    messageService.sendOne({
      to: "받는사람",
      from: "보내는번호",
      text: `[테스트] 인증번호는 [${parseInt(
        Math.random() * 9000
      )}] 입니다. \n알맞게 입력해주세요.`,
    });
  } catch (e) {
    console.log(e);
  }
  const response = {
    statusCode: 200,
    headers: {},
    body: JSON.stringify("success send sms"),
  };
  callback(null, response);
};
```

대충 이렇게 넣어줬다.

<br/><br/>

<code>yarn add coolsms-node-sdk</code> 커멘드를 통해 패키지를 설치해 주고 위와 같이 작성했다.

상세한 의미는 다른 블로그를 참고하고 우선 exports.handler는 꼭 지켜주자.

추후 람다에게 알려줘야 한다.

이제 코드를 작성하는 경로에서 아래 명령어로 node_modules폴더와 함께 싸그리 압축시켜 주자.

```
zip -r 원하는이름.zip 압축할 경로

ex) zip -r sms.zip .
```

### 업로드

그리고 터미널에 아래와 같이 입력해 주자.

```
aws lambda create-function --function-name [람다에등록될 함수명] --zip-file
[파일] --handler [기본함수] --runtime [런타임환경]
--role [아까 역할 발급받았던 arn코드]

나는 아래와 같이 작성했다.

aws lambda create-function --function-name sms --zip-file
fileb://sms.zip --handler index.handler --runtime nodejs18.x
--role arn:aws:iam::106578118133:role/image-resizing
```

위에 role 자리에 들어갈 arn코드는 아래에서 확인할 수 있다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbrLeLX%2FbtrXBxG44vt%2FZ5s8U3E03SeFj6n80e7rG0%2Fimg.png)

명령어를 치고 나면 아래와 같이 정보가 뜨고 q를 눌러 빠져나오자.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fb48473%2FbtrXBAjnhqj%2FXKsW67QTAwKZbnZCbDpl9K%2Fimg.png)

<br/><br/><br/><br/>

### 테스트

아래와 같이 잘 등록되어 나오는 거 확인. 들어가서 테스트해보자.
<br/><br/>

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbFjRMF%2FbtrXBYEiU6O%2FXFnz8ac1xFxYJYchaI16M1%2Fimg.png)
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FK2maP%2FbtrXC0hl4dl%2FAKz4QyEg2AcneK56utlwQK%2Fimg.png)
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FunxHh%2FbtrXz0weEhQ%2F6AP9DNJpZRDk2B81PlHNA1%2Fimg.png)

코드에 작성한 대로 값들이 잘 반환되었고 아래와 같이 문자도 잘 수신된 걸 확인했다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FTMR8U%2FbtrXzZjQxz3%2FZVKZgBPmf9o9K6dKUarQO1%2Fimg.png){: width="300" height="600"}

<br/><br/><br/><br/>

### APIGateway 연동

이제 람다에 함수는 잘 적용했으니 우리가 함수를 호출할 루트를 만들어야 한다.

여기서는 AWS에서 제공하는 API GATEWAY서비스를 이용할 거다.

아래 과정을 그대로 따라 하자.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcxqSWb%2FbtrXCh4NLLp%2F3Ba9rljPXmKkoggjMJv3r0%2Fimg.png){: width="200" height="400"}
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcO6kk0%2FbtrXD7mQD3M%2FvqXSDFl89quNA8lprGalz0%2Fimg.png){: width="200" height="400"}
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F2NB4R%2FbtrXCjauWQ2%2FYmGpgaoy1LBjNLZt8pAFuk%2Fimg.png){: width="200" height="400"}
![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbQ6Ju4%2FbtrXBxG5eBr%2FK2N0kC48a5EhwC8vFYFLL1%2Fimg.png){: width="200" height="400"}

이제 위에 함수개요에 API Gateway가 람다와 연동된 게 다이어그램으로 표기되고 아래에 Api endpoint 주소가 나온다.

우리가 함수를 호출할 최종 url이다.

![](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbjMCZz%2FbtrXFu9Ws1b%2FicPCKI2EFK8PobHNpDewCK%2Fimg.png)
