import type { Recommendation } from "@/types/finance";

type Props = {
  items: Recommendation[];
};

export function Recommendations({ items }: Props) {
  return (
    <div className="recommendation-list">
      {items.map((item) => (
        <article className={`recommendation ${item.priority}`} key={`${item.title}-${item.priority}`}>
          <h3>{item.title}</h3>
          <p className="muted">{item.message}</p>
          <span className="pill">{item.priority}</span>
        </article>
      ))}
    </div>
  );
}

