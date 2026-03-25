package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.entity.Order;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderRepository extends MongoRepository<Order, ObjectId> {

    List<Order> findByRestaurantIdAndStatus(String restaurantId, String status);

    List<Order> findByRestaurantIdOrderByOrderTimeDesc(String restaurantId);

    List<Order> findBySessionId(String sessionId);

    List<Order> findByTableId(String tableId);
}
