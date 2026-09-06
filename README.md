# MixMate
<img width="100%" alt="표지" src="https://github.com/user-attachments/assets/5e707b57-3ea8-41de-937f-35d1ed19365b" />


 [📎MixMate URL](https://mix-mate-web.vercel.app/
)

> MixMate는 참가자 모집과 자동 조 편성, 술게임·대화 주제 추천, MVP·2차 참여 투표를 하나의 흐름으로 연결하는 모임 운영 서비스입니다.   
운영자는 모임의 진행을 관리하고, 참가자는 자신의 조와 다음 활동을 확인하며 자연스럽게 어울릴 수 있습니다.  
 <br/>

현재 학생들을 상대로 실사용 운영중입니다.

실사용 운영 및 유지보수 : 2026.09.05 ~  

![Next.js](https://img.shields.io/badge/Next.js-16.2.11-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=000000)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![CSS Modules](https://img.shields.io/badge/CSS%20Modules-000000?logo=cssmodules&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?logo=nodedotjs&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)

## 서비스 소개
<img width="100%" alt="README • About MixMate" src="https://github.com/user-attachments/assets/b3058c84-402f-4b8e-ab49-9d6b75bba6d2" />


## Preview

<table>
  <thead>
    <tr>
      <th width="33%">그룹 생성 및 참가</th>
      <th width="33%">조 편성 및 모임 진행</th>
      <th width="33%">MVP · 2차 참여 투표</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center" valign="top">
        <img width="70%" alt="GIF1" src="https://github.com/user-attachments/assets/9583ca31-b780-457c-a992-da6648e61b27" />
        <p>그룹을 만들고 참여 코드로 함께하기</p>
      </td>
      <td align="center" valign="top">
       <img width="70%" height="742" alt="GIF2" src="https://github.com/user-attachments/assets/3123033f-55fa-441c-b9aa-dde4399c5a59" />
        <p>조를 편성하고 같은 조 멤버 확인하기</p>
      </td>
      <td align="center" valign="top">
        <img width="70%" alt="GIF3" src="https://github.com/user-attachments/assets/3f549f6b-2cf5-4c9e-87cf-799dbc7e150f" />
        <p>모임의 MVP와 다음 일정 참여자 확인하기</p>
      </td>
    </tr>
  </tbody>
</table>

## 주요 기능
<img width="100%" alt="README • Key Features 4" src="https://github.com/user-attachments/assets/7559697d-76df-4c69-8dce-54f6f5faf7ba" />
<img width="100%" alt="README • Key Features 5" src="https://github.com/user-attachments/assets/362da093-c4c1-484f-8182-33ea175edec1" />

## 서비스 이용 흐름

<img width="100%" alt="README • User Flow" src="https://github.com/user-attachments/assets/c56e5577-086c-436c-bed2-85ccefae39cf" />

---

## 🏗️ Architecture
<img width="70%" alt="Architecture" src="https://github.com/user-attachments/assets/8cffacdb-31d9-49ce-a3a6-82681820ded2" />

## 🛠 Tech Stack

| 구분 | 기술 및 사용 방식 |
| --- | --- |
| Frontend | Next.js 16.2.11 App Router, React 19.2.4, TypeScript |
| State / Data | React Context, Custom Hooks, `useSyncExternalStore`, 브라우저 저장소, 조 편성 임시 데이터용 메모리 `Map` |
| Form / Validation | Zod, React Hook Form, `@hookform/resolvers` |
| UI / Styling | CSS Modules, CSS 변수, clsx, Lucide React |
| Network | Fetch API, SSE, `@microsoft/fetch-event-source` |
| Animation | CSS Keyframes, SVG, `requestAnimationFrame` |
| Testing / Quality | Vitest, React Testing Library, jest-dom, jsdom, ESLint |
| Runtime / Package Manager | Node.js 24.x, npm |
| Deployment | Vercel용 Next.js 프레임워크 설정 |
| Collaboration / CI | GitHub PR 템플릿, GitHub Actions |

공통 `MobileFrame`과 CSS 변수로 모바일 화면 크기를 관리하며, 좁은 화면에서는 동적 뷰포트 단위와 안전 영역 여백을 적용합니다. 로고, 내 조 공개, MVP 결과 등에는 CSS·SVG 기반 연출을 사용합니다.


## 📂 Project Structure

```text
mix-mate-web/
├── public/
│   ├── icons/                  # 로고와 참가자 아이콘
│   └── images/vote/            # MVP 결과 화면 이미지
├── src/
│   ├── app/                    # App Router 페이지와 레이아웃
│   ├── screens/                # 페이지 단위 화면 구성
│   │   ├── admin/              # 모집·참가자 관리·조 편성·진행 관리
│   │   ├── common/             # 인증·명단·프로필·투표 등
│   │   ├── group/              # 그룹 생성·참가·추가 정보 입력
│   │   ├── mypage/             # 마이페이지
│   │   └── user/               # 그룹 홈과 놀이 화면
│   ├── features/               # 기능별 API·Hook·타입·컴포넌트
│   │   ├── auth/               # 인증과 이메일 확인
│   │   ├── group/              # 그룹 정보·상태·SSE
│   │   ├── participant/        # 참가자 명단·관리·통계
│   │   ├── profile/            # 그룹별 프로필
│   │   ├── blacklist/          # 참가자 차단·해제
│   │   ├── assignment/         # 조 편성 설정·요청·임시 결과
│   │   ├── team/               # 내 조와 조원 조회
│   │   ├── history/            # 이전 1차 조 기록
│   │   ├── play/               # 게임·대화 주제 데이터
│   │   ├── session/            # 모임 화면 상태와 접근 제어
│   │   └── vote/               # MVP·2차 참여 투표와 결과
│   ├── modals/                 # 관리자·참가자 다이얼로그
│   └── shared/
│       ├── api/                # API 기본 주소와 인증 토큰 유틸리티
│       ├── assets/             # 공통 화면 이미지
│       ├── hooks/              # Mutation·Toast 공통 Hook
│       ├── lib/navigation/     # 라우트·쿼리·히스토리 유틸리티
│       ├── types/              # 공통 타입
│       └── ui/                 # 공통 UI와 스타일 토큰
├── .github/workflows/ci.yml    # lint·test·build
├── next.config.ts
├── vitest.config.ts
└── vercel.json
```

## 실행 방법

### 의존성 설치

`package.json`이 있는 `mix-mate-web` 디렉터리에서 실행합니다.

```bash
npm ci
```

### 환경변수

프로젝트 루트의 `.env.local`에 연결할 백엔드의 기본 주소를 설정합니다.

```env
NEXT_PUBLIC_API_BASE_URL=
```

빈 값 대신 사용할 백엔드 주소를 입력해야 합니다. 인증 토큰이나 비밀 값은 이 항목에 넣지 않습니다.

### 개발 서버

```bash
npm run dev
```

### 빌드 및 실행

```bash
npm run build
npm run start
```

GitHub Actions는 `main`, `dev` 브랜치의 Push와 Pull Request에서 의존성 설치, lint, test, build를 실행하도록 구성되어 있습니다.


---

 ## 👨‍💻 Team

|                                                            FE                                                            |                                                           FE                                                            |                                                             FE                                                              |                                                          FE                                                           |                                                          BE                                                           |                                                        BE                                                         |
| :-----------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------: |
| <img src="https://avatars.githubusercontent.com/Koo134o" height="100"/> <br> [고민경](https://github.com/Koo134o) | <img src="https://avatars.githubusercontent.com/moonchanju" height="100"/> <br> [문찬주](https://github.com/moonchanju) | <img src="https://avatars.githubusercontent.com/pdar124" height="100"/> <br> [박다래](https://github.com/pdar124) | <img src="https://avatars.githubusercontent.com/BaekSeungBin" height="100"/> <br> [백승빈](https://github.com/BaekSeungBin) | <img src="https://avatars.githubusercontent.com/KDWorld81" height="100"/> <br> 👑[곽동욱](https://github.com/KDWorld81)👑 | <img src="https://avatars.githubusercontent.com/meoooogus" height="100"/> <br> [김대현](https://github.com/meoooogus) |


## 📝 브랜치 · 커밋 컨벤션

| **메시지 타입** | **설명**                                                    |
| --------------- | ----------------------------------------------------------- |
| **feat**        | ✨ 새로운 기능 추가 및 기존 기능 수정                       |
| **fix**         | 🐛 버그 수정                                                |
| **docs**        | 📚 문서 및 주석 수정                                        |
| **style**       | 🎨 코드 스타일 및 포맷팅 수정                               |
| **refact**      | ♻️ 기능 변화 없는 코드 리팩터링                             |
| **test**        | ✅ 테스트 코드 추가/수정                                    |
| **chore**       | 🔧 패키지 매니저 수정 및 기타 잡다한 변경(ex: `.gitignore`) |
