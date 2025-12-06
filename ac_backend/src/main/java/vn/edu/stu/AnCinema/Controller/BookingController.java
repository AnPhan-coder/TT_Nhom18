package vn.edu.stu.AnCinema.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.AnCinema.Entity.*;
import vn.edu.stu.AnCinema.Repository.*;
import vn.edu.stu.AnCinema.Service.BookingService;
import vn.edu.stu.AnCinema.dto.request.BookingsRequest;
import vn.edu.stu.AnCinema.dto.response.ApiResponse;
import vn.edu.stu.AnCinema.dto.response.SeatResponse;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // react goi vao
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingController {
    BookingService bookingService;

    @GetMapping("/seats")
    public ApiResponse<List<SeatResponse>> getSeatMap(@RequestParam Integer showtimeId) {
        return ApiResponse.<List<SeatResponse>>builder()
                .result(bookingService.getSeatMapByShowtime(showtimeId))
                .build();
    }
    @PostMapping
    public ApiResponse<Bookings> createBooking(@RequestBody BookingsRequest request) {
        return ApiResponse.<Bookings>builder()
                .result(bookingService.createBooking(request))
                .message("Đặt vé thành công! Vui lòng thanh toán.")
                .build();
    }
    @PostMapping("/{id}/pay")
    public ApiResponse<String> payBooking(@PathVariable Integer id) {
        bookingService.processPayment(id);
        return ApiResponse.<String>builder()
                .message("Thanh toán thành công! Vé đã được gửi tới email.")
                .build();
    }
    @GetMapping("/my-bookings")
    public ApiResponse<List<Bookings>> getMyBookings(@RequestParam Integer userId) {
        return ApiResponse.<List<Bookings>>builder()
                .result(bookingService.getMyBookings(userId))
                .build();
    }
}

