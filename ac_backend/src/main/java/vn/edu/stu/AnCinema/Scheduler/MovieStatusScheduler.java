package vn.edu.stu.AnCinema.Scheduler;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.stu.AnCinema.Entity.Movies;
import vn.edu.stu.AnCinema.Repository.MoviesRepository;
import vn.edu.stu.AnCinema.enums.MoviesStatus;

import java.util.List;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MovieStatusScheduler {
    MoviesRepository moviesRepository;

    // cron = "Giây Phút Giờ Ngày Tháng Thứ"
    @Scheduled(cron = "0 * */1 * * *")
    @Transactional
    public void autoUpdateFinishedMovies() {
        log.info("---- Bắt đầu quét phim hết lịch chiếu ----");

        List<Movies> expiredMovies = moviesRepository.findExpiredMovies();

        if (expiredMovies.isEmpty()) {
            log.info("Không có phim nào cần cập nhật.");
            return;
        }

        for (Movies movie : expiredMovies) {
            movie.setStatus(MoviesStatus.valueOf("finished"));
            log.info(">> Đã chuyển phim '{}' sang trạng thái Ngừng Chiếu (Finished)", movie.getTitle());
        }

        moviesRepository.saveAll(expiredMovies);
        log.info("---- Hoàn tất cập nhật {} phim ----", expiredMovies.size());
    }
}
