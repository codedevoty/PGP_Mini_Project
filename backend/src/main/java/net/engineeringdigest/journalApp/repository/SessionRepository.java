package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.entity.Session;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SessionRepository extends MongoRepository<Session, ObjectId> {

    Session findByTableIdAndStatus(String tableId, String status);

    List<Session> findByRestaurantId(String restaurantId);

    List<Session> findByRestaurantIdAndStatus(String restaurantId, String status);
}
