package vn.edu.stu.AnCinema.Controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import vn.edu.stu.AnCinema.Entity.Users;
import vn.edu.stu.AnCinema.Service.UserService;
import vn.edu.stu.AnCinema.dto.request.UserUpdateRequest;
import vn.edu.stu.AnCinema.dto.response.ApiResponse;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
    UserService userService;

    @PutMapping("/{id}")
    public ApiResponse<Users> updateUser(@PathVariable Integer id, @RequestBody UserUpdateRequest request) {
        return ApiResponse.<Users>builder()
                .result(userService.updateUser(id, request))
                .message("Cập nhật thông tin thành công!")
                .build();
    }
}
