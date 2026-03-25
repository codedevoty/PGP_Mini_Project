package net.engineeringdigest.journalApp.controller;

import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.dto.ApiResponse;
import net.engineeringdigest.journalApp.entity.Dish;
import net.engineeringdigest.journalApp.entity.MenuCategory;
import net.engineeringdigest.journalApp.entity.Restaurant;
import net.engineeringdigest.journalApp.service.DishService;
import net.engineeringdigest.journalApp.service.MenuCategoryService;
import net.engineeringdigest.journalApp.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/public")
@Slf4j
public class PublicMenuController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private MenuCategoryService categoryService;

    @Autowired
    private DishService dishService;

    // Get full menu for customer (no auth required)
    @GetMapping("/menu/{restaurantId}")
    public ResponseEntity<?> getFullMenu(@PathVariable String restaurantId) {
        try {
            Optional<Restaurant> restaurant = restaurantService.getById(restaurantId);
            if (!restaurant.isPresent()) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Restaurant not found"));
            }

            List<MenuCategory> categories = categoryService.getCategoriesByRestaurant(restaurantId);
            List<Map<String, Object>> menuData = new ArrayList<>();

            for (MenuCategory category : categories) {
                Map<String, Object> categoryMap = new LinkedHashMap<>();
                categoryMap.put("category", category);
                List<Dish> dishes = dishService.getDishesByCategory(category.getId().toHexString());
                categoryMap.put("dishes", dishes);
                menuData.add(categoryMap);
            }

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("restaurant", restaurant.get());
            response.put("menu", menuData);

            return ResponseEntity.ok(new ApiResponse(true, "Menu fetched", response));
        } catch (Exception e) {
            log.error("Get menu error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Search dishes (no auth required)
    @GetMapping("/menu/{restaurantId}/search")
    public ResponseEntity<?> searchDishes(@PathVariable String restaurantId, @RequestParam String query) {
        List<Dish> dishes = dishService.searchDishes(restaurantId, query);
        return ResponseEntity.ok(new ApiResponse(true, "Search results", dishes));
    }

    // Filter dishes by tag
    @GetMapping("/menu/{restaurantId}/filter")
    public ResponseEntity<?> filterByTag(@PathVariable String restaurantId, @RequestParam String tag) {
        List<Dish> dishes = dishService.getDishesByTag(restaurantId, tag);
        return ResponseEntity.ok(new ApiResponse(true, "Filtered results", dishes));
    }

    // Get restaurant info
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<?> getRestaurant(@PathVariable String restaurantId) {
        Optional<Restaurant> restaurant = restaurantService.getById(restaurantId);
        if (restaurant.isPresent()) {
            return ResponseEntity.ok(new ApiResponse(true, "Restaurant info", restaurant.get()));
        }
        return ResponseEntity.badRequest().body(new ApiResponse(false, "Restaurant not found"));
    }
}
