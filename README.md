# MixMate
<img width="100%" alt="첫 번째 이미지_표지" src="https://github.com/user-attachments/assets/67491883-0ec6-4086-ac86-89e6e02397f9" />


 [📎MixMate URL](https://mix-mate-web.vercel.app/
)

> MixMate는 참가자 모집과 자동 조 편성, 술게임·대화 주제 추천, MVP·2차 참여 투표를 하나의 흐름으로 연결하는 모임 운영 서비스입니다.
운영자는 모임의 진행을 관리하고, 참가자는 자신의 조와 다음 활동을 확인하며 자연스럽게 어울릴 수 있습니다.


## 🍻 About MixMate

여러 사람이 함께하는 모임에서는 참가자 정보를 모으고, 조를 나누고, 다음 일정의 참여 여부를 확인하는 일이 반복됩니다.  
운영자는 명단과 진행 상황을 관리해야 하고, 처음 만난 참가자들은 대화를 시작할 계기가 필요합니다. 

MixMate는 참여 코드로 참가자를 모으고, 참가자 특성을 고려할 수 있는 조 편성 조건을 제공합니다.  
조 편성 이후에는 같은 조의 멤버 확인과 술 게임·대화 주제 탐색, MVP 선정과 2차 참여 조사까지 이어지도록 구성했습니다. 

모집, 준비, 진행, 투표, 종료 상태에 맞춰 화면과 운영 기능을 연결해 모임의 다음 단계를 안내합니다.

## 📱 Preview

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
        <!-- TODO: 그룹 생성 → 참여 코드 공유 → 참가자 프로필 등록 GIF -->
        <p>그룹을 만들고 참여 코드로 함께하기</p>
      </td>
      <td align="center" valign="top">
        <!-- TODO: 편성 조건 설정 → 결과 확정 → 내 조 확인 GIF -->
        <p>조를 편성하고 같은 조 멤버 확인하기</p>
      </td>
      <td align="center" valign="top">
        <!-- TODO: MVP 투표 → 2차 참여 투표 → 투표 마감 및 결과 GIF -->
        <p>모임의 MVP와 다음 일정 참여자 확인하기</p>
      </td>
    </tr>
  </tbody>
</table>

## ✨ 주요 기능

### 그룹 생성과 참여 코드 기반 참가

- 그룹 이름과 설명, HOST의 그룹 프로필을 입력해 모임을 생성합니다.
- 발급된 참여 코드를 복사해 공유할 수 있습니다.
- 참가자는 6자리 코드를 확인받고 그룹별 프로필을 등록해 참여합니다.
- 홈에서 진행 중인 모임과 완료된 모임을 구분해 확인합니다.

### 참가자 프로필과 명단 관리

- 이름, 소속, 학년, 성별, MBTI, 신입 여부, 직급 등 그룹별 정보를 설정합니다.
- 프로필 공개 여부와 선택 정보인 자기소개·인스타그램 ID를 등록할 수 있습니다.
- 참가자 이름 검색, 일반·운영진 필터, 전체·조별 명단 보기를 제공합니다.
- HOST는 참가자 수동 추가, 차단 및 차단 해제를 관리하고 참가자 구성 통계를 확인합니다.

### 조건을 선택하는 자동 조 편성

- 조 개수와 성별 균형, MBTI 균형, 학년 분산, 신입 여부 분산, 직급 분산 조건을 설정합니다.
- 1차 편성에서는 특정 참가자를 원하는 조에 고정할 수 있습니다.
- 서버에서 반환한 편성 결과와 경고를 확인하고, 재셔플하거나 결과를 확정합니다.
- 2차에는 참여 인원을 확인한 뒤 새로운 조 편성을 진행합니다.

### 내 조와 같은 조 멤버 확인

- 현재 회차에 배정된 조 번호와 같은 조 참가자를 확인합니다.
- 공개된 참가자 프로필을 열어 서로의 정보를 살펴볼 수 있습니다.
- 이전 조 기록 화면에서 1차에 함께했던 조와 멤버를 확인합니다.

### 술게임과 대화 주제 추천

- 술게임의 구성과 진행 방법을 확인하고 다른 게임으로 넘겨볼 수 있습니다.
- 학교생활, 취미, 여행, 음식 등 카테고리별 스몰토크 주제를 제공합니다.
- 두 가지 선택지를 제시하는 밸런스 게임 주제를 함께 살펴볼 수 있습니다.

### MVP · 2차 참여 투표

- 자신을 제외한 1차 같은 조 멤버 중 MVP를 선택합니다.
- MVP 투표에 이어 2차 참여 또는 불참 의사를 제출합니다.
- 2차 참여·불참·미투표 현황과 투표 완료 인원을 확인합니다.
- HOST는 수동 등록 참가자의 2차 참여 의사를 대신 입력하거나 정정하고, 전체 투표를 마감할 수 있습니다.
- 결과 화면에서 우리 조 MVP 공개 연출과 전체 MVP 결과를 확인합니다.

### HOST의 모임 진행 관리

- 참가자 모집 마감, 조 편성 확정, 1차 종료와 투표 시작을 관리합니다.
- 투표 마감 후 2차 진행 여부를 결정합니다.
- 2차를 진행하면 조 편성을 다시 확정하고, 모임 종료까지 관리합니다.

---

## 서비스 이용 흐름

<img width="100%" alt="README • User Flow" src="https://github.com/user-attachments/assets/c56e5577-086c-436c-bed2-85ccefae39cf" />

2차 참여자는 HOST의 진행 결정과 조 편성을 기다린 뒤 새 조를 확인합니다. 2차 불참자는 진행 중인 모임의 대기 안내를 받으며, 모임 종료 후 완료된 모임에서 종료 화면을 확인할 수 있습니다.


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

라우트 연결은 `app`, 화면 조합은 `screens`, 기능별 로직은 `features`에 배치합니다. 공통 UI와 유틸리티는 `shared`에서 재사용하며, 테스트는 관련 소스 가까이에 배치합니다.

## 🗺 Routes

`[groupId]`는 그룹 ID이며, 조 편성 경로의 `[round]`에는 `1` 또는 `2`를 사용합니다.

| Route | 설명 |
| --- | --- |
| `/login`, `/signup` | 로그인과 이메일 인증 기반 회원가입 |
| `/home` | 진행 중·완료된 모임 목록 |
| `/groups/create`, `/groups/create/extra` | 그룹 정보와 HOST 프로필 입력 |
| `/groups/join`, `/groups/[groupId]/extra` | 참여 코드 확인과 참가자 프로필 등록 |
| `/groups/[groupId]` | 역할·진행 상태에 따른 그룹 홈 |
| `/groups/[groupId]/participants` | 참가자 명단과 조별 보기 |
| `/groups/[groupId]/team` | 내 조와 같은 조 멤버 확인 |
| `/groups/[groupId]/play` | 술게임·스몰토크·밸런스 게임 메뉴 |
| `/groups/[groupId]/votes/mvp`, `/groups/[groupId]/votes/attendance` | MVP와 2차 참여 투표 |
| `/groups/[groupId]/votes/status`, `/groups/[groupId]/votes/result` | 투표 현황과 결과 |
| `/groups/[groupId]/admin/recruitment` | 참여 코드 공유와 모집 관리 |
| `/groups/[groupId]/admin/assignments/[round]/setup` | 회차별 조 편성 설정 |
| `/groups/[groupId]/admin/progress` | 모임 진행 현황과 회차 종료 |
| `/groups/[groupId]/completed` | 모임 종료 화면 |

## 🚀 Getting Started

### 실행 환경

- Node.js 24.x
- npm
- 인증·그룹·조 편성·투표 API를 제공하는 백엔드 서버

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

### 정적 검사 및 테스트

```bash
npm run lint
npm run test
```

GitHub Actions는 `main`, `dev` 브랜치의 Push와 Pull Request에서 의존성 설치, lint, test, build를 실행하도록 구성되어 있습니다.


 ## 👨‍💻 Team

|                                                            FE                                                            |                                                           FE                                                            |                                                             FE                                                              |                                                          FE                                                           |                                                          BE                                                           |                                                        BE                                                         |
| :-----------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------: |
| <img src="https://avatars.githubusercontent.com/Koo134o" height="100"/> <br> [고민경](https://github.com/Koo134o) | <img src="https://avatars.githubusercontent.com/moonchanju" height="100"/> <br> [문찬주](https://github.com/moonchanju) | <img src="https://avatars.githubusercontent.com/pdar124" height="100"/> <br> [박다래](https://github.com/pdar124) | <img src="https://avatars.githubusercontent.com/BaekSeungBin" height="100"/> <br> [백승빈](https://github.com/BaekSeungBin) | <img src="https://avatars.githubusercontent.com/KDWorld81" height="100"/> <br> 👑[곽동욱](https://github.com/KDWorld81)👑 | <img src="https://avatars.githubusercontent.com/meoooogus" height="100"/> <br> [김대현](https://github.com/meoooogus) |

---
- **FE 1 고민경**
  - 로그인·회원가입 등 인증 기능
  - 메인 홈, 그룹 생성
  - 입장 추가 정보 입력
- **FE 2 백승빈**
    - 참가자 목록 및 관리
    - 참가자 등록·상세 조회
    - 프로필 조회 및 수정
    - 정보 공개 범위 처리
- **FE 3 문찬주**
    - 조 편성 설정 배치 조건 및 고정 멤버 설정
    - 자동 배치·재셔플
    - 조 편성 결과 확정
    - 반응형 css
- **FE 4 박다래**
    - 사용자 홈
    - 나몇조 및 조원 확인
    - 술게임·스몰토크·밸런스 게임
    - MVP·2차 참여 투표 및 결과·현황
