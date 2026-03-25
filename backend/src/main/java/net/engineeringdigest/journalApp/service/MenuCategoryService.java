package net.engineeringdigest.journalApp.service;

import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.entity.MenuCategory;
import net.engineeringdigest.journalApp.repository.DishRepository;
import net.engineeringdigest.journalApp.repository.MenuCategoryRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class MenuCategoryService {

    @Autowired
    private MenuCategoryRepository categoryRepository;

    @Autowired
    private DishRepository dishRepository;

    public MenuCategory createCategory(MenuCategory category) {
        category.setCreatedAt(LocalDateTime.now());
        log.info("Category created: {} for restaurant: {}", category.getName(), category.getRestaurantId());
        return categoryRepository.save(category);
    }

    public List<MenuCategory> getCategoriesByRestaurant(String restaurantId) {
        return categoryRepository.findByRestaurantIdOrderBySortOrder(restaurantId);
    }

    public Optional<MenuCategory> getById(String id) {
        return categoryRepository.findById(new ObjectId(id));
    }

    public MenuCategory updateCategory(String id, MenuCategory updates) {
        Optional<MenuCategory> existing = categoryRepository.findById(new ObjectId(id));
        if (!existing.isPresent()) {
            throw new RuntimeException("Category not found!");
        }
        MenuCategory category = existing.get();
        if (updates.getName() != null) category.setName(updates.getName());
        if (updates.getSortOrder() != 0) category.setSortOrder(updates.getSortOrder());
        log.info("Category updated: {}", category.getName());
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(String id) {
        // Also delete all dishes in this category
        dishRepository.deleteByCategoryId(id);
        categoryRepository.deleteById(new ObjectId(id));
        log.info("Category deleted: {}", id);
    }
}
