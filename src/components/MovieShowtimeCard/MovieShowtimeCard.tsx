import { formatDateDMY, formatTimeHM } from "@/utils/format";
import type { ShowtimeResponse } from "../../types/types";
import style from "./MovieShowtimeCard.module.scss";

import { Ban, Clock, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface MovieGroup {
  movieId: string;
  title: string;
  posterUrl: string;
  description: string;
  ageRating: string;
  releaseDate: string | Date;
  showtimes: ShowtimeResponse[];
  overridePoster?: string;
}

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

interface ShowtimePillProps {
  showtime: ShowtimeResponse;
  onClick: (showtimeId: string) => void;
}

function ShowtimePill({ showtime, onClick }: ShowtimePillProps) {
  const isAvailable = showtime.status === "OPENING";
  const time = formatTimeHM(showtime.startTime);
  const price = formatPrice(showtime.ticketPrice);

  return (
    <button
      onClick={isAvailable ? () => onClick(showtime.showtimeId) : undefined}
      disabled={!isAvailable}
      className={`${style.showtimePill} ${isAvailable ? style.showtimePillAvailable : style.showtimePillSoldOut}`}
    >
      {/* Sold out overlay */}
      {!isAvailable && (
        <span className={style.soldOutOverlay}>
          <Ban size={8} />
          Hết vé
        </span>
      )}

      {/* Time */}
      <span
        className={`${style.showtimeTime} ${isAvailable ? style.showtimeTimeAvailable : style.showtimeTimeSoldOut}`}
      >
        {time}
      </span>

      {/* Room */}
      <span
        className={`${style.showtimeRoom} ${isAvailable ? style.showtimeRoomAvailable : style.showtimeRoomSoldOut}`}
      >
        {showtime.roomResponse.roomName}
      </span>

      {/* Price */}
      <span
        className={`${style.showtimePrice} ${isAvailable ? style.showtimePriceAvailable : style.showtimePriceSoldOut}`}
      >
        {price}
      </span>
    </button>
  );
}

interface RoomTypeGroupProps {
  type: string;
  showtimes: ShowtimeResponse[];
}

function RoomTypeGroup({ type, showtimes }: RoomTypeGroupProps) {
  const navigate = useNavigate();
  const is3D = type === "3D";
  const isIMAX = type === "IMAX";

  const handleClickShowtime = (showtimeId: string) => {
    navigate(`/select-seats/${showtimeId}`);
  };

  return (
    <div className={style.roomTypeGroup}>
      {/* Type badge */}
      <div className={style.roomTypeBadgeWrap}>
        <span
          className={`${style.roomTypeBadge} ${
            is3D
              ? style.roomTypeBadge3d
              : isIMAX
                ? style.roomTypeBadgeImax
                : style.roomTypeBadge2d
          }`}
        >
          {type}
        </span>
      </div>

      {/* Showtime pills */}
      <div className={style.pillsWrap}>
        {showtimes.map((st) => (
          <ShowtimePill
            key={st.showtimeId}
            showtime={st}
            onClick={handleClickShowtime}
          />
        ))}
      </div>
    </div>
  );
}

interface AgeBadgeProps {
  rating: string;
}

function AgeBadge({ rating }: AgeBadgeProps) {
  const isC18 = rating === "C18";
  return (
    <span
      className={`${style.ageBadge} ${isC18 ? style.ageBadgeC18 : style.ageBadgeRegular}`}
    >
      {rating}
    </span>
  );
}

interface MovieShowtimeCardProps {
  movie: MovieGroup;
}

export default function MovieShowtimeCard({ movie }: MovieShowtimeCardProps) {
  // Group showtimes by room type
  const grouped: Record<string, ShowtimeResponse[]> = {};
  for (const st of movie.showtimes) {
    const type = st.roomResponse.type;
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(st);
  }
  // Sort types: 2D first, then 3D, then others
  const typeOrder = ["2D", "3D", "IMAX"];
  const types = Object.keys(grouped).sort((a, b) => {
    const ai = typeOrder.indexOf(a);
    const bi = typeOrder.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const posterSrc = movie.overridePoster || movie.posterUrl;

  return (
    <div className={style.card}>
      {/* Subtle top accent line */}
      <div className={style.topAccentLine} />

      {/* Poster */}
      <div className={style.posterWrap}>
        {posterSrc &&
        posterSrc.startsWith("http") &&
        !posterSrc.includes("poster.vn") ? (
          <img
            src={posterSrc}
            alt={movie.title}
            className={style.posterImage}
          />
        ) : (
          <div className={style.posterFallback}>
            <Film size={28} className={style.posterFallbackIcon} />
            <span className={style.posterFallbackText}>{movie.title}</span>
          </div>
        )}
        {/* Poster overlay gradient at bottom */}
        <div className={style.posterOverlay} />
      </div>

      {/* Content */}
      <div className={style.content}>
        {/* Header */}
        <div>
          <div className={style.headerRow}>
            <h2 className={style.movieTitle}>{movie.title}</h2>
            <AgeBadge rating={movie.ageRating} />
          </div>
          <p className={style.movieDescription}>{movie.description}</p>
          <div className={style.metaRow}>
            <span className={style.metaItem}>
              <Clock size={11} />
              Khởi chiếu: {formatDateDMY(movie.releaseDate)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className={style.divider} />

        {/* Showtime groups by room type */}
        <div className={style.groupList}>
          {types.map((type) => (
            <RoomTypeGroup key={type} type={type} showtimes={grouped[type]} />
          ))}
        </div>
      </div>
    </div>
  );
}
