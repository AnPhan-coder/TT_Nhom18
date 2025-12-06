package vn.edu.stu.AnCinema.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.stu.AnCinema.Entity.Rooms;
import vn.edu.stu.AnCinema.Repository.RoomRepository;
import vn.edu.stu.AnCinema.dto.response.ApiResponse;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // react goi vao
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoomController {
    RoomRepository roomRepository;
    @GetMapping
    public ApiResponse<List<Rooms>> getAllRooms() {
        return ApiResponse.<List<Rooms>>builder()
                .result(roomRepository.findAll())
                .build();
    }
}
