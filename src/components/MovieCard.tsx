import { Film, Clock, Globe } from 'lucide-react';
import type { Database } from '../lib/supabase';

type Movie = Database['public']['Tables']['movies']['Row'];

interface MovieCardProps {
  movie: Movie;
  onBookNow: (movie: Movie) => void;
}

export function MovieCard({ movie, onBookNow }: MovieCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-80 overflow-hidden">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {movie.rating}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{movie.title}</h3>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Film size={16} />
            <span>{movie.genre}</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe size={16} />
            <span>{movie.language}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{movie.duration} min</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {movie.description}
        </p>

        <button
          onClick={() => onBookNow(movie)}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
