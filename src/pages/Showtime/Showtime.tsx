import { useShowtimesByDate } from "@/apis/ticketing/useShowtimeQuery";
import DateCarousel from "@/components/DateCarousel";
import MovieShowtimeCard, {
  type MovieGroup,
} from "@/components/MovieShowtimeCard";
import type { ShowtimeResponse } from "@/types/types";
import {
  Bell,
  ChevronDown,
  Clapperboard,
  MapPin,
  RefreshCw,
  Search,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import style from "./Showtime.module.scss";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupByMovie(items: ShowtimeResponse[]): MovieGroup[] {
  const map = new Map<string, MovieGroup>();
  for (const item of items) {
    const id = item.movieResponse.movieId;
    if (!map.has(id)) {
      map.set(id, {
        movieId: id,
        title: item.movieResponse.title,
        posterUrl: item.movieResponse.posterUrl,
        description: item.movieResponse.description,
        ageRating: item.movieResponse.ageRating,
        releaseDate: item.movieResponse.releaseDate,
        showtimes: [],
        overridePoster: item.movieResponse.posterUrl, // You can set this to a different URL if needed
      });
    }
    map.get(id)!.showtimes.push({
      showtimeId: item.showtimeId,
      movieResponse: item.movieResponse,
      roomResponse: item.roomResponse,
      startTime: item.startTime,
      endTime: item.endTime,
      ticketPrice: item.ticketPrice,
      status: item.status,
    });
  }
  return Array.from(map.values());
}

function formatSelectedDateLabel(date: string): string {
  const d = new Date(date + "T00:00:00");
  const days = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  const months = [
    "tháng 1",
    "tháng 2",
    "tháng 3",
    "tháng 4",
    "tháng 5",
    "tháng 6",
    "tháng 7",
    "tháng 8",
    "tháng 9",
    "tháng 10",
    "tháng 11",
    "tháng 12",
  ];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Showtime() {
  const [selectedDate, setSelectedDate] = useState("2026-03-17");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, error, isError, isLoading, isFetching, refetch } =
    useShowtimesByDate(selectedDate);

  const movies = useMemo(() => groupByMovie(data ?? []), [data]);

  const errorMessage =
    error instanceof Error ? error.message : "Không thể tải lịch chiếu";

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className={style.page}>
      {/* ── Header ── */}
      <header className={style.header}>
        <div className={style.headerInner}>
          {/* Logo */}
          <div className={style.logoWrap}>
            <div className={style.logoBadge}>
              <Clapperboard size={16} className={style.iconWhite} />
            </div>
            <span className={style.logoText}>
              <span className={style.logoAccent}>CINE</span>MAX
            </span>
          </div>

          {/* Cinema location */}
          <button className={style.locationButton}>
            <MapPin size={13} className={style.logoAccentIcon} />
            <span>CGV Vincom Center</span>
            <ChevronDown size={13} />
          </button>

          {/* Search */}
          <div className={style.searchWrap}>
            <Search size={14} className={style.searchIcon} />
            <input
              type="text"
              placeholder="Tìm phim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={style.searchInput}
            />
          </div>

          {/* Right actions */}
          <div className={style.rightActions}>
            <button
              className={`${style.iconButton} ${style.iconButtonWithDot}`}
            >
              <Bell size={14} />
              <span className={style.notifDot} />
            </button>
            <button className={style.iconButton}>
              <User size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className={style.main}>
        {/* Page title */}
        <div className={style.pageTitle}>
          <div className={style.titleRow}>
            <span className={style.titleAccent} />
            <h1 className={style.title}>Chọn Suất Chiếu</h1>
          </div>
          <p className={style.subtitle}>
            Chọn ngày và giờ chiếu phù hợp với bạn
          </p>
        </div>

        {/* ── Date Carousel ── */}
        <section className={style.dateSection}>
          <DateCarousel
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />

          {/* Selected date label */}
          <div className={style.selectedDateRow}>
            <div className={style.selectedDateLeft}>
              <div className={style.pulseDot} />
              <span className={style.dateLabel}>
                {formatSelectedDateLabel(selectedDate)}
              </span>
            </div>
            <span className={style.movieCount}>
              {filteredMovies.length} phim đang chiếu
            </span>
          </div>
        </section>

        {/* ── Showtime List ── */}
        <section>
          {/* Legend */}
          <div className={style.legendRow}>
            <div className={style.legendItem}>
              <div className={style.legendDotAvailable} />
              <span className={style.legendText}>Còn vé</span>
            </div>
            <div className={style.legendItem}>
              <div className={style.legendDotSoldOut} />
              <span className={style.legendText}>Hết vé</span>
            </div>
            <div className={style.legendSpacer} />
            <button
              onClick={() => refetch()}
              className={style.refreshButton}
              disabled={isFetching}
            >
              <RefreshCw
                size={11}
                className={isFetching ? style.spinning : undefined}
              />
              Làm mới
            </button>
          </div>

          {/* State: loading */}
          {isLoading && (
            <div className={style.loadingState}>
              <div className={style.loadingSpinner} />
              <p className={style.loadingText}>Đang tải lịch chiếu...</p>
            </div>
          )}

          {/* State: error + no data */}
          {!isLoading && isError && filteredMovies.length === 0 && (
            <div className={style.feedbackState}>
              <div className={style.feedbackIconWrap}>
                <Clapperboard size={28} className={style.feedbackIcon} />
              </div>
              <p className={style.feedbackText}>{errorMessage}</p>
              <button onClick={() => refetch()} className={style.retryButton}>
                Thử lại
              </button>
            </div>
          )}

          {/* State: empty */}
          {!isLoading && !isError && filteredMovies.length === 0 && (
            <div className={style.feedbackState}>
              <div className={style.feedbackIconWrap}>
                <Clapperboard size={28} className={style.feedbackIcon} />
              </div>
              <p className={style.feedbackText}>Không có suất chiếu nào</p>
              <p className={style.feedbackSubText}>Vui lòng chọn ngày khác</p>
            </div>
          )}

          {/* Movie list */}
          {!isLoading && filteredMovies.length > 0 && (
            <div className={style.movieList}>
              {filteredMovies.map((movie) => (
                <MovieShowtimeCard key={movie.movieId} movie={movie} />
              ))}
            </div>
          )}
        </section>

        {/* ── Footer note ── */}
        <footer className={style.footer}>
          <p className={style.footerPrimary}>
            Giá vé chưa bao gồm phụ phí. Vé đã mua không được hoàn trả hoặc đổi
            ngày.
          </p>
          <p className={style.footerSecondary}>
            © 2026 CineMax. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
