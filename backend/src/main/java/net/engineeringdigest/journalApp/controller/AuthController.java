package net.engineeringdigest.journalApp.controller;

import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.dto.*;
import net.engineeringdigest.journalApp.entity.User;
import net.engineeringdigest.journalApp.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse> signup(@RequestBody SignupRequest request) {
        try {
            User user = authService.signup(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Registration successful! Please check your email for verification.", user.getUserName()));
        } catch (RuntimeException e) {
            log.error("Signup error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, "Invalid username or password"));
        }
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse> verifyEmail(@RequestParam String token) {
        try {
            boolean verified = authService.verifyEmail(token);
            if (verified) {
                return ResponseEntity.ok(new ApiResponse(true, "Email verified successfully!"));
            }
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Email verification failed"));
        } catch (RuntimeException e) {
            log.error("Email verification error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        try {
            authService.forgotPassword(request.get("email"));
            return ResponseEntity.ok(new ApiResponse(true, "Password reset email sent!"));
        } catch (RuntimeException e) {
            log.error("Forgot password error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
