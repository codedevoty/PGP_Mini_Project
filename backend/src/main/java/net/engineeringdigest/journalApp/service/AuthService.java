package net.engineeringdigest.journalApp.service;

import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.dto.LoginRequest;
import net.engineeringdigest.journalApp.dto.LoginResponse;
import net.engineeringdigest.journalApp.dto.SignupRequest;
import net.engineeringdigest.journalApp.entity.EmailVerificationToken;
import net.engineeringdigest.journalApp.entity.User;
import net.engineeringdigest.journalApp.repository.EmailVerificationTokenRepository;
import net.engineeringdigest.journalApp.util.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private EmailVerificationTokenRepository tokenRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUserName(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateToken(authentication);

        User user = userService.findByUserName(request.getUserName());
        log.info("User logged in successfully: {}", user.getUserName());

        return new LoginResponse(
                jwt,
                user.getUserName(),
                user.getEmail(),
                user.getId().toHexString(),
                user.getRoles(),
                user.getRestaurantId()
        );
    }

    public User signup(SignupRequest request) {
        if (userService.existsByUserName(request.getUserName())) {
            throw new RuntimeException("Username is already taken!");
        }
        if (userService.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }

        User user = userService.registerUser(
                request.getUserName(),
                request.getEmail(),
                request.getPassword(),
                request.getRole()
        );

        // Generate email verification token
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUserId(user.getId().toHexString());
        verificationToken.setEmail(user.getEmail());
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        tokenRepository.save(verificationToken);

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), token, frontendUrl);

        // Send credentials email
        emailService.sendCredentialsEmail(user.getEmail(), user.getUserName(), request.getPassword());

        log.info("User registered successfully: {}", user.getUserName());
        return user;
    }

    public boolean verifyEmail(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token);
        if (verificationToken == null) {
            throw new RuntimeException("Invalid verification token!");
        }
        if (verificationToken.isUsed()) {
            throw new RuntimeException("Token already used!");
        }
        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired!");
        }

        User user = userService.findByEmail(verificationToken.getEmail());
        if (user != null) {
            user.setEmailVerified(true);
            userService.saveUser(user);
            verificationToken.setUsed(true);
            tokenRepository.save(verificationToken);
            log.info("Email verified for user: {}", user.getUserName());
            return true;
        }
        return false;
    }

    public void forgotPassword(String email) {
        User user = userService.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("No user found with this email!");
        }
        String token = UUID.randomUUID().toString();
        EmailVerificationToken resetToken = new EmailVerificationToken();
        resetToken.setToken(token);
        resetToken.setUserId(user.getId().toHexString());
        resetToken.setEmail(email);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        tokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(email, token, frontendUrl);
        log.info("Password reset email sent to: {}", email);
    }
}
