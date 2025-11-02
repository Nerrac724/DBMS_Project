import { useState, useEffect } from 'react';
import { api, type Show, type Seat } from '../lib/api';

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

interface SeatSelectionProps {
  show: ShowWithDetails;
  onConfirm: (seats: string[], totalAmount: number) => void;
  onBack: () => void;
}

export function SeatSelection({ show, onConfirm, onBack }: SeatSelectionProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeats();
  }, [show.id]);

  const loadSeats = async () => {
    setLoading(true);
    try {
      const data: Seat[] = await api.seats.getByShowId(show.id);
      const booked = data.filter((s) => s.is_booked).map((s) => s.seat_number);
      setBookedSeats(booked);
    } catch (err) {
      console.error('Error loading seats:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSeats = () => {
    const seats: string[] = [];
    const totalSeats = show.screen.total_seats;
    const seatsPerRow = Math.ceil(totalSeats / 10);

    for (let i = 0; i < totalSeats; i++) {
      const row = Math.floor(i / seatsPerRow);
      const seatNum = (i % seatsPerRow) + 1;
      const rowLabel = String.fromCharCode(65 + row);
      seats.push(`${rowLabel}${seatNum}`);
    }
    return seats;
  };

  const toggleSeat = (seatLabel: string) => {
    if (bookedSeats.includes(seatLabel)) return;

    setSelectedSeats((prev) =>
      prev.includes(seatLabel)
        ? prev.filter((s) => s !== seatLabel)
        : [...prev, seatLabel]
    );
  };

  const getSeatClassName = (seatLabel: string) => {
    if (bookedSeats.includes(seatLabel)) {
      return 'bg-gray-400 cursor-not-allowed';
    }
    if (selectedSeats.includes(seatLabel)) {
      return 'bg-green-500 hover:bg-green-600';
    }
    return 'bg-gray-200 hover:bg-gray-300';
  };

  const totalAmount = selectedSeats.length * show.price;
  const allSeats = generateSeats();

  const handleConfirm = () => {
    if (selectedSeats.length === 0) return;
    onConfirm(selectedSeats, totalAmount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading seats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="text-red-600 hover:text-red-700 font-semibold mb-4"
          >
            ← Back to Shows
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Select Seats
              </h1>
              <p className="text-gray-600">
                {show.screen.theater.name} - {show.screen.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Price per seat</p>
              <p className="text-2xl font-bold text-gray-900">
                ${show.price.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-gray-800 text-white text-center py-3 rounded-lg mb-8">
          SCREEN
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-block">
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-2 mb-2">
                <div className="w-8 text-center font-semibold text-gray-600">
                  {String.fromCharCode(65 + rowIndex)}
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: Math.ceil(show.screen.total_seats / 10) }).map(
                    (_, seatIndex) => {
                      const index = rowIndex * Math.ceil(show.screen.total_seats / 10) + seatIndex;
                      if (index >= allSeats.length) return null;

                      const seatLabel = allSeats[index];
                      return (
                        <button
                          key={seatLabel}
                          onClick={() => toggleSeat(seatLabel)}
                          disabled={bookedSeats.includes(seatLabel)}
                          className={`w-8 h-8 rounded-t-lg text-xs font-semibold text-white transition-colors ${getSeatClassName(
                            seatLabel
                          )}`}
                          title={seatLabel}
                        >
                          {seatIndex + 1}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-8 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-t-lg"></div>
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-t-lg"></div>
            <span className="text-sm text-gray-600">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-400 rounded-t-lg"></div>
            <span className="text-sm text-gray-600">Booked</span>
          </div>
        </div>
      </div>

      {selectedSeats.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {selectedSeats.length} Seat{selectedSeats.length > 1 ? 's' : ''} Selected
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedSeats.join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${totalAmount.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={handleConfirm}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
