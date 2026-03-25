package net.engineeringdigest.journalApp.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "email_verification_tokens")
@Data
@NoArgsConstructor
public class EmailVerificationToken {

    @Id
    private ObjectId id;

    private String token;

    private String userId;

    private String email;

    private LocalDateTime expiryDate;

    private boolean used = false;
}
