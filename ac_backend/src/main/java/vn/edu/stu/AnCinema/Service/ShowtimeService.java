package vn.edu.stu.AnCinema.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.stu.AnCinema.Entity.Movies;
import vn.edu.stu.AnCinema.Entity.Rooms;
import vn.edu.stu.AnCinema.Entity.Showtimes;
import vn.edu.stu.AnCinema.Repository.MoviesRepository;
import vn.edu.stu.AnCinema.Repository.RoomRepository;
import vn.edu.stu.AnCinema.Repository.ShowtimesRepository;
import vn.edu.stu.AnCinema.dto.request.ShowtimeRequest;
import vn.edu.stu.AnCinema.enums.MoviesStatus;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShowtimeService {
    ShowtimesRepository showtimesRepository;
    MoviesRepository moviesRepository;
    RoomRepository roomRepository;
    int CLEANING_TIME = 15;

    public List<Showtimes> getAllShowtimes() {
        return showtimesRepository.findAllByOrderByStartTimeDesc();
    }

    @Transactional
    public Showtimes createShowtime(ShowtimeRequest request) {
        Movies movie = moviesRepository.findById(request.getMovieId())
                .orElseThrow(() -> new RuntimeException("Phim không tồn tại"));
        Rooms room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại"));

        LocalDateTime start = request.getStartTime();
        LocalDateTime end = start.plusMinutes(movie.getDuration() + CLEANING_TIME);

        List<Showtimes> overlaps = showtimesRepository.checkOverlap(request.getRoomId(), start, end);
        if (!overlaps.isEmpty()) {
            throw new RuntimeException("Phòng này đang bận trong khung giờ đã chọn!");
        }
        Double basePrice = request.getBasePrice();

        checkAndUpdateMovieStatus(movie);

        Showtimes showtime = Showtimes.builder()
                .movie(movie)
                .room(room)
                .startTime(start)
                .endTime(end)
                .basePrice(basePrice)
                .isActive(true)
                .build();

        return showtimesRepository.save(showtime);
    }

    @Transactional
    public void deleteShowtime(Integer id) {
        Showtimes showtime = showtimesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lịch không tồn tại"));

        Integer movieId = showtime.getMovie().getId();

        showtimesRepository.deleteById(id);

        checkAndResetMovieStatus(movieId);
    }

    void checkAndResetMovieStatus(Integer movieId) {
        Movies movie = moviesRepository.findById(movieId).orElse(null);
        if (movie != null && "active".equalsIgnoreCase(String.valueOf(movie.getStatus()))) {

            long futureShowtimes = showtimesRepository.countByMovieIdAndStartTimeAfter(movieId, LocalDateTime.now());

            if (futureShowtimes == 0) {
                movie.setStatus(MoviesStatus.valueOf("finished"));
                moviesRepository.save(movie);
            }
        }
    }

    @Transactional
    public String autoCreateShowtimes(ShowtimeRequest request) {
        Movies movie = moviesRepository.findById(request.getMovieId())
                .orElseThrow(() -> new RuntimeException("Phim không tồn tại"));
        Rooms room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại"));

        LocalDateTime currentStart = request.getStartTime();
        LocalDateTime closingTime = currentStart.toLocalDate().atTime(23, 0);

        int count = 0;
        int skipped = 0;

        while (currentStart.plusMinutes(movie.getDuration()).isBefore(closingTime)) {

            LocalDateTime currentEnd = currentStart.plusMinutes(movie.getDuration() + 15); // +15p dọn

            List<Showtimes> overlaps = showtimesRepository.checkOverlap(request.getRoomId(), currentStart, currentEnd);

            if (overlaps.isEmpty()) {
                Showtimes showtime = Showtimes.builder()
                        .movie(movie)
                        .room(room)
                        .startTime(currentStart)
                        .endTime(currentEnd)
                        .basePrice(request.getBasePrice())
                        .isActive(true)
                        .build();
                showtimesRepository.save(showtime);
                count++;
            } else {
                skipped++;
            }

            currentStart = currentEnd;
        }
        if (count > 0) {
            checkAndUpdateMovieStatus(movie);
        }
        return "Đã tự động tạo " + count + " suất chiếu. (Bỏ qua " + skipped + " suất do trùng lịch/ngoài giờ)";
    }

    void checkAndUpdateMovieStatus(Movies movie) {
        if ("upcoming".equalsIgnoreCase(String.valueOf(movie.getStatus())) || "finished".equalsIgnoreCase(String.valueOf(movie.getStatus()))) {
            movie.setStatus(MoviesStatus.valueOf("active"));
            moviesRepository.save(movie);
        }
    }
}
