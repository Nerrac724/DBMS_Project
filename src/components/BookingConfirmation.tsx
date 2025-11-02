import { useState } from 'react';
import { CheckCircle, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { api, type Show, type Movie } from '../lib/api';

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

interface BookingConfirmationProps {
  show: ShowWithDetails;
  movie: Movie;
  seats: string[];
  totalAmount: number;
  onComplete: () => void;
  onBack: () => void;
}

type PaymentMethod = 'card' | 'upi' | 'wallet';

export function BookingConfirmation({
  show,
  movie,
  seats,
  totalAmount,
  onComplete,
  onBack,
}: BookingConfirmationProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError('');

    try {
      const seatIds = seats.map((_, i) => i + 1);
      await api.bookings.create(show.id, seatIds);
      setCompleted(true);
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-12 text-center max-w-md">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600 mb-6">
            Your tickets have been booked successfully.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Seats</p>
            <p className="text-xl font-bold text-gray-900">{seats.join(', ')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="text-red-600 hover:text-red-700 font-semibold mb-4"
          >
            ← Back to Seat Selection
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Booking Summary</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Movie Details</h2>

            <div className="flex gap-4 mb-6">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-24 h-36 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {movie.title}
                </h3>
                <p className="text-sm text-gray-600 mb-1">{movie.genre}</p>
                <p className="text-sm text-gray-600 mb-1">
                  Rating: {movie.rating}
                </p>
                <p className="text-sm text-gray-600">{movie.duration} min</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Theater</span>
                <span className="font-semibold text-gray-900">
                  {show.screen.theater.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Screen</span>
                <span className="font-semibold text-gray-900">
                  {show.screen.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-semibold text-gray-900">
                  {formatDate(show.show_time)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time</span>
                <span className="font-semibold text-gray-900">
                  {formatTime(show.show_time)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-gray-600">Seats</span>
                <span className="font-semibold text-gray-900">
                  {seats.join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Number of Tickets</span>
                <span className="font-semibold text-gray-900">{seats.length}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Payment Method
              </h2>

              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="text-gray-700" />
                  <span className="font-semibold text-gray-900">
                    Credit/Debit Card
                  </span>
                </button>

                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'upi'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Smartphone className="text-gray-700" />
                  <span className="font-semibold text-gray-900">UPI</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('wallet')}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                    paymentMethod === 'wallet'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Wallet className="text-gray-700" />
                  <span className="font-semibold text-gray-900">
                    Digital Wallet
                  </span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Payment Summary
              </h2>

              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Ticket Price × {seats.length}
                  </span>
                  <span className="text-gray-900">
                    ${(show.price * seats.length).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="font-bold text-gray-900 text-xl">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-lg transition-colors"
              >
                {processing ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
