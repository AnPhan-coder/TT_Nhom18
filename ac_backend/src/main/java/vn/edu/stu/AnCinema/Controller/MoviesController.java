package vn.edu.stu.AnCinema.Controller;


import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.AnCinema.Entity.Movies;
import vn.edu.stu.AnCinema.Repository.MoviesRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // react goi vao
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MoviesController {
    @Autowired
    MoviesRepository moviesRepository;

    @GetMapping
    public List<Movies> getAllMovies(){
        return moviesRepository.findAll();
    }
    @GetMapping("/{id}")
    public Optional<Movies> getMovieById(@PathVariable Integer id) {
        return moviesRepository.findById(id);
    }
}
