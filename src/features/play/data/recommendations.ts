import type {
  GameRecommendation,
  TopicCategoryId,
  TopicRecommendation,
} from "../types/play.types";

const gameRecommendations: GameRecommendation[] = [
  {
    id: "silent-shout",
    title: "고요 속의 외침",
    composition: [
      "출제자와 정답을 외치는 사람으로 구성해요",
      "팀별로 번갈아가며 진행해요",
    ],
    steps: [
      "제시어를 외치는 사람에게 보여줍니다",
      "이어폰을 끼고 최대한 크게 외칩니다",
      "맞히는 사람이 제시어를 확인하면 성공!",
    ],
  },
  {
    id: "initial-quiz",
    title: "초성 퀴즈",
    composition: [
      "한 명이 문제를 내고 나머지가 정답을 맞혀요",
      "정답을 맞힌 사람이 다음 문제를 출제해요",
    ],
    steps: [
      "출제자가 단어의 초성을 말합니다",
      "제한 시간 안에 정답을 외칩니다",
      "가장 먼저 맞힌 사람이 1점을 얻어요",
    ],
  },
  {
    id: "three-six-nine",
    title: "369 게임",
    composition: [
      "모든 조원이 둥글게 앉아 순서를 정해요",
      "실수한 사람부터 새로운 라운드를 시작해요",
    ],
    steps: [
      "한 명씩 차례대로 숫자를 말합니다",
      "3, 6, 9가 들어가면 숫자 대신 박수!",
      "박수 횟수나 순서를 틀리면 종료해요",
    ],
  },
  {
    id: "eye-contact",
    title: "눈치 게임",
    composition: [
      "모든 조원이 함께 참여해요",
      "정해진 순서 없이 눈치를 보며 진행해요",
    ],
    steps: [
      "한 명이 1을 외치며 게임을 시작합니다",
      "눈치를 보며 한 명씩 다음 숫자를 외칩니다",
      "두 명 이상 동시에 숫자를 외치면 실패!",
    ],
  },
  {
    id: "baskin-robbins-31",
    title: "배스킨라빈스 31",
    composition: [
      "모든 조원이 순서를 정해 참여해요",
      "한 번에 숫자를 1개부터 3개까지 말할 수 있어요",
    ],
    steps: [
      "1부터 차례대로 숫자를 이어서 말합니다",
      "자신의 차례에 최대 3개의 숫자를 말합니다",
      "31을 말한 사람이 패배해요",
    ],
  },
  {
    id: "same-answer",
    title: "이구동성",
    composition: [
      "두 명 이상이 한 팀이 되어 진행해요",
      "서로 상의하지 않고 동시에 대답해요",
    ],
    steps: [
      "한 명이 질문이나 주제를 제시합니다",
      "하나, 둘, 셋에 맞춰 동시에 답을 외칩니다",
      "같은 답을 외치면 성공!",
    ],
  },
  {
    id: "word-chain",
    title: "끝말잇기",
    composition: [
      "모든 조원이 순서를 정해 참여해요",
      "앞사람이 말한 단어의 마지막 글자를 이어가요",
    ],
    steps: [
      "첫 번째 사람이 단어를 하나 말합니다",
      "다음 사람이 마지막 글자로 시작하는 단어를 말합니다",
      "제한 시간 안에 대답하지 못하면 실패!",
    ],
  },
  {
    id: "forbidden-word",
    title: "금지어 게임",
    composition: [
      "각자 상대방의 금지어를 하나씩 정해요",
      "자연스럽게 대화하며 진행해요",
    ],
    steps: [
      "각 참가자에게 사용할 수 없는 금지어를 정합니다",
      "평소처럼 자유롭게 대화를 이어갑니다",
      "금지어를 말한 사람이 걸리면 실패!",
    ],
  },
  {
    id: "character-quiz",
    title: "인물 맞히기",
    composition: [
      "한 명이 정답을 맞히고 나머지가 힌트를 줘요",
      "차례대로 정답 역할을 바꿔가며 진행해요",
    ],
    steps: [
      "한 사람을 제외한 나머지에게 정답을 보여줍니다",
      "한 명씩 인물에 대한 힌트를 말합니다",
      "제한 시간 안에 인물을 맞히면 성공!",
    ],
  },
  {
    id: "hunminjeongeum",
    title: "훈민정음",
    composition: [
      "모든 조원이 순서를 정해 참여해요",
      "하나의 주제를 정해서 진행해요",
    ],
    steps: [
      "음식, 연예인 등 하나의 주제를 정합니다",
      "주제에 맞는 단어를 차례대로 말합니다",
      "중복하거나 제한 시간 안에 말하지 못하면 실패!",
    ],
  },
  {
    id: "motion-quiz",
    title: "몸으로 말해요",
    composition: [
      "설명하는 사람과 정답을 맞히는 사람으로 나눠요",
      "말이나 소리를 사용하지 않고 진행해요",
    ],
    steps: [
      "설명하는 사람에게 제시어를 보여줍니다",
      "몸짓만 사용해서 제시어를 표현합니다",
      "제한 시간 안에 맞히면 성공!",
    ],
  },
  {
    id: "clap-game",
    title: "박수 게임",
    composition: [
      "모든 조원이 둥글게 앉아 진행해요",
      "정해진 박수 규칙을 순서대로 이어가요",
    ],
    steps: [
      "첫 사람이 정해진 박수 동작으로 시작합니다",
      "다음 사람은 같은 리듬을 이어갑니다",
      "박자나 순서를 틀린 사람이 실패해요",
    ],
  },
];

const topicRecommendations: TopicRecommendation[] = [
  {
    id: "place-mt",
    category: "place",
    prompt: "이번 MT에서 가장 기대되는 활동이 뭐야?",
  },
  {
    id: "place-trip",
    category: "place",
    prompt: "친구들과 꼭 가보고 싶은 여행지는 어디야?",
  },
  {
    id: "career-dream",
    category: "career",
    prompt: "요즘 가장 관심 있는 진로나 공부 분야가 있어?",
  },
  {
    id: "career-skill",
    category: "career",
    prompt: "올해 꼭 배우고 싶은 새로운 기술이 뭐야?",
  },
  {
    id: "campus-memory",
    category: "campus",
    prompt: "학교생활 중 가장 기억에 남는 순간은 언제야?",
  },
  {
    id: "campus-class",
    category: "campus",
    prompt: "친구들에게 추천하고 싶은 수업이 있어?",
  },
  {
    id: "mbti-fact",
    category: "mbti",
    prompt: "내 MBTI와 가장 잘 맞는다고 느끼는 부분은 뭐야?",
  },
  {
    id: "mbti-change",
    category: "mbti",
    prompt: "예전과 지금의 MBTI가 달라진 적 있어?",
  },
  {
    id: "hobby-weekend",
    category: "hobby",
    prompt: "주말에 시간 가는 줄 모르고 하는 취미가 뭐야?",
  },
  {
    id: "hobby-new",
    category: "hobby",
    prompt: "새로 시작해보고 싶은 취미가 있어?",
  },
  {
    id: "travel-memory",
    category: "travel",
    prompt: "지금까지 다녀온 곳 중 가장 좋았던 곳은 어디야?",
  },
  {
    id: "travel-plan",
    category: "travel",
    prompt: "아무 조건 없이 떠날 수 있다면 어디로 갈래?",
  },
  {
    id: "food-favorite",
    category: "food",
    prompt: "평생 한 가지만 먹는다면 어떤 음식을 고를래?",
  },
  {
    id: "food-recommend",
    category: "food",
    prompt: "나만 알고 싶은 맛집이나 메뉴가 있어?",
  },
  {
    id: "etc-habit",
    category: "etc",
    prompt: "요즘 나를 기분 좋게 만드는 작은 습관이 있어?",
  },
  {
    id: "etc-superpower",
    category: "etc",
    prompt: "하루 동안 초능력을 쓸 수 있다면 뭘 하고 싶어?",
  },
  {
    id: "balance-lunch",
    category: "balance",
    prompt: "누구와 점심을 먹을래?",
    choices: ["교수님과 단둘이\n점심 먹기", "모르는 후배 10명과\n밥 먹기"],
  },
  {
    id: "balance-class",
    category: "balance",
    prompt: "더 견딜 수 있는 수업은?",
    choices: ["매일 아침 9시\n전공 수업 듣기", "매주 금요일 밤\n팀플 회의하기"],
  },
  {
    id: "balance-exam",
    category: "balance",
    prompt: "시험 기간에 하나만 선택한다면?",
    choices: ["시험 전날 밤새서\n공부하기", "일찍 자고 아침에\n벼락치기 하기"],
  },
  {
    id: "balance-team-project",
    category: "balance",
    prompt: "더 힘든 팀플은?",
    choices: [
      "연락은 빠르지만\n아무것도 안 하는 팀원",
      "일은 잘하지만\n연락이 안 되는 팀원",
    ],
  },
  {
    id: "balance-presentation",
    category: "balance",
    prompt: "발표해야 한다면?",
    choices: ["100명 앞에서\n혼자 발표하기", "교수님 앞에서\n1대1 발표하기"],
  },
  {
    id: "balance-morning-class",
    category: "balance",
    prompt: "한 학기 동안 해야 한다면?",
    choices: ["매일 아침 8시\n수업 듣기", "매일 저녁 9시\n수업 듣기"],
  },
  {
    id: "balance-phone",
    category: "balance",
    prompt: "하루 동안 하나를 포기한다면?",
    choices: ["스마트폰 없이\n하루 보내기", "친구와 대화 없이\n하루 보내기"],
  },
  {
    id: "balance-food",
    category: "balance",
    prompt: "평생 하나만 포기한다면?",
    choices: ["평생 매운 음식\n못 먹기", "평생 단 음식\n못 먹기"],
  },
  {
    id: "balance-travel",
    category: "balance",
    prompt: "여행을 간다면?",
    choices: ["계획 하나도 없이\n즉흥 여행하기", "1분 단위로 계획된\n여행하기"],
  },
  {
    id: "balance-money",
    category: "balance",
    prompt: "하나를 받을 수 있다면?",
    choices: ["지금 바로\n100만 원 받기", "1년 뒤에\n200만 원 받기"],
  },
  {
    id: "balance-weather",
    category: "balance",
    prompt: "하나의 계절만 살아야 한다면?",
    choices: ["평생 여름에\n살기", "평생 겨울에\n살기"],
  },
  {
    id: "balance-sleep",
    category: "balance",
    prompt: "더 견딜 만한 것은?",
    choices: ["매일 4시간만\n자기", "매일 아침 6시에\n무조건 일어나기"],
  },
  {
    id: "balance-friend",
    category: "balance",
    prompt: "친구가 된다면?",
    choices: [
      "말은 많지만\n연락 잘 되는 친구",
      "말은 적지만\n필요할 때 오는 친구",
    ],
  },
  {
    id: "balance-mbti",
    category: "balance",
    prompt: "여행 메이트로 고른다면?",
    choices: ["모든 걸 미리 계획하는\n극 J 친구", "도착해서 정하는\n극 P 친구"],
  },
  {
    id: "balance-memory",
    category: "balance",
    prompt: "하나를 선택한다면?",
    choices: [
      "내 흑역사를\n친구들이 모두 알기",
      "친구들 흑역사를\n나만 모두 알기",
    ],
  },
  {
    id: "balance-kakao",
    category: "balance",
    prompt: "더 당황스러운 상황은?",
    choices: [
      "단톡방에 보낼 말을\n교수님께 보내기",
      "교수님께 보낼 말을\n단톡방에 보내기",
    ],
  },
  {
    id: "balance-campus",
    category: "balance",
    prompt: "학교에서 더 싫은 상황은?",
    choices: ["시험 범위가\n전공책 전체", "팀플이 한 학기에\n5개"],
  },
  {
    id: "balance-social",
    category: "balance",
    prompt: "처음 만난 사람들과 있다면?",
    choices: ["내가 먼저 계속\n말 걸기", "누가 말 걸 때까지\n기다리기"],
  },
  {
    id: "balance-attendance",
    category: "balance",
    prompt: "둘 중 하나만 겪어야 한다면?",
    choices: [
      "출석 1분 늦어서\n지각 처리되기",
      "과제 제출 1분 늦어서\n0점 받기",
    ],
  },
  {
    id: "balance-group-chat",
    category: "balance",
    prompt: "더 부담스러운 상황은?",
    choices: [
      "단톡방에서 나만\n대답 안 하기",
      "단톡방에서 나만\n계속 대답하기",
    ],
  },
];

export function getGameByIndex(index = 0): GameRecommendation {
  return gameRecommendations[index % gameRecommendations.length];
}

export function getTopicByIndex(
  category: TopicCategoryId,
  index = 0,
): TopicRecommendation {
  const matches = topicRecommendations.filter(
    (topic) => topic.category === category,
  );

  return matches[index % matches.length];
}
