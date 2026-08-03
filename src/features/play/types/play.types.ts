export type TopicCategoryId =
  | "place"
  | "career"
  | "campus"
  | "mbti"
  | "hobby"
  | "travel"
  | "food"
  | "etc"
  | "balance";

export interface GameRecommendation {
  id: string;
  title: string;
  composition: string[];
  steps: string[];
}

export interface TopicCategory {
  id: Exclude<TopicCategoryId, "balance">;
  label: string;
}

export interface TopicRecommendation {
  id: string;
  category: TopicCategoryId;
  prompt: string;
  choices?: [string, string];
}
