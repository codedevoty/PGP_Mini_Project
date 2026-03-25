package net.engineeringdigest.journalApp.entity;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CustomizationOption {

    private String name; // e.g., "Extra Cheese", "No Onion"

    private String type; // ADD_ON, REMOVAL

    private double extraPrice; // 0 for removals, price for add-ons
}
