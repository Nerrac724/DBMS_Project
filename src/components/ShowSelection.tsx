import { useEffect, useState } from 'react';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Movie = Database['public']['Tables']['movies']['Row'];
type Show = Database['public']['Tables']['shows']['Row'];
type Screen = Database['public']['Tables']['screens']['Row'];
type Theater = Database['public']['Tables']['theaters']['Row'];

interface ShowWithDetails extends Show {
  screen: Screen & {
    theater: Theater;
  };
}

interface ShowSelectionProps {
  movie: Movie;
  onShowSelect: (show: ShowWithDetails) => void;
  onBack: () => void;
}

export function ShowSelection({ movie, onShowSelect, onBack }: ShowSelectionProps) {
  const [shows, setShows] = useState<ShowWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    loadShows();
  }, [movie.id]);

  const loadShows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('shows')
      .select(`
        *,
        screen:screens(
          *,
          theater:theaters(*)
        )
      `)
      .eq('movie_id', movie.id)
      .gte('show_date', new Date().toISOString().split('T')[0])
      .order('show_date', { ascending: true })
      .order('show_time', { ascending: true });

    if (error) {
      console.error('Error loading shows:', error);
    } else if (data) {
      const showsWithDetails = data as unknown as ShowWithDetails[];
      setShows(showsWithDetails);

      const uniqueDates = Array.from(
        new Set(showsWithDetails.map((s) => s.show_date))
      );
      setDates(uniqueDates);
      if (uniqueDates.length > 0) {
        setSelectedDate(uniqueDates[0]);
      }
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const filteredShows = shows.filter((show) => show.show_date === selectedDate);
  const showsByTheater = filteredShows.reduce((acc, show) => {
    const theaterName = show.screen.theater.name;
    if (!acc[theaterName]) {
      acc[theaterName] = [];
    }
    acc[theaterName].push(show);
    return acc;
  }, {} as Record<string, ShowWithDetails[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading shows...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="text-red-600 hover:text-red-700 font-semibold mb-4"
          >
            ← Back to Movies
          </button>

          <div className="flex items-start gap-6">
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-32 h-48 object-cover rounded-lg shadow-lg"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {movie.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="bg-gray-200 px-2 py-1 rounded">{movie.rating}</span>
                <span>{movie.genre}</span>
                <span>{movie.language}</span>
                <span>{movie.duration} min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                selectedDate === date
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {formatDate(date)}
            </button>
          ))}
        </div>

        {Object.keys(showsByTheater).length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            No shows available for the selected date
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(showsByTheater).map(([theaterName, theaterShows]) => (
              <div key={theaterName} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {theaterName}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <MapPin size={16} />
                      <span>{theaterShows[0].screen.theater.location}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {theaterShows.map((show) => (
                    <button
                      key={show.id}
                      onClick={() => onShowSelect(show)}
                      className="border-2 border-gray-200 hover:border-red-600 rounded-lg p-4 text-center transition-colors"
                    >
                      <div className="flex items-center justify-center gap-2 text-green-600 font-semibold mb-2">
                        <Clock size={16} />
                        <span>{formatTime(show.show_time)}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {show.screen.screen_number}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {show.screen.screen_type}
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        ₹{show.ticket_price}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
