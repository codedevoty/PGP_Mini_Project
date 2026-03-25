package net.engineeringdigest.journalApp.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
public class OrderItem {

    private String dishId;

    private String dishName;

    private int quantity;

    private double price;

    private String notes; // Special instructions: "No onion", "Extra spicy"

    private List<String> selectedCustomizations = new ArrayList<>(); // Names of selected customizations
}
