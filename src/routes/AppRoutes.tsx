import SelectSeat from "@/pages/SelectSeat";
import Showtime from "@/pages/Showtime";
import { Navigate, Route, Routes } from "react-router-dom";

export default function AppRoutes() {
  return (
    <Routes>
      {/* --- PUBLIC ROUTES --- */}
      <Route path="/showtimes" element={<Showtime />} />
      <Route path="/select-seats/:showtimeId" element={<SelectSeat />} />

      <Route path="*" element={<Navigate to="/showtimes" replace />} />
    </Routes>
  );
}
