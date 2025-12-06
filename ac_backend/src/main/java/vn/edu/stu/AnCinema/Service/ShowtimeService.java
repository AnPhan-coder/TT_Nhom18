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

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShowtimeService {
    ShowtimesRepository showtimesRepository;
    MoviesRepository moviesRepository;
    RoomRepository roomRepository;

    @Transactional
    public Showtimes createShowtime(ShowtimeRequest request) {
        Movies movie = moviesRepository.findById(request.getMovieId())
                .orElseThrow(() -> new RuntimeException("Phim không tồn tại!"));

        Rooms room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Phòng chiếu không tồn tại!"));

        int cleaningTime = 15;
        LocalDateTime endTime = request.getStartTime()
                .plusMinutes(movie.getDuration())
                .plusMinutes(cleaningTime);

        boolean isOverlap = showtimesRepository.existsByRoomIdAndTimeOverlap(
                request.getRoomId(),
                request.getStartTime(),
                endTime
        );

        if (isOverlap) {
            throw new RuntimeException("Lỗi: Phòng " + room.getName() + " đã có suất chiếu trong khung giờ này!");
        }

        Showtimes showtime = Showtimes.builder()
                .movie(movie)
                .room(room)
                .startTime(request.getStartTime())
                .endTime(endTime)
                .basePrice(request.getBasePrice())
                .isActive(true)
                .build();

        return showtimesRepository.save(showtime);
    }
}
