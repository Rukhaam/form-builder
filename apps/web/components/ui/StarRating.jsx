'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StarRating({ rating, setRating, readOnly = false, size = "size-6" }) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHoverValue(0)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverValue || rating) >= star;
        
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && setRating(star)}
            onMouseEnter={() => !readOnly && setHoverValue(star)}
            className={cn(
              "transition-all duration-200",
              readOnly ? "cursor-default" : "cursor-pointer hover:scale-110",
              isFilled ? "text-amber-400" : "text-slate-300"
            )}
          >
            <Star 
              className={cn(size, isFilled ? "fill-amber-400" : "fill-transparent")} 
            />
          </button>
        );
      })}
    </div>
  );
}