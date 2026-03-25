package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.entity.Dish;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DishRepository extends MongoRepository<Dish, ObjectId> {

    List<Dish> findByCategoryId(String categoryId);

    List<Dish> findByRestaurantId(String restaurantId);

    List<Dish> findByRestaurantIdAndTagsContaining(String restaurantId, String tag);

    List<Dish> findByRestaurantIdAndNameContainingIgnoreCase(String restaurantId, String name);

    void deleteByCategoryId(String categoryId);
}
