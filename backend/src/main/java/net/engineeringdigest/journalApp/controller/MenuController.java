package net.engineeringdigest.journalApp.controller;

import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.dto.ApiResponse;
import net.engineeringdigest.journalApp.entity.Dish;
import net.engineeringdigest.journalApp.entity.MenuCategory;
import net.engineeringdigest.journalApp.service.DishService;
import net.engineeringdigest.journalApp.service.MenuCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner/menu")
@Slf4j
public class MenuController {

    @Autowired
    private MenuCategoryService categoryService;

    @Autowired
    private DishService dishService;

    // ============ CATEGORY ENDPOINTS ============

    @PostMapping("/category")
    public ResponseEntity<?> createCategory(@RequestBody MenuCategory category) {
        try {
            MenuCategory created = categoryService.createCategory(category);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Category created!", created));
        } catch (Exception e) {
            log.error("Create category error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/categories/{restaurantId}")
    public ResponseEntity<?> getCategories(@PathVariable String restaurantId) {
        List<MenuCategory> categories = categoryService.getCategoriesByRestaurant(restaurantId);
        return ResponseEntity.ok(new ApiResponse(true, "Categories fetched", categories));
    }

    @PutMapping("/category/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable String id, @RequestBody MenuCategory updates) {
        try {
            MenuCategory updated = categoryService.updateCategory(id, updates);
            return ResponseEntity.ok(new ApiResponse(true, "Category updated!", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/category/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable String id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(new ApiResponse(true, "Category and its dishes deleted!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    // ============ DISH ENDPOINTS ============

    @PostMapping("/dish")
    public ResponseEntity<?> createDish(@RequestBody Dish dish) {
        try {
            Dish created = dishService.createDish(dish);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Dish created!", created));
        } catch (Exception e) {
            log.error("Create dish error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/dishes/category/{categoryId}")
    public ResponseEntity<?> getDishesByCategory(@PathVariable String categoryId) {
        List<Dish> dishes = dishService.getDishesByCategory(categoryId);
        return ResponseEntity.ok(new ApiResponse(true, "Dishes fetched", dishes));
    }

    @GetMapping("/dishes/restaurant/{restaurantId}")
    public ResponseEntity<?> getDishesByRestaurant(@PathVariable String restaurantId) {
        List<Dish> dishes = dishService.getDishesByRestaurant(restaurantId);
        return ResponseEntity.ok(new ApiResponse(true, "Dishes fetched", dishes));
    }

    @PutMapping("/dish/{id}")
    public ResponseEntity<?> updateDish(@PathVariable String id, @RequestBody Dish updates) {
        try {
            Dish updated = dishService.updateDish(id, updates);
            return ResponseEntity.ok(new ApiResponse(true, "Dish updated!", updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/dish/{id}")
    public ResponseEntity<?> deleteDish(@PathVariable String id) {
        try {
            dishService.deleteDish(id);
            return ResponseEntity.ok(new ApiResponse(true, "Dish deleted!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
