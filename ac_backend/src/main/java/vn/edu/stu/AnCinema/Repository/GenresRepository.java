package vn.edu.stu.AnCinema.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.stu.AnCinema.Entity.Genres;

import java.util.List;

public interface GenresRepository extends JpaRepository<Genres, Integer> {
    @Override
    List<Genres> findAllById(Iterable<Integer> integers);
}
