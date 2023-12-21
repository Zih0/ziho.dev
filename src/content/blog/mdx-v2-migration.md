---
author: ziho
pubDatetime: 2023-12-21T07:25:25.726Z
title: MDX v2 마이그레이션
postSlug: react-xss
featured: true
draft: false
tags:
  - MDX
  - Migration
description: MDX v1에서 v2로 마이그레이션하면서 겪은 트러블 슈팅 소개
---

MDX v2가 나온지 2년 가까이 됐고, 얼마 전에 v3가 나온 시점에서 v1 → v2 마이그레이션 글을 올린 이유는
MDX v2는 Breaking Change가 매우 많습니다. 😭

도큐사우르스의 예를 보시면 더 이해가 빠르실거에요.
도큐사우르스팀은 **2021년 1월**에 [MDX v2 마이그레이션을 계획](https://github.com/facebook/docusaurus/issues/4029)했습니다. 하지만 **2022년 4월**이 되어서야 [마이그레이션 PR](https://github.com/facebook/docusaurus/pull/8288)이 머지가 되었습니다.
그리고 MDX v2는 도큐사우르스 v3부터 적용될 예정이었는데 v3 릴리즈 일주일 전(2023년 10월 24일)에 [MDX v3](https://mdxjs.com/blog/v3/)가 나왔습니다. 하지만 v3는 BC가 적었기 때문에 도큐사우르스팀은 2일만에 PR을 올렸고, 2023년 10월 31일 도큐사우르스 v3가 릴리즈 되었습니다.

저 또한 v2로 마이그레이션 하는 과정에서 트러블슈팅을 많이 겪어서 이를 글로 남겨두려고 합니다.

—

MDX v2의 장점

MDX v2는 v2에 비해 뭐가 좋아졌는지 알아볼게요

1. MDX의 문법이 좀 더 사용하기 편하게 변했습니다.

- v1에서는 마크다운 문법과 JSX 문법을 혼용해서 쓰면 예상치 못한 사이드이펙트가 있었지만, 이제는 JSX 사이에 마크다운 문법이 있어도 유저가 의도한대로 동작합니다.

```jsx
<div>*hi*?</div>
<div> 
 # hi? 
</div>


// v1 파싱 결과

<>
 <div>*hi*?</div>
 <div>
  # hi? 
 </div>
</>


// v2 파싱 결과

<> 
 <div><em>hi</em>?</div> 
 <div> 
  <h1>hi?</h1> 
 </div>
</>
```

2. 다양한 번들러 및 프레임워크 지원

- v1은 Babel, Webpack, React에 국한되어 MDX를 사용할 수 있었습니다.
- v2에선 rollup, esbuild에서도 mdx를 컴파일 할 수 있게 되었고, 이제는 React뿐 만아니라 JSX를 지원하는 vue, preact에서도 MDX를 사용할 수 있게 되었습니다.

3. 새로운 아키텍쳐 도입

- 위 2번에서 말한 Webpack, Babel, React의 과한 의존성을 제거하고자 새로운 아키텍쳐를 도입했습니다.
- 그리고 새로운 구조의 AST(Abstract Syntax Tree)를 도입합니다. 새로운 AST로 인해 MDX용 remark 플러그인을 만들기 훨씬 편리해졌습니다.
- 새로운 아키텍쳐의 도입으로 컴파일 속도도 빨라졌고, 번들링 사이즈도 훨씬 작아졌습니다.
- 그리고 이제는 컴파일 단계에서 에러를 감지할 수 있게 되었습니다. 기존에 오타나 문법 오류가 있을 때에는 알아차리기 어려웠는데 이제는 바로 에러를 감지할 수 있어 편리해졌습니다.

4. 타입스크립트

- `@mdx-js/*` 패키지들 모두 타입을 지원하게 되었습니다.

—

마이그레이션

새로운 아키텍쳐의 도입, 그리고 unified, MDX 생태계는 ESM Only로 변경이 되었습니다.

이에 맞춰서 마이그레이션을 해줘야하는데, 제가 마주한 트러블 슈팅을 적어볼게요.

변경된 MDAST에 맞추어 remark 플러그인 수정

AST 노드가 변경되었기에 과거의 방식으로 구현된 플러그인을 수정해야했습니다.
v2로 변경되고 remark 플러그인을 만들기 훨씬 수월해졌습니다.

아래와 같이 사용되는 MDX 파일이 있다고 가정해보겠습니다.

```jsx
<Component>
 - foo
 - bar
 - baz
</Component>
<Component>
 - foo
 - bar
 - baz
</Component>
// ...
```

여기서 `foo`, `bar`, `baz` 에 접근하려면 remark 플러그인을 어떻게 작성해야할까요?

MDX v1 방식부터 보여드릴게요.

```js
import { visit } from 'unist-util-visit' 

visit(
 tree, 
 node => {
  if (node.type !== 'jsx') {
   return false;
  }
  return node.value === `Component`; // props가 없다는 가정
 },
 (_, startNodeIndex, parent) => {
  const endNodeIndex = parent.children.findIndex((child, currIndex) => {
  return ( 
   currIndex > startNodeIndex && 
   child.type === `jsx` && 
   child.value === `</Component>`
   ); 
  });
 
  parent.children.slice(startNodeIndex, endNodeIndex).forEach(node => {
   // 해당 list item node를 활용한 로직
  })
 }
)
```

Node의 index를 활용해서 `<Component>` Node보다 index가 크고, `</Component>` Node보다 index가 작은 Node들을 찾아야했습니다. index로 로직을 처리하다보니, 위와 같이 단순한 예시가 아니라 복잡한 경우 로직을 이해하기도 힘들고 수정도 쉽지 않습니다.

MDX v2에선 어떻게 작성할 수 있는지 알아보겠습니다.

```js
import { visit } from 'unist-util-visit' 

visit(
 tree,
 node => { 
 if (node.type !== `mdxJsxFlowElement`) { 
  
  return false; 
 }
 
 return node.name === `Component`; 
 },
 (node) => {
  node.children.forEach((childrenNode, index) => {
   // 해당 list item node를 활용한 로직
  }
 }
)
```

기존에는 `<Component>`와 `</Component>` 는 서로 다른 Node였던 반면, 이제는 `<Component></Component>` 는 한 Node가 되었습니다 🙌

그로 인해 이제 Component 내부에 있는 Node들을 children으로 조회가 가능해졌고, 이에 따라 플러그인을 만들기 훨씬 수월해졌습니다.

그리고 `mdxJsxFlowElement`, `mdxJsxTextElement`, `mdxJsxAttribute`, `mdxjsEsm` 등 새로운 Node type이 추가되었는데 자세한 내용은 [mdast-util-mdx-jsx](https://github.com/syntax-tree/mdast-util-mdx-jsx) 에서 확인할 수 있습니다.

변경된 HAST에 맞춰 rehype 플러그인 수정

코드블록의 메타데이터를 처리하는 방식이 달라졌습니다.

아래 같은 코드블록이 있을 때,

````mdx

```javascript title=테스트 theme=dark
console.log('!');
```

````

v1 에서는 properties에 메타데이터 `title`과 `theme`이 들어가있었습니다.

```
{ "type": "element", "tagName": "pre", "properties": {}, "children": [ { "type": "element", "tagName": "code", "properties": { "className": "language-javascript", "metastring": "title=테스트 theme=dark", "title": "테스트", "theme": "dark" }, "children": [ { "type": "text", "value": "console.log('!');\n" } ], } ], }
```

하지만 v2에서는 `data.meta` 에 string으로만 나오게 되었습니다.

```
{ "type": "element", "tagName": "pre", "properties": {}, "children": [ { "type": "element", "tagName": "code", "properties": { "className": [ "language-javascript" ] }, "children": [ { "type": "text", "value": "console.log('!');\n" } ], "data": { "meta": "title=테스트 theme=dark" } } ] }
```

이에 대한 내용은 [공식문서](https://mdxjs.com/guides/syntax-highlighting/#syntax-highlighting-with-the-meta-field)에 적혀 있어서 `rehype-mdx-code-props` 플러그인을 설치하여 해결해주었습니다.

mdast-util-toc

기존에는 JSX 컴포넌트 안에 헤더가 있을 경우, `mdast-util-toc` 에서 인식이 가능했습니다. (mdast-util-toc를 사용하는 remark-toc에서도 동일)

```
<Something> 

 # Heading 

</Something>
```

이전에는 `<Something>`, `#Heading` `</Something>` 이 모두 같은 위계의 Node였기 때문에 문제 없이 헤딩을 가져올 수 있었습니다.

하지만 AST가 변경된 이후에, JSX 컴포넌트 안에 있는 헤딩은 포함이 안되는 문제가 발생했습니다.
`mdast-util-toc` 의 [position에 대한 로직](https://github.com/syntax-tree/mdast-util-toc/blob/main/lib/search.js#L105)으로 인해 처리를 안하는 것을 확인할 수 있었고,
코드를 그대로 가져와 순회하는 영역만 원하는대로 수정하여 해결했습니다.

갑자기 table이 안돼요

mdx v2 이후부터 `remark-gfm`이 default가 아니게 되었습니다. remark-gfm@3.0.1을 설치해줍니다.
( + `next-mdx-remote`를 사용중이라면 `remark-gfm@4` 간에 [이슈](https://github.com/hashicorp/next-mdx-remote/issues/403)가 존재하여 v3을 설치해야합니다.)

ReferenceError (JS 표현식 문법)

기존에 MDX에서 `{something}`이 들어간 문구를 썼다면 변경해주어야 합니다.
왜냐하면 MDX v2부터는 `{}` 를 JSX처럼 JS 표현식으로 인식하여 `something`을 변수로 받아들이기 때문입니다.

HTML 주석 문제

```
<!-- Comment -->
```

MDX v2 이후, MDX에 HTML의 주석 사용을 막아놨습니다. 그 이유는 MDX는 JSX의 동작방식에 더 가까워지게 하기위한 메인테이너의 철학이 녹아져있습니다..
그래서 MDX에서 주석을 처리하고 싶다면 JSX의 주석처럼 `{/* 주석 */}` 방식을 사용해야 합니다.

이번 버전업에선 MDX 파일에서의 수정을 최소화하고자, `remark-comment` 라는 플러그인을 설치해 HTML 주석을 제거하도록 했습니다.

추후에는 MDX 파일에서 HTML 주석 문법을 JSX 주석 문법으로 수정할 생각입니다.

esm only 라이브러리로 변경됨에 따라 jest 에서 에러 발생

[jest ECMASCript Modules](https://jestjs.io/docs/ecmascript-modules)에 설명되어있지만, 해결이 잘 되지 않아 [이 이슈](https://github.com/nrwl/nx/issues/812#issuecomment-429488470)를 참고하여 jest config에 `transformIgnorePatterns` 에 ESM Only 모듈을 적용해주었습니다.

prettier

prettier v2.5.0보다 낮은 버전을 쓰는 경우
prettier v2.5.0보다 낮은 버전을 쓰고 있다면 MDX에서 아래 방식을 자동으로 포맷팅해서 주석 처리가 정상적으로 동작하지 않습니다.

```
// as-is 
{/* 주석 */} 

// to-be formatted 
{_/ 주석 /_}
```

그래서 prettier [v2.5.0](https://prettier.io/blog/2021/11/25/2.5.0.html) 이상으로 버전업을 해야합니다.

그리고 prettier에서 MDX의 포맷팅에 대한 [이슈](https://github.com/prettier/prettier/issues/12209)가 계속 제기되고 있는데 1년째 해결되지 않고 있습니다. 🥲

MDX의 컨트리뷰터인 woorm은 `remark-cli` + `remark-mdx` 조합을 사용하길 [권장](https://github.com/orgs/mdx-js/discussions/2067)하고 있습니다.

—

BC가 많아 역시 트러블슈팅이 많았습니다.

마이그레이션을 하면서 [도큐사우르스](https://github.com/facebook/docusaurus/discussions/9053) 를 많이 참고했는데요.
1년이 넘는 긴 마이그레이션 여정이 얼마나 힘들었는지 알 수 있고, 정말 다양한 트러블 슈팅이 녹아져있으니 관심이 있으신 분은 도큐사우르스의 PR을 한번 봐보시는걸 추천드립니다.

---

Reference

<https://mdxjs.com/blog/v2>
<https://mdxjs.com/migrating/v2/>
<https://github.com/facebook/docusaurus/issues/4029>
<https://github.com/facebook/docusaurus/pull/8288>
<https://github.com/facebook/docusaurus/discussions/9053>
