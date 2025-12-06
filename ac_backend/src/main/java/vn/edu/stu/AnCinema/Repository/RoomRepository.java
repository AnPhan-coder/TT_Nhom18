package vn.edu.stu.AnCinema.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.stu.AnCinema.Entity.Rooms;

import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Rooms, Integer> {
    Optional<Rooms> findById(Integer roomId);
}
