# MixMate
<img width="100%" alt="표지" src="https://github.com/user-attachments/assets/5e707b57-3ea8-41de-937f-35d1ed19365b" />


 [📎MixMate URL](https://mix-mate-web.vercel.app/
)

> MixMate는 참가자 모집과 자동 조 편성, 술게임·대화 주제 추천, MVP·2차 참여 투표를 하나의 흐름으로 연결하는 모임 운영 서비스입니다.   
운영자는 모임의 진행을 관리하고, 참가자는 자신의 조와 다음 활동을 확인하며 자연스럽게 어울릴 수 있습니다.  
 <br/>
 
## 서비스 소개
<img width="100%" alt="README • About MixMate" src="https://github.com/user-attachments/assets/b3058c84-402f-4b8e-ab49-9d6b75bba6d2" />


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

## 주요 기능

## 서비스 이용 흐름

<img width="100%" alt="README • User Flow" src="https://github.com/user-attachments/assets/c56e5577-086c-436c-bed2-85ccefae39cf" />

---

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

