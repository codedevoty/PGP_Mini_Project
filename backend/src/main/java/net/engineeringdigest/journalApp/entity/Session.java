package net.engineeringdigest.journalApp.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "sessions")
@Data
@NoArgsConstructor
public class Session {

    @Id
    private ObjectId id;

    private String tableId;

    private int tableNumber;

    private String restaurantId;

    private String status = "ACTIVE"; // ACTIVE, COMPLETED

    private LocalDateTime startTime = LocalDateTime.now();

    private LocalDateTime endTime;

    private List<String> orderIds = new ArrayList<>(); // Order ObjectIds as strings

    private double totalAmount = 0.0;

    private String paymentMethod; // CASH, UPI, CARD

    private boolean isPaid = false;
}
