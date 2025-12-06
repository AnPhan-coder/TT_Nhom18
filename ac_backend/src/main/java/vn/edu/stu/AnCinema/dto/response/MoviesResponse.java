package vn.edu.stu.AnCinema.dto.response;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.stu.AnCinema.enums.MoviesStatus;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MoviesResponse {
    Integer id;
    String title;
    String description;
    Integer duration;
    String genre;
    String director;
    String trailerUrl;
    String posterUrl;
    @Enumerated(EnumType.STRING)
    MoviesStatus status;
}
