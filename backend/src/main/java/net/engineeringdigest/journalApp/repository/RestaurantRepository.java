package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.entity.Restaurant;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RestaurantRepository extends MongoRepository<Restaurant, ObjectId> {

    Restaurant findByOwnerId(String ownerId);
}
