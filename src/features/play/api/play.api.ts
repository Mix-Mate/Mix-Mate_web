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
];

export function getRandomGame(index = 0): GameRecommendation {
  return gameRecommendations[index % gameRecommendations.length];
}

export function getRandomTopic(
  category: TopicCategoryId,
  index = 0,
): TopicRecommendation {
  const matches = topicRecommendations.filter(
    (topic) => topic.category === category,
  );

  return matches[index % matches.length];
}
