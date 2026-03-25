package net.engineeringdigest.journalApp.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "orders")
@Data
@NoArgsConstructor
public class Order {

    @Id
    private ObjectId id;

    private String sessionId;

    private String tableId;

    private int tableNumber;

    private String restaurantId;

    private List<OrderItem> items = new ArrayList<>();

    private String status = "PENDING"; // PENDING, PREPARING, SERVED, CANCELLED

    private String specialInstructions;

    private LocalDateTime orderTime = LocalDateTime.now();

    private double totalAmount;
}
