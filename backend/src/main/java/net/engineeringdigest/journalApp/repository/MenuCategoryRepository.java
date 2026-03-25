package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.entity.MenuCategory;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MenuCategoryRepository extends MongoRepository<MenuCategory, ObjectId> {

    List<MenuCategory> findByRestaurantIdOrderBySortOrder(String restaurantId);

    void deleteByRestaurantId(String restaurantId);
}
