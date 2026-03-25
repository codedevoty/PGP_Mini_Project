package net.engineeringdigest.journalApp.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "tables")
@Data
@NoArgsConstructor
public class TableInfo {

    @Id
    private ObjectId id;

    private int tableNumber;

    private String restaurantId;

    private String qrCodeData; // Base64 encoded QR image or URL

    private boolean isOccupied = false;

    private String activeSessionId;
}
