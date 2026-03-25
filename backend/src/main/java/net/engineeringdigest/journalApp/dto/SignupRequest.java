package net.engineeringdigest.journalApp.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String userName;
    private String email;
    private String password;
    private String role; // OWNER or CUSTOMER
}
