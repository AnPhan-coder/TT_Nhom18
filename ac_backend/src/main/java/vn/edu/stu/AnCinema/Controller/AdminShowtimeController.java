package vn.edu.stu.AnCinema.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.AnCinema.Entity.Showtimes;
import vn.edu.stu.AnCinema.Service.ShowtimeService;
import vn.edu.stu.AnCinema.dto.request.ShowtimeRequest;
import vn.edu.stu.AnCinema.dto.response.ApiResponse;

@RestController
@RequestMapping("/api/admin/showtimes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminShowtimeController {
    ShowtimeService showtimeService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Showtimes> createShowtime(@RequestBody ShowtimeRequest request) {
        return ApiResponse.<Showtimes>builder()
                .result(showtimeService.createShowtime(request))
                .message("Tạo lịch chiếu thành công!")
                .build();
    }
}
