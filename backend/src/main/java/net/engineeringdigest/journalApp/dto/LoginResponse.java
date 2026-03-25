package net.engineeringdigest.journalApp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String userName;
    private String email;
    private String userId;
    private List<String> roles;
    private String restaurantId;
}
