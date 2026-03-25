package net.engineeringdigest.journalApp.service;

import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.entity.Dish;
import net.engineeringdigest.journalApp.repository.DishRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class DishService {

    @Autowired
    private DishRepository dishRepository;

    public Dish createDish(Dish dish) {
        dish.setCreatedAt(LocalDateTime.now());
        dish.setUpdatedAt(LocalDateTime.now());
        log.info("Dish created: {} in category: {}", dish.getName(), dish.getCategoryId());
        return dishRepository.save(dish);
    }

    public List<Dish> getDishesByCategory(String categoryId) {
        return dishRepository.findByCategoryId(categoryId);
    }

    public List<Dish> getDishesByRestaurant(String restaurantId) {
        return dishRepository.findByRestaurantId(restaurantId);
    }

    public List<Dish> searchDishes(String restaurantId, String query) {
        return dishRepository.findByRestaurantIdAndNameContainingIgnoreCase(restaurantId, query);
    }

    public List<Dish> getDishesByTag(String restaurantId, String tag) {
        return dishRepository.findByRestaurantIdAndTagsContaining(restaurantId, tag);
    }

    public Optional<Dish> getById(String id) {
        return dishRepository.findById(new ObjectId(id));
    }

    public Dish updateDish(String id, Dish updates) {
        Optional<Dish> existing = dishRepository.findById(new ObjectId(id));
        if (!existing.isPresent()) {
            throw new RuntimeException("Dish not found!");
        }
        Dish dish = existing.get();
        if (updates.getName() != null) dish.setName(updates.getName());
        if (updates.getDescription() != null) dish.setDescription(updates.getDescription());
        if (updates.getPrice() > 0) dish.setPrice(updates.getPrice());
        if (updates.getImageUrl() != null) dish.setImageUrl(updates.getImageUrl());
        if (updates.getTags() != null) dish.setTags(updates.getTags());
        if (updates.getCustomizationOptions() != null) dish.setCustomizationOptions(updates.getCustomizationOptions());
        dish.setAvailable(updates.isAvailable());
        dish.setUpdatedAt(LocalDateTime.now());
        log.info("Dish updated: {}", dish.getName());
        return dishRepository.save(dish);
    }

    public void deleteDish(String id) {
        dishRepository.deleteById(new ObjectId(id));
        log.info("Dish deleted: {}", id);
    }
}
