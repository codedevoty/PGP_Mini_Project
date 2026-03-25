package net.engineeringdigest.journalApp.dto;

import lombok.Data;
import net.engineeringdigest.journalApp.entity.OrderItem;

import java.util.ArrayList;
import java.util.List;

@Data
public class OrderRequest {
    private String tableId;
    private int tableNumber;
    private String restaurantId;
    private String sessionId;
    private List<OrderItem> items = new ArrayList<>();
    private String specialInstructions;
}
