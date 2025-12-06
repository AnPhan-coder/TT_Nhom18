package vn.edu.stu.AnCinema.Repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.edu.stu.AnCinema.Entity.Showtimes;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowtimesRepository extends JpaRepository<Showtimes,Integer> {
    @Query("SELECT COUNT(s) > 0 FROM Showtimes s WHERE s.room.id = :roomId " +
            "AND (:startTime < s.endTime AND :endTime > s.startTime)")
    boolean existsByRoomIdAndTimeOverlap(Integer roomId, LocalDateTime startTime, LocalDateTime endTime);
    List<Showtimes> findByMovieId(Integer movieId);
}
