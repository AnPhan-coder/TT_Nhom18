package vn.edu.stu.AnCinema.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.AnCinema.Entity.Seats;
import vn.edu.stu.AnCinema.Repository.SeatsRepository;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // react goi vao
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SeatsController {
    SeatsRepository seatsRepository;

    @GetMapping
    public List<Seats> getSeatsByRoom(@RequestParam Integer roomId) {
        return seatsRepository.findByRoomId(roomId);
    }

}
