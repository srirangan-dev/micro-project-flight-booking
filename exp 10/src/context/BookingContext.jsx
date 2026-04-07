import { createContext, useContext, useState } from "react";

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("skybook_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [searchParams, setSearchParams] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedClass, setSelectedClass] = useState("economy");
  const [passengerInfo, setPassengerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    passportNo: "",
  });
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem("skybook_bookings");
    return saved ? JSON.parse(saved) : [];
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("skybook_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("skybook_user");
  };

  const addBooking = (booking) => {
    const newBooking = {
      ...booking,
      bookingId: `SKY${Date.now()}`,
      bookedAt: new Date().toISOString(),
      status: "Confirmed",
    };
    const updated = [newBooking, ...bookings];
    setBookings(updated);
    localStorage.setItem("skybook_bookings", JSON.stringify(updated));
    return newBooking;
  };

  const resetBookingFlow = () => {
    setSelectedFlight(null);
    setSelectedClass("economy");
    setPassengerInfo({
      firstName: "", lastName: "", email: "", phone: "",
      dob: "", gender: "", passportNo: "",
    });
    setSelectedSeat(null);
  };

  return (
    <BookingContext.Provider
      value={{
        user, login, logout,
        searchParams, setSearchParams,
        selectedFlight, setSelectedFlight,
        selectedClass, setSelectedClass,
        passengerInfo, setPassengerInfo,
        selectedSeat, setSelectedSeat,
        bookings, addBooking,
        resetBookingFlow,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
};