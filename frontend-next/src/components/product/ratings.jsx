import { Star, StarHalf } from "lucide-react";

export function Ratings({ rating = 0 }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<Star key={i} size={20} className="mr-2 fill-amber-400 text-amber-400" />);
    } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
      stars.push(<StarHalf key={i} size={17} className="mr-2 fill-amber-400 text-amber-400" />);
    } else {
      stars.push(<Star key={i} size={20} className="mr-2 text-amber-400" />);
    }
  }
  return <div className="flex">{stars}</div>;
}
