package vn.edu.stu.AnCinema.Service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.stu.AnCinema.Entity.Cinemas;
import vn.edu.stu.AnCinema.Entity.Rooms;
import vn.edu.stu.AnCinema.Entity.Seats;
import vn.edu.stu.AnCinema.Repository.CinemasRepository;
import vn.edu.stu.AnCinema.Repository.RoomRepository;
import vn.edu.stu.AnCinema.Repository.SeatsRepository;
import vn.edu.stu.AnCinema.dto.request.RoomRequest;
import vn.edu.stu.AnCinema.enums.SeatType;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoomService {
    RoomRepository roomRepository;
    SeatsRepository seatsRepository;
    CinemasRepository cinemasRepository;

    @Transactional
    public Rooms createRoom(RoomRequest request) {
        Cinemas cinemas = cinemasRepository.findById(1).orElseThrow();
        Rooms room = Rooms.builder()
                .name(request.getName())
                .cinema(cinemas)
                .totalCols(request.getTotalCols())
                .totalRows(request.getTotalRows())
                .build();

        Rooms savedRoom = roomRepository.save(room);

        generateSeats(savedRoom, request.getTotalRows(), request.getTotalCols());

        return savedRoom;
    }

    void generateSeats(Rooms room, int rows, int cols) {
        List<Seats> seats = new ArrayList<>();

        for (int r = 1; r <= rows; r++) {
            char rowChar = (char) ('A' + r - 1);

            for (int c = 1; c <= cols; c++) {
                String seatCode = rowChar + String.valueOf(c);

                SeatType type = SeatType.NORMAL;
                if (r > rows - 7) {
                    type = SeatType.VIP;
                } else if (r > rows - 2) {
                    type = SeatType.COUPLE;
                }

                Seats seat = Seats.builder()
                        .room(room)
                        .seatCode(seatCode)
                        .rowIndex(r)
                        .colIndex(c)
                        .type(type)
                        .build();
                seats.add(seat);
            }
        }
        seatsRepository.saveAll(seats);
    }
    public Rooms updateRoom(Integer id, RoomRequest request) {
        Rooms room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Phòng không tồn tại"));
        room.setName(request.getName());
        return roomRepository.save(room);
    }

    public void deleteRoom(Integer id) {
        roomRepository.deleteById(id);
    }
}
