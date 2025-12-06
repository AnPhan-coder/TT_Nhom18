package vn.edu.stu.AnCinema.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.edu.stu.AnCinema.Entity.BookingDetails;
import vn.edu.stu.AnCinema.Entity.Bookings;

import java.util.List;

@Repository
public interface BookingDetailsRepository extends JpaRepository<BookingDetails, Integer> {
    //lay danh sach id dat dat ghe, trang thai != canceled
    @Query("SELECT bd.seat.id FROM BookingDetails bd " +
            "WHERE bd.booking.showtime.id = :showtimeId " +
            "AND bd.booking.status <> 'CANCELLED'")
    List<Integer> findBookedSeatIdsByShowtimeId(@Param("showtimeId") Integer showtimeId);
}
