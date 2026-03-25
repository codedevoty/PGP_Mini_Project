package net.engineeringdigest.journalApp.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "menu_categories")
@Data
@NoArgsConstructor
public class MenuCategory {

    @Id
    private ObjectId id;

    private String name; // e.g., Starters, Main Course, Desserts

    private String restaurantId;

    private int sortOrder = 0; // For ordering categories in the menu

    private LocalDateTime createdAt = LocalDateTime.now();
}
