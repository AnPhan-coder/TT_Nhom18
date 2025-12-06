package vn.edu.stu.AnCinema.Repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.stu.AnCinema.Entity.Movies;
import vn.edu.stu.AnCinema.Entity.Rooms;
import vn.edu.stu.AnCinema.Entity.Seats;

import java.util.List;
import java.util.Optional;

@Repository
public interface MoviesRepository extends JpaRepository<Movies, String> {
    boolean existsByTitle(String title);
    Optional<Movies> findById(Integer movieId);

    Optional<Movies> findByTitle(String title);
}
