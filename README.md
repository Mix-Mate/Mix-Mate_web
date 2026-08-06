 ## 👨‍💻 Team

|                                                            FE                                                            |                                                           FE                                                            |                                                             FE                                                              |                                                          FE                                                           |                                                          BE                                                           |                                                        BE                                                         |
| :-----------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------: |
| <img src="https://avatars.githubusercontent.com/Koo134o" height="100"/> <br> [고민경](https://github.com/Koo134o) | <img src="https://avatars.githubusercontent.com/moonchanju" height="100"/> <br> [문찬주](https://github.com/moonchanju) | <img src="https://avatars.githubusercontent.com/pdar124" height="100"/> <br> [박다래](https://github.com/pdar124) | <img src="https://avatars.githubusercontent.com/BaekSeungBin" height="100"/> <br> [백승빈](https://github.com/BaekSeungBin) | <img src="https://avatars.githubusercontent.com/KDWorld81" height="100"/> <br> 👑[곽동욱](https://github.com/KDWorld81)👑 | <img src="https://avatars.githubusercontent.com/meoooogus" height="100"/> <br> [김대현](https://github.com/meoooogus) |

---
## 🛠 Tech Stack

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

---

## 📁 프로젝트 구조

```text
src/
├── app/                           # Next.js App Router 페이지 및 라우팅
│   ├── (auth)/                    # 인증 관련 라우트 그룹
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/                    # 메인 서비스 라우트 그룹
│   │   └── home/
│   ├── groups/
│   │   ├── create/                # 그룹 생성
│   │   ├── join/                  # 참여 코드로 그룹 입장
│   │   └── [groupId]/             # 그룹별 동적 라우트
│   │       ├── home/               # 그룹 홈
│   │       ├── profile/
│   │       │   ├── setup/          # 그룹별 추가 정보 입력
│   │       │   └── edit/           # 프로필 수정
│   │       ├── participants/
│   │       │   └── [participantId]/ # 참여자 상세
│   │       ├── team/               # 내 조 및 같은 조 조회
│   │       ├── history/            # 이전 조 기록
│   │       ├── votes/
│   │       │   ├── mvp/            # MVP 투표
│   │       │   ├── attendance/     # 2차 참여 여부 투표
│   │       │   ├── status/         # 투표 진행 현황
│   │       │   └── result/         # 투표 결과
│   │       ├── completed/           # 행사 종료 화면
│   │       └── admin/               # 관리자 전용 라우트
│   │           ├── preparation/     # 그룹 준비
│   │           ├── participants/
│   │           │   └── new/         # 참여자 추가
│   │           ├── assignments/
│   │           │   └── [round]/     # 차수별 조 편성
│   │           │       ├── setup/
│   │           │       ├── fixed-members/
│   │           │       ├── processing/
│   │           │       └── result/
│   │           ├── session/
│   │           │   └── [round]/     # 차수별 술자리 진행
│   │           ├── progress/        # 행사 진행 현황
│   │           ├── votes/
│   │           │   └── end/         # 투표 종료
│   │           └── round-2/
│   │               └── preparation/ # 2차 준비
│   └── forbidden/                   # 접근 권한 없음
│
├── screens/                         # 페이지 단위 화면 컴포넌트
│   ├── admin/
│   ├── common/
│   ├── user/
│   └── error/
│
├── modals/                          # 역할별 모달 컴포넌트
│   ├── admin/
│   ├── common/
│   └── user/
│
├── features/                        # 도메인별 기능 모듈
│   ├── auth/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   └── types/
│   ├── group/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   └── types/
│   ├── profile/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   └── types/
│   ├── participant/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   └── types/
│   ├── assignment/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── model/
│   │   ├── schemas/
│   │   └── types/
│   ├── session/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types/
│   ├── team/
│   │   ├── api/
│   │   ├── components/
│   │   └── hooks/
│   ├── play/
│   │   ├── api/
│   │   ├── components/
│   │   └── hooks/
│   ├── vote/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── attendance/
│   │   │   ├── mvp/
│   │   │   ├── result/
│   │   │   └── status/
│   │   ├── hooks/
│   │   ├── model/
│   │   ├── schemas/
│   │   └── types/
│   ├── history/
│   │   ├── api/
│   │   ├── components/
│   │   └── hooks/
│   └── completion/
│       ├── components/
│       └── hooks/
│
└── shared/                          # 여러 기능에서 공통으로 사용하는 모듈
    ├── api/
    ├── config/
    ├── constants/
    ├── hooks/
    ├── lib/
    │   ├── auth/
    │   ├── navigation/
    │   └── format/
    ├── types/
    └── ui/
```

### 디렉터리 구성 원칙

* `app`: URL 경로, 페이지, 레이아웃 등 라우팅을 관리합니다.
* `screens`: 여러 기능 컴포넌트를 조합한 페이지 단위 화면을 관리합니다.
* `modals`: 관리자, 사용자, 공통 모달을 역할별로 관리합니다.
* `features`: 인증, 그룹, 조 편성, 투표 등 도메인별 기능을 관리합니다.
* `shared`: 특정 기능에 종속되지 않고 프로젝트 전체에서 재사용되는 코드와 UI를 관리합니다.

---

## 📝 Commit Message Convention

커밋 메시지는 다음 형식을 사용합니다.

```text
타입: 작업 내용
```

### 작성 예시

| 타입         | 설명                         |
| ---------- | -------------------------- |
| `feat`     | 새로운 기능 추가                  |
| `fix`      | 버그 수정                      |
| `docs`     | README, 기능 명세서 등 문서 수정     |
| `style`    | 코드 동작에 영향을 주지 않는 코드 스타일 수정 |
| `refactor` | 기능 변경 없이 코드 구조 개선          |
| `test`     | 테스트 코드 추가 또는 수정            |
| `chore`    | 패키지, 빌드 설정, 개발 환경 등 기타 작업  |
| `remove`   | 파일, 폴더 또는 불필요한 코드 삭제       |


