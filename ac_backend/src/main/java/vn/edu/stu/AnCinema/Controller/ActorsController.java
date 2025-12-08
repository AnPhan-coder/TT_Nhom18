package vn.edu.stu.AnCinema.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.stu.AnCinema.Entity.Actors;
import vn.edu.stu.AnCinema.Repository.ActorsRepository;

import java.util.List;

@RestController
@RequestMapping("/api/actors")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ActorsController {
    ActorsRepository actorsRepository;

    @GetMapping
    public List<Actors> getAllActors() {
        return actorsRepository.findAll();
    }
}
