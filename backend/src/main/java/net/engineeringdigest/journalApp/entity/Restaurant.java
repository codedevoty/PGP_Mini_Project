package net.engineeringdigest.journalApp.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "restaurants")
@Data
@NoArgsConstructor
public class Restaurant {

    @Id
    private ObjectId id;

    private String name;

    private String address;

    private String phone;

    private List<String> cuisineTypes = new ArrayList<>(); // Multi-select: Indian, Chinese, Italian, etc.

    private String openingTime; // "09:00"

    private String closingTime; // "23:00"

    private String gstInfo;

    private String ownerId; // User ObjectId as string

    private String menuTheme = "LIGHT"; // LIGHT, DARK, MINIMAL, PREMIUM

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();
}
