import type { TopicCategory } from "../types/play.types";
import styles from "./play.module.css";

interface TopicCategoryListProps {
  categories: TopicCategory[];
  activeCategory: TopicCategory["id"];
  onSelect: (category: TopicCategory["id"]) => void;
}

export default function TopicCategoryList({
  categories,
  activeCategory,
  onSelect,
}: TopicCategoryListProps) {
  return (
    <section
      className={styles.categorySection}
      aria-labelledby="category-title"
    >
      <h2 id="category-title">주제 카테고리</h2>
      <div className={styles.categoryList}>
        {categories.map((category) => {
          const isActive = category.id === activeCategory;

          return (
            <button
              key={category.id}
              type="button"
              className={isActive ? styles.activeCategory : styles.category}
              aria-pressed={isActive}
              onClick={() => onSelect(category.id)}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
