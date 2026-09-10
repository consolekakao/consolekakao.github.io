---
title: AWS Lambda로 API 서버 만들기
layout: default
parent: 소프트웨어 개발
nav_order: 2
summary: IAM 권한부터 API Gateway 연동까지
description: 서버 인스턴스 하나 더 세우기 귀찮아서 람다로 도망친 이야기. IAM 권한부터 API Gateway 연동까지.
---

# AWS Lambda로 API 서버 만들기
{: .no_toc }

작업 중 다중 이미지 업로드를 구현할 일이 생겼다.
최악의 경우 한 번에 200MB가 들어올 수도 있는 상황인데, 싱글스레드인 Node가
버텨줄지 자신이 없었다. 서버를 하나 더 세우기는 귀찮아서 람다로 도망쳤다.

<details open markdown="block">
  <summary>목차</summary>
  {: .text-delta }
- TOC
{:toc}
</details>

---

## 배경

한 번에 열 장 정도 업로드될 걸로 예상하지만, 휴대폰으로 찍은 고화질 사진이기에
심하면 한 번에 **200MB 정도** 업로드되는 최악의 경우를 대비해야겠다고 생각했다.

| 조건 | 값 |
|:--|:--|
| 예상 동시 업로드 | 10장 내외 |
| 최악의 경우 총 용량 | 약 200 MB |
| 백엔드 런타임 | Node.js (싱글스레드) |

백엔드에서 리사이징을 진행하더라도 일단 업로드받아서 처리하는 데 싱글스레드인 Node가
버텨줄지 의문이었고, 클러스터를 믿고 의존하기엔 애매했다.
프론트에서 리사이징시켜서 업로드해버릴까 생각도 했지만 좀 더 찾아보기로 했다.

![Serverless 개념 이미지](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbrRk0W%2FbtrXCI8Vsi3%2FXF2tFQyRmudRpkkhngTac1%2Fimg.png){: width="400" }
*서버가 있는데 왜 써..? 굳이..? 라고 생각했었다*

사실 serverless는 니꼴라스 같은 유튜버가 혁신이네 뭐네 하면서 강의하는 것만 봤지
실제로 써볼 생각은 안 했다. 서버가 있는데 왜 써..? 굳이..?

근데 서버 인스턴스 하나 더 구축하는 게 더 귀찮을 거라 생각했고,
람다를 통해서 **관리 포인트를 줄이기로** 했다.

최종 목적은 S3 이미지 업로드지만, 처음 구현해보는 거라 간단한 예제로 시도해보고자
예전에 만들어두었던 SMS 발송 코드를 가져왔다.

## 기본 세팅

처음 구현은 은근히 까다롭다.

IAM을 통해 자격증명을 받아 AccessKey와 AccessSecretKey를 발급받는 과정은
[공식문서](https://docs.aws.amazon.com/ko_kr/cli/latest/userguide/cli-configure-quickstart.html)에서
확인할 수 있다. 본 글에서는 위 링크대로 기본 세팅이 되어 있다는 전제하에 작성했다.

```bash
brew install awscli
```

우선 AWS를 로컬에서 편하게 다루게 `awscli`를 설치해준다.
다음 `aws configure` 명령어로 기본 환경설정 파일을 열고,
발급받았던 액세스키와 시크릿키를 보안자격증명 페이지에서 가져와 넣어준다.

![aws configure 실행 화면](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcRlDQD%2FbtrXzZD7tR3%2Fm4qp2HOJ022L8sUOhjoTF1%2Fimg.png)
*한국을 리전으로 잡았다면 대괄호 안에 있는 대로 리전과 포맷을 적어주면 된다*

여기 입력한 값은 `~/.aws/credentials` 에 저장되니 참고하자.
사실 `aws configure` 다시 쳐도 수정 가능하다.

## 문제 1. 권한이 없어서 아무것도 안 된다

{: .problem }
> **증상** AccessKey로 사용자를 등록했는데 람다 함수 생성이 거부된다.
> 키가 있다고 다 되는 게 아니었다.

AccessKey는 "누구인지"만 증명한다. "무엇을 할 수 있는지"는 정책(Policy)이 따로 있다.
사용자와 역할(Role) 양쪽에 권한을 붙여줘야 한다.

{: .solution }
> **해결** 보안자격증명 → 액세스 관리 → 사용자에서 해당 AccessKey를 선택하고,
> 우측 권한 추가 → 정책 추가로 S3와 Lambda 정책을 검색해 붙였다.
> 그리고 **역할(Role)에도 똑같이** 부여했다.

![IAM 사용자 권한 추가 화면](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcS6o5h%2FbtrXChRg2oL%2FICCDbKWofIiwz3YOkbs6L1%2Fimg.png)
*사용자에 정책 두 개를 붙인다*

본 글에서는 간단한 SMS 발송 코드만 구현하기에 S3 권한은 사실 필요 없지만,
목적은 S3 업로드이기에 함께 권한을 요청했다.

![역할에 정책을 부여하는 과정](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FR2CL9%2FbtrXDAimGy3%2FM6pB7IleqvvBaKxE47RAA1%2Fimg.png)
*역할에도 동일하게 붙여준다. 여기를 빼먹으면 함수가 실행 시점에 죽는다*

![역할 생성 단계 1](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FSxiGt%2FbtrXBlNxUNf%2F0MylTko62jeT8zYzHCpXT0%2Fimg.png)

![역할 생성 단계 2](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fm3suH%2FbtrXBNv7PG5%2FYgsfDW6fkSUCWCQPi7Nk4k%2Fimg.png)

![역할 생성 단계 3](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbM6zuT%2FbtrXBYYAmx3%2FP64Zcz8zHHfybgxjMH9MS0%2Fimg.png)

![생성 완료된 역할](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FthqSA%2FbtrXyj3Tfiw%2FTY9GzYYjWvrxoxMHXCpJuK%2Fimg.png)
*이 역할의 ARN을 뒤에서 쓴다*

## 코드 작성

이제 로컬에서 코드를 작성하자.

```javascript
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

`yarn add coolsms-node-sdk` 로 패키지를 설치하고 위와 같이 작성했다.

{: .note }
> 상세한 의미는 다른 블로그를 참고하고, 우선 **`exports.handler`는 꼭 지켜주자.**
> 추후 람다에게 진입점으로 알려줘야 한다.

이제 코드를 작성하는 경로에서 아래 명령어로 `node_modules` 폴더와 함께 싸그리
압축시켜주자.

```bash
zip -r 원하는이름.zip 압축할경로

# 예시
zip -r sms.zip .
```

## 업로드

터미널에 아래와 같이 입력한다.

```bash
aws lambda create-function \
  --function-name [람다에 등록될 함수명] \
  --zip-file  [파일] \
  --handler   [기본함수] \
  --runtime   [런타임환경] \
  --role      [아까 발급받았던 역할의 arn]

# 나는 아래와 같이 작성했다
aws lambda create-function \
  --function-name sms \
  --zip-file fileb://sms.zip \
  --handler index.handler \
  --runtime nodejs18.x \
  --role arn:aws:iam::<계정ID>:role/image-resizing
```

`role` 자리에 들어갈 ARN은 아래에서 확인할 수 있다.

![역할 상세 화면의 ARN](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbrLeLX%2FbtrXBxG44vt%2FZ5s8U3E03SeFj6n80e7rG0%2Fimg.png)
*ARN 문자열을 그대로 복사해 쓰면 된다*

명령어를 치고 나면 아래처럼 정보가 뜨고, `q`를 눌러 빠져나오면 된다.

![create-function 실행 결과](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2Fb48473%2FbtrXBAjnhqj%2FXKsW67QTAwKZbnZCbDpl9K%2Fimg.png)
*생성된 함수의 메타데이터가 그대로 출력된다*

## 테스트

아래와 같이 잘 등록되어 나오는 걸 확인했다. 들어가서 테스트해보자.

![람다 콘솔의 함수 목록](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbFjRMF%2FbtrXBYEiU6O%2FXFnz8ac1xFxYJYchaI16M1%2Fimg.png)

![테스트 이벤트 설정](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FK2maP%2FbtrXC0hl4dl%2FAKz4QyEg2AcneK56utlwQK%2Fimg.png)

![테스트 실행 결과](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FunxHh%2FbtrXz0weEhQ%2F6AP9DNJpZRDk2B81PlHNA1%2Fimg.png)
*코드에 작성한 대로 값들이 잘 반환되었다*

![수신된 문자 메시지](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FTMR8U%2FbtrXzZjQxz3%2FZVKZgBPmf9o9K6dKUarQO1%2Fimg.png){: width="300" }
*문자도 잘 수신됐다*

## API Gateway 연동

람다에 함수는 잘 올렸으니, 이제 이 함수를 호출할 루트를 만들어야 한다.
AWS에서 제공하는 API Gateway 서비스를 이용한다.

![API Gateway 트리거 추가 1](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcxqSWb%2FbtrXCh4NLLp%2F3Ba9rljPXmKkoggjMJv3r0%2Fimg.png){: width="260" }

![API Gateway 트리거 추가 2](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FcO6kk0%2FbtrXD7mQD3M%2FvqXSDFl89quNA8lprGalz0%2Fimg.png){: width="260" }

![API Gateway 트리거 추가 3](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2F2NB4R%2FbtrXCjauWQ2%2FYmGpgaoy1LBjNLZt8pAFuk%2Fimg.png){: width="260" }

![API Gateway 트리거 추가 4](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbQ6Ju4%2FbtrXBxG5eBr%2FK2N0kC48a5EhwC8vFYFLL1%2Fimg.png){: width="260" }
*순서대로 따라 하면 된다*

이제 함수 개요에 API Gateway가 람다와 연동된 게 다이어그램으로 표기되고,
아래에 API endpoint 주소가 나온다. 우리가 함수를 호출할 최종 URL이다.

![연동 완료된 함수 개요와 엔드포인트](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbjMCZz%2FbtrXFu9Ws1b%2FicPCKI2EFK8PobHNpDewCK%2Fimg.png)
*이 엔드포인트를 때리면 문자가 날아간다*

<!-- TODO(수치): 콜드스타트와 웜스타트 각각의 응답 시간을 CloudWatch에서 뽑아 표로 추가 -->

## 마치며

"서버가 있는데 왜 써"라고 생각했던 게 무색하게, 결국 관리 포인트를 줄이려고
람다를 쓰게 됐다. 인스턴스를 하나 더 띄우면 그 인스턴스의 OS 업데이트, 모니터링,
비용까지 전부 내 몫이 되는데 람다는 그게 없다.

대신 처음 세팅이 은근히 까다로웠다. 코드 자체는 20줄인데 IAM 사용자·역할·정책의
관계를 이해하는 데 시간을 제일 많이 썼다. 권한을 사용자에만 주고 역할에 안 줘서
헤맨 게 특히 그랬다.

이제 목적이었던 S3 이미지 리사이징으로 넘어갈 차례다.

다음엔 이런 걸 해보면 좋겠다.

- **[이미지 리사이징에 실제로 적용해보기](./aws-lambda-image-resize.html)** — 이 글의 원래 목적이다.
- **콘솔 대신 IaC로** — 지금은 CLI와 콘솔을 오가며 만들었다. SAM이나 Terraform으로 관리하면 재현이 쉬워질 것 같다.
- **콜드스타트 측정** — 체감으로만 "좀 느린데" 하고 넘어갔다. 숫자로 봐야 대응할지 말지 정할 수 있다.
