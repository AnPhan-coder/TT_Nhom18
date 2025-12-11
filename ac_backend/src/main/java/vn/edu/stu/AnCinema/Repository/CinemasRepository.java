package vn.edu.stu.AnCinema.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.stu.AnCinema.Entity.Cinemas;

import java.util.Optional;

public interface CinemasRepository extends JpaRepository<Cinemas, Integer> {
}
