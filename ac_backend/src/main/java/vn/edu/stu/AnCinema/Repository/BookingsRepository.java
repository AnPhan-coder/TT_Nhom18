package vn.edu.stu.AnCinema.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.stu.AnCinema.Entity.Bookings;
import vn.edu.stu.AnCinema.enums.BookingStatus;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingsRepository extends JpaRepository<Bookings, Integer> {
    List<Bookings> findByUserIdOrderByBookingTimeDesc(Integer userId);
    @Query("SELECT b FROM Bookings b WHERE b.status = :status AND b.bookingTime < :time")
    List<Bookings> findExpiredBookings(@Param("time") LocalDateTime time, @Param("status") BookingStatus status);

    List<Bookings> findByUserId(Integer userId);
}
