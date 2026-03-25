package net.engineeringdigest.journalApp.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "dishes")
@Data
@NoArgsConstructor
public class Dish {

    @Id
    private ObjectId id;

    private String name;

    private String description;

    private double price;

    private String imageUrl;

    private List<String> tags = new ArrayList<>();
    // Tags: TODAY_SPECIAL, MOST_POPULAR, CHEF_CHOICE, MOST_ORDERED, SPICY, VEG, NON_VEG, JAIN, OUR_SPECIALITY

    private String categoryId;

    private String restaurantId;

    private List<CustomizationOption> customizationOptions = new ArrayList<>();

    private boolean available = true;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();
}
