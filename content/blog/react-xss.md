---
author: ziho
pubDatetime: 2023-12-09T07:21:44.624Z
title: console.log(<App />)
postSlug: react-xss
featured: true
draft: false
tags:
  - react
  - xss
  - dompurify
description: React에서 console.log(<App />)를 하면 어떻게 로그가 남을까요?
---

React에서 `console.log(<App />)` 를 하면 어떻게 로그가 남을까요?

```jsx
import React from "react";

export function App(props) {
  return <div>Hello, {props.name}</div>;
}

console.log(<App name="ziho" />);
```

아래처럼 `$$typeof`, `type`, `key`, `ref`, `props` 등등 해당 컴포넌트에 대한 정보가 담긴 객체를 볼 수 있습니다.

```js {2}
{
  $$typeof: Symbol(react.element),
  type: ƒ App(),
  key: null,
  ref: null,
  props: {name: "ziho"},
  ...
}
```

`type`, `key`, `ref`, `props` 들은 React를 사용하는 사람이라면 익숙할텐데요.

`$$typeof: Symbol(react.element)`는 왜 있고, 어디에 쓰는 걸까요?

React팀에서 이 프로퍼티를 추가하게된 이유에 대해서 포스트를 써보려고 합니다. 😀

### 발단

2015년 React 팀은 Cross-Site Scripting (XSS)에 대한 [보안 이슈를 리포팅](http://danlec.com/blog/xss-via-a-spoofed-react-element) 받았습니다.
이 문제는 서버 사이드의 보안 구멍으로 인해 JSON 데이터가 예상치 못한 스크립트를 포함할 가능성이 있었습니다.

예를 들어, 다음과 같은 코드가 있을 때 XSS 공격에 취약한 상황이 발생할 수 있었습니다.

```jsx
// 서버 사이드에서 발생할 수 있는 보안 취약점을 가진 JSON
let expectedTextButGotJSON = {
  type: "div",
  props: {
    dangerouslySetInnerHTML: {
      __html: "/* 위협이 될 수 있는 코드 */",
    },
  },
  // ...
};

let message = { text: expectedTextButGotJSON };

<p>{message.text}</p>;
```

`message.text`가 문자열임을 기대하겠지만, 서버 사이드에서 문자열이 아닌 JSON으로 조작되었을 경우 문제가 발생할 수 있습니다.

### 해결방안

이 문제는 서버 사이드에서 발생할 수 있는 취약점이지만, React팀은 이 이슈를 해결하기로 결정했고, 이를 해결하기위해 `Symbol`을 활용합니다.

React Element 객체에 `$$typeof` 프로퍼티를 추가했고, `$$typeof`의 값이 `Symbol.for(react.element)`와 동일한지를 확인합니다. 만약 그렇지 않은 경우에는 렌더링을 하지 않도록 처리하였습니다.

[해당 PR](https://github.com/facebook/react/pull/4832)

서버에서 텍스트 대신 JSON을 반환하는 경우가 발생했더라도 JSON은 JS 문법인 `Symbol` 타입을 포함할 수 없기 때문에, XSS 공격으로부터 보호할 수 있게 되었습니다.

```js /Symbol.for("react.element")/ /0xeac7/
var TYPE_SYMBOL =
  (typeof Symbol === "function" && Symbol.for && Symbol.for("react.element")) ||
  0xeac7;

var ReactElement = function (type, key, ref, self, source, owner, props) {
  var element = {
    // This tag allow us to uniquely identify this as a React Element
    $$typeof: TYPE_SYMBOL,
    props: props,
    // ...
  };
  // ...
};

ReactElement.isValidElement = function (object) {
  return (
    typeof object === "object" &&
    object !== null &&
    object.$$typeof === TYPE_SYMBOL
  );
};
```

위 코드 스니펫에 있는 `0xeac7`은 [`Symbol` 문법을 지원하지 않는 브라우저 환경](https://caniuse.com/?search=Symbol.for)을 위한 폴백(fallback)으로 설정된 값입니다. 이 고정값은 XSS 공격에 여전히 취약합니다. 하지만 React 팀은 이를 위해 더 복잡한 방법을 고안해낼 수 있지만 이런 행위가 적절한 트레이드오프인지를 따졌을 때, 그렇지 않다고 생각한 것 같습니다.
그래서 `Symbol` 문법을 지원하지 않는 브라우저 환경에서 필요하다면 `Symbol polyfill`을 사용하기를 권장하고 있습니다.

(`0xeac7` 은 React와 비슷하게 생겨서 사용했다고 합니다. ~~개발자감성😂~~)

이런 히스토리를 알게 되면서 React에서 `innerHTML`을 굳이 `dangerouslySetInnerHTML` 로 위험성을 명시하는 이유에 대해 공감할 수 있게 되었습니다.

---

프레임워크(라이브러리)에서의 이런 XSS 공격에 대한 예방이 있을지라도, `innerHTML`을 쓸 경우에는 사용하는 개발자가 XSS 공격에 대한 주의를 할 필요가 있습니다.

그렇다면 `innerHTML`을 사용하는 경우, XSS 공격을 방지하기 위한 방법은 무엇일까요?

다음 두 가지 방법을 고려해 볼 수 있습니다:

1. **써드파티 라이브러리 사용**:

가장 대표적인 [`DOMPurify`](https://github.com/cure53/DOMPurify) 라이브러리를 살펴보겠습니다. `sanitize` 메서드를 이용해 HTML 문자열을 첫 번째 파라미터로 받아 위협이 될 수 있는 코드를 제거하여 반환합니다.

```js
DOMPurify.sanitize("<img src=x onerror=alert(1)//>");
// <img src="x">로 변환됨

DOMPurify.sanitize("<svg><g/onload=alert(2)//<p>");
// <svg><g></g></svg>로 변환됨
```

실사용에 적용된 예시로는 Visual Studio Code의 마크다운 렌더링에 이 DOMPurify를 사용하고 있는걸 확인할 수 있습니다.:

[마이크로소프트 GitHub - markdownRenderer.ts](https://github.com/microsoft/vscode/blob/4b9608ccceba9fee3d5ceb5f76e0b728d7a05068/src/vs/base/browser/markdownRenderer.ts#L5)

2. **네이티브 API인 Sanitizer API 사용**:

이 API는 써드파티 라이브러리로 해결할 수 없는 [잠재적인 위협에 대응하기 위해](https://github.com/WICG/sanitizer-api#taking-a-step-back-the-problem-were-solving) 개발되었으나, 아직 실험 단계이며, 지원하는 브라우저가 제한적입니다.

[지원하는 브라우저](https://caniuse.com/mdn-api_sanitizer)를 보면, 해당 API를 쓰기엔 아직 시기상조라는 생각이 들고, 정식 스펙이 될 수 있을지도 잘 모르겠습니다.

[Sanitizer API](https://wicg.github.io/sanitizer-api/)

---

최근에 React에서 `innerHTML`을 사용해야하는 상황이라 XSS에 관해 찾아보면서 React가 XSS 공격에 대응하기 위해 어떤 식으로 문제를 해결했는지 알 수 있었습니다.

그리고 React뿐만 아니라 Angular, Vue, Svelte, Next.js 같은 프레임워크들도 XSS 공격에 대응하는 PR들을 깃허브에서 쉽게 발견할 수 있었고, 다양한 방식으로 공격에 대응하는 모습을 확인할 수 있었습니다.
