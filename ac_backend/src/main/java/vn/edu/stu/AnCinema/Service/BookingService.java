package vn.edu.stu.AnCinema.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.stu.AnCinema.Entity.*;
import vn.edu.stu.AnCinema.Repository.*;
import vn.edu.stu.AnCinema.dto.request.BookingsRequest;
import vn.edu.stu.AnCinema.dto.response.SeatResponse;
import vn.edu.stu.AnCinema.enums.BookingStatus;
import vn.edu.stu.AnCinema.enums.SeatType;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingService {
    BookingsRepository bookingsRepository;
    BookingDetailsRepository bookingDetailRepository;
    SeatsRepository seatsRepository;
    ShowtimesRepository showtimesRepository;
    UsersRepository usersRepository;
    EmailService emailService;

    public List<SeatResponse> getSeatMapByShowtime(Integer showtimeId) {
        Showtimes showtime = showtimesRepository.findById(showtimeId)
                .orElseThrow(() -> new RuntimeException("Suất chiếu không tồn tại"));

        List<Seats> allSeats = seatsRepository.findByRoomId(showtime.getRoom().getId());

        List<Integer> bookedSeatIds = bookingDetailRepository.findBookedSeatIdsByShowtimeId(showtimeId);

        return allSeats.stream().map(seat -> {
            boolean isBooked = bookedSeatIds.contains(seat.getId());
            double price = calculateTicketPrice(showtime, seat);

            return SeatResponse.builder()
                    .id(seat.getId())
                    .code(seat.getSeatCode())
                    .type(seat.getType())
                    .rowIndex(seat.getRowIndex())
                    .colIndex(seat.getColIndex())
                    .price(price)
                    .isBooked(isBooked)
                    .build();
        }).collect(Collectors.toList());
    }

    @Transactional(rollbackFor = Exception.class)
    public Bookings createBooking(BookingsRequest request) {
        Users user = usersRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        Showtimes showtime = showtimesRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new RuntimeException("Suất chiếu không tồn tại"));

        List<Integer> bookedSeatIds = bookingDetailRepository.findBookedSeatIdsByShowtimeId(showtime.getId());
        List<Seats> selectedSeats = seatsRepository.findAllById(request.getSeatIds());

        if (selectedSeats.size() != request.getSeatIds().size()) {
            throw new RuntimeException("Dữ liệu ghế không hợp lệ");
        }

        double totalPrice = 0;

        for (Seats seat : selectedSeats) {
            if (bookedSeatIds.contains(seat.getId())) {
                throw new RuntimeException("Ghế " + seat.getSeatCode() + " vừa được khách khác đặt. Vui lòng chọn lại!");
            }
            totalPrice += calculateTicketPrice(showtime, seat);
        }

        Bookings booking = Bookings.builder()
                .user(user)
                .showtime(showtime)
                .bookingTime(LocalDateTime.now())
                .status(BookingStatus.pending)
                .totalPrice(totalPrice)
                .build();

        Bookings savedBooking = bookingsRepository.save(booking);

        for (Seats seat : selectedSeats) {
            BookingDetails detail = BookingDetails.builder()
                    .booking(savedBooking)
                    .seat(seat)
                    .price(calculateTicketPrice(showtime, seat))
                    .build();
            bookingDetailRepository.save(detail);
        }

        return savedBooking;
    }

    double calculateTicketPrice(Showtimes showtime, Seats seat) {
        double basePrice = showtime.getBasePrice();

        if (seat.getType() == SeatType.VIP) {
            return basePrice + 10000;
        } else if (seat.getType() == SeatType.COUPLE) {
            return basePrice * 2;
        }
        return basePrice;
    }

    public void processPayment(Integer bookingId) {
        Bookings booking = bookingsRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

        if (booking.getStatus() == BookingStatus.paid) {
            throw new RuntimeException("Đơn hàng này đã được thanh toán rồi!");
        }

        booking.setStatus(BookingStatus.paid);
        bookingsRepository.save(booking);

        try {
            sendTicketEmail(booking);
        } catch (Exception e) {
            System.err.println("Lỗi gửi mail vé: " + e.getMessage());
        }
    }

    public List<Bookings> getMyBookings(Integer userId) {
        return bookingsRepository.findByUserIdOrderByBookingTimeDesc(userId);
    }

    void sendTicketEmail(Bookings booking) {
        String userEmail = booking.getUser().getEmail();
        String movieTitle = booking.getShowtime().getMovie().getTitle();
        String roomName = booking.getShowtime().getRoom().getName();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy");
        String showTime = booking.getShowtime().getStartTime().format(formatter);

        String seatCodes = booking.getBookingDetails().stream()
                .map(detail -> detail.getSeat().getSeatCode())
                .collect(Collectors.joining(", "));

        String subject = "Vé điện tử: " + movieTitle + " - " + seatCodes;

        String content = String.format("""
                        Xin chào %s,
                        
                        Cảm ơn bạn đã đặt vé tại AnCinema! Dưới đây là thông tin vé của bạn:
                        
                        -----------------------------------------
                        PHIM: %s
                        RẠP: %s (%s)
                        SUẤT CHIẾU: %s
                        GHẾ: %s
                        TỔNG TIỀN: %,.0f VND
                        -----------------------------------------
                        
                        Vui lòng đưa email này cho nhân viên soát vé khi đến rạp.
                        Chúc bạn xem phim vui vẻ!
                        
                        Trân trọng,
                        AnCinema Team
                        """,
                booking.getUser().getName(),
                movieTitle,
                roomName,
                showTime,
                seatCodes,
                booking.getTotalPrice()
        );

        emailService.sendEmail(userEmail, subject, content);
    }
}
