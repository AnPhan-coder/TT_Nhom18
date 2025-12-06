package vn.edu.stu.AnCinema.dto.request;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    String email;
    String otp;
    String newPassword;
}