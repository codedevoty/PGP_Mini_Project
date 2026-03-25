package net.engineeringdigest.journalApp.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(to);
            mail.setSubject(subject);
            mail.setText(body);
            mail.setFrom("s.tsahilvarma04@gmail.com");
            javaMailSender.send(mail);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Exception while sending email to {}: {}", to, e.getMessage());
        }
    }

    public void sendVerificationEmail(String to, String token, String frontendUrl) {
        String verifyUrl = frontendUrl + "/verify-email?token=" + token;
        String body = "Welcome to Smart QR Restaurant!\n\n"
                + "Please verify your email by clicking the link below:\n\n"
                + verifyUrl + "\n\n"
                + "This link will expire in 24 hours.\n\n"
                + "Thank you!";
        sendEmail(to, "Verify Your Email - Smart QR Restaurant", body);
    }

    public void sendCredentialsEmail(String to, String userName, String password) {
        String body = "Welcome to Smart QR Restaurant!\n\n"
                + "Your account has been created successfully.\n\n"
                + "Here are your login credentials:\n"
                + "Username: " + userName + "\n"
                + "Password: " + password + "\n\n"
                + "Please login and change your password for security.\n\n"
                + "Thank you!";
        sendEmail(to, "Your Login Credentials - Smart QR Restaurant", body);
    }

    public void sendPasswordResetEmail(String to, String token, String frontendUrl) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        String body = "Smart QR Restaurant - Password Reset\n\n"
                + "Click the link below to reset your password:\n\n"
                + resetUrl + "\n\n"
                + "This link will expire in 1 hour.\n\n"
                + "If you didn't request this, please ignore this email.";
        sendEmail(to, "Password Reset - Smart QR Restaurant", body);
    }
}
