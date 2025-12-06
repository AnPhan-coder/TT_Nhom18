package vn.edu.stu.AnCinema.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.stu.AnCinema.Entity.Bookings;

import java.util.List;

@Repository
public interface BookingsRepository extends JpaRepository<Bookings, Integer> {
    List<Bookings> findByUserIdOrderByBookingTimeDesc(Integer userId);
}
