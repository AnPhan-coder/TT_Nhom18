package vn.edu.stu.AnCinema.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.stu.AnCinema.Service.StatisticsService;
import vn.edu.stu.AnCinema.dto.response.ApiResponse;
import vn.edu.stu.AnCinema.dto.response.StatsResponse;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StatisticsController {
    StatisticsService statisticsService;

    @GetMapping
    public ApiResponse<StatsResponse> getDashboardStats() {
        return ApiResponse.<StatsResponse>builder()
                .result(statisticsService.getDashboardStats())
                .build();
    }
}