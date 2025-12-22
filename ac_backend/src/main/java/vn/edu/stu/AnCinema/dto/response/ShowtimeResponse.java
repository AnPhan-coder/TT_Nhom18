package vn.edu.stu.AnCinema.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import vn.edu.stu.AnCinema.Entity.Movies;
import vn.edu.stu.AnCinema.Entity.Rooms;

import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShowtimeResponse {
    Integer id;
    LocalDateTime startTime;
    LocalDateTime endTime;
    Double basePrice;
    boolean isActive;

    Movies movie;
    Rooms room;

    int notBooked;
    int totalSeats;
}
