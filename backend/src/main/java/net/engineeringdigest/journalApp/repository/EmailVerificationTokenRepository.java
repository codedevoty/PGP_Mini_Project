package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.entity.EmailVerificationToken;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EmailVerificationTokenRepository extends MongoRepository<EmailVerificationToken, ObjectId> {

    EmailVerificationToken findByToken(String token);

    EmailVerificationToken findByUserId(String userId);
}
