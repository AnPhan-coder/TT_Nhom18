package vn.edu.stu.AnCinema.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.stu.AnCinema.Entity.Seats;

import java.util.List;

@Repository
public interface SeatsRepository extends JpaRepository<Seats, Integer> {
    List<Seats> findByRoomId(Integer roomId);
    void deleteAllByRoomId(Integer roomId);
    int countByRoomIdAndIsActiveTrue(Integer roomId);
}
