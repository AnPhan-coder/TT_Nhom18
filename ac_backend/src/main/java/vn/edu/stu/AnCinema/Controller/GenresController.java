package vn.edu.stu.AnCinema.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.stu.AnCinema.Entity.Genres;
import vn.edu.stu.AnCinema.Repository.GenresRepository;

import java.util.List;

@RestController
@RequestMapping("/api/genres")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GenresController {
    GenresRepository genresRepository;

    @GetMapping
    public List<Genres> getAllGenres() {
        return genresRepository.findAll();
    }
}
