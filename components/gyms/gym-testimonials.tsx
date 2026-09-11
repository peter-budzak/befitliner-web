/** Only publish quotes supplied and approved by the named gym. */
export type GymTestimonial = {quote: string; owner: string; gym: string};
export default function GymTestimonials({items}: {items: GymTestimonial[]}) {
  if (!items.length) return null;
  return (
    <div className="gym-testimonials">
      {items.map((item) => (
        <figure key={`${item.gym}-${item.owner}`}>
          <blockquote>{item.quote}</blockquote>
          <figcaption>
            {item.owner} · {item.gym}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
