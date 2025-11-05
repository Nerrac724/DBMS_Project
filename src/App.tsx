import { useState, useEffect } from 'react';
import { Film, User, LogOut, Menu, X } from 'lucide-react';
import { api, getAuthToken, type Movie, type Show } from './lib/api';
import { MovieCard } from './components/MovieCard';
import { ShowSelection } from './components/ShowSelection';
import { SeatSelection } from './components/SeatSelection';
import { BookingConfirmation } from './components/BookingConfirmation';
import { AuthModal } from './components/AuthModal';

interface ShowWithDetails extends Show {
  screen: {
    id: number;
    name: string;
    total_seats: number;
    theater: {
      id: number;
      name: string;
      location: string;
    };
  };
}

type AppView = 'movies' | 'shows' | 'seats' | 'confirmation';

interface AuthUser {
  id: number;
  email: string;
}

function App() {
  const [view, setView] = useState<AppView>('movies');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedShow, setSelectedShow] = useState<ShowWithDetails | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkUser();
    loadMovies();
  }, []);

  const checkUser = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const userData = localStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  };

  const loadMovies = async () => {
    try {
      const data = await api.movies.getAll();
      setMovies(data);
    } catch (err) {
      console.error('Error loading movies:', err);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setView('shows');
    setMobileMenuOpen(false);
  };

  const handleShowSelect = (show: ShowWithDetails) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedShow(show);
    setView('seats');
  };

  const handleSeatsConfirm = (seats: string[], amount: number) => {
    setSelectedSeats(seats);
    setTotalAmount(amount);
    setView('confirmation');
  };

  const handleBookingComplete = () => {
    setView('movies');
    setSelectedMovie(null);
    setSelectedShow(null);
    setSelectedSeats([]);
    setTotalAmount(0);
  };

  const handleBackToMovies = () => {
    setView('movies');
    setSelectedMovie(null);
    setSelectedShow(null);
    setSelectedSeats([]);
    setTotalAmount(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'movies' && (
        <>
          <nav className="bg-red-600 text-white shadow-lg sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  <Film size={32} />
                  <h1 className="text-2xl font-bold">ShowtimeDB</h1>
                </div>

                <div className="hidden md:flex items-center gap-4">
                  {user ? (
                    <>
                      <div className="flex items-center gap-2">
                        <User size={20} />
                        <span className="font-semibold">{user.email}</span>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition-colors"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="bg-red-700 hover:bg-red-800 px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Sign In
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>

              {mobileMenuOpen && (
                <div className="md:hidden pb-4">
                  {user ? (
                    <>
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <User size={18} />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 px-4 py-2 rounded-lg transition-colors"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setShowAuthModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-red-700 hover:bg-red-800 px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              )}
            </div>
          </nav>

          <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Now Showing
            </h2>

            {movies.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                No movies available at the moment
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onBookNow={handleMovieSelect}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {view === 'shows' && selectedMovie && (
        <ShowSelection
          movie={selectedMovie}
          onShowSelect={handleShowSelect}
          onBack={handleBackToMovies}
        />
      )}

      {view === 'seats' && selectedShow && (
        <SeatSelection
          show={selectedShow}
          onConfirm={handleSeatsConfirm}
          onBack={() => setView('shows')}
        />
      )}

      {view === 'confirmation' && selectedShow && selectedMovie && (
        <BookingConfirmation
          show={selectedShow}
          movie={selectedMovie}
          seats={selectedSeats}
          totalAmount={totalAmount}
          onComplete={handleBookingComplete}
          onBack={() => setView('seats')}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            if (selectedShow) {
              setView('seats');
            }
          }}
        />
      )}
    </div>
  );
}

export default App;
