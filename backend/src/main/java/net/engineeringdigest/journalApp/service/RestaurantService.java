package net.engineeringdigest.journalApp.service;

import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.entity.Restaurant;
import net.engineeringdigest.journalApp.entity.User;
import net.engineeringdigest.journalApp.repository.RestaurantRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Slf4j
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private UserService userService;

    @Transactional
    public Restaurant createRestaurant(Restaurant restaurant, String userName) {
        User user = userService.findByUserName(userName);
        if (user == null) {
            throw new RuntimeException("User not found!");
        }

        // Check if owner already has a restaurant
        Restaurant existing = restaurantRepository.findByOwnerId(user.getId().toHexString());
        if (existing != null) {
            throw new RuntimeException("Owner already has a restaurant registered!");
        }

        restaurant.setOwnerId(user.getId().toHexString());
        restaurant.setCreatedAt(LocalDateTime.now());
        restaurant.setUpdatedAt(LocalDateTime.now());
        Restaurant saved = restaurantRepository.save(restaurant);

        // Link restaurant to user
        user.setRestaurantId(saved.getId().toHexString());
        userService.saveUser(user);

        log.info("Restaurant created: {} by owner: {}", saved.getName(), userName);
        return saved;
    }

    public Restaurant getByOwnerId(String ownerId) {
        return restaurantRepository.findByOwnerId(ownerId);
    }

    public Optional<Restaurant> getById(String id) {
        return restaurantRepository.findById(new ObjectId(id));
    }

    public Restaurant updateRestaurant(String id, Restaurant updates) {
        Optional<Restaurant> existing = restaurantRepository.findById(new ObjectId(id));
        if (!existing.isPresent()) {
            throw new RuntimeException("Restaurant not found!");
        }
        Restaurant restaurant = existing.get();
        if (updates.getName() != null) restaurant.setName(updates.getName());
        if (updates.getAddress() != null) restaurant.setAddress(updates.getAddress());
        if (updates.getPhone() != null) restaurant.setPhone(updates.getPhone());
        if (updates.getCuisineTypes() != null) restaurant.setCuisineTypes(updates.getCuisineTypes());
        if (updates.getOpeningTime() != null) restaurant.setOpeningTime(updates.getOpeningTime());
        if (updates.getClosingTime() != null) restaurant.setClosingTime(updates.getClosingTime());
        if (updates.getGstInfo() != null) restaurant.setGstInfo(updates.getGstInfo());
        if (updates.getMenuTheme() != null) restaurant.setMenuTheme(updates.getMenuTheme());
        restaurant.setUpdatedAt(LocalDateTime.now());

        log.info("Restaurant updated: {}", restaurant.getName());
        return restaurantRepository.save(restaurant);
    }
}
