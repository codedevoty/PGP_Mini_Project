package net.engineeringdigest.journalApp.controller;

import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.dto.ApiResponse;
import net.engineeringdigest.journalApp.entity.Restaurant;
import net.engineeringdigest.journalApp.entity.User;
import net.engineeringdigest.journalApp.service.RestaurantService;
import net.engineeringdigest.journalApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owner/restaurant")
@Slf4j
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> createRestaurant(@RequestBody Restaurant restaurant, Authentication authentication) {
        try {
            Restaurant created = restaurantService.createRestaurant(restaurant, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Restaurant registered successfully!", created));
        } catch (RuntimeException e) {
            log.error("Create restaurant error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getMyRestaurant(Authentication authentication) {
        try {
            User user = userService.findByUserName(authentication.getName());
            Restaurant restaurant = restaurantService.getByOwnerId(user.getId().toHexString());
            if (restaurant == null) {
                return ResponseEntity.ok(new ApiResponse(false, "No restaurant found. Please register your restaurant."));
            }
            return ResponseEntity.ok(new ApiResponse(true, "Restaurant found", restaurant));
        } catch (Exception e) {
            log.error("Get restaurant error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRestaurant(@PathVariable String id, @RequestBody Restaurant updates) {
        try {
            Restaurant updated = restaurantService.updateRestaurant(id, updates);
            return ResponseEntity.ok(new ApiResponse(true, "Restaurant updated successfully!", updated));
        } catch (RuntimeException e) {
            log.error("Update restaurant error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
