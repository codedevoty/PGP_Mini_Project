package net.engineeringdigest.journalApp.controller;

import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.dto.ApiResponse;
import net.engineeringdigest.journalApp.entity.TableInfo;
import net.engineeringdigest.journalApp.service.TableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/owner/tables")
@Slf4j
public class TableController {

    @Autowired
    private TableService tableService;

    @PostMapping("/{restaurantId}")
    public ResponseEntity<?> createTables(@PathVariable String restaurantId, @RequestBody Map<String, Integer> request) {
        try {
            int numberOfTables = request.getOrDefault("numberOfTables", 1);
            List<TableInfo> tables = tableService.createTables(restaurantId, numberOfTables);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, numberOfTables + " tables created!", tables));
        } catch (Exception e) {
            log.error("Create tables error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/{restaurantId}")
    public ResponseEntity<?> getTables(@PathVariable String restaurantId) {
        List<TableInfo> tables = tableService.getTablesByRestaurant(restaurantId);
        return ResponseEntity.ok(new ApiResponse(true, "Tables fetched", tables));
    }

    @GetMapping("/{restaurantId}/qr/{tableNumber}")
    public ResponseEntity<byte[]> getQrCode(@PathVariable String restaurantId, @PathVariable int tableNumber) {
        try {
            List<TableInfo> tables = tableService.getTablesByRestaurant(restaurantId);
            TableInfo table = tables.stream()
                    .filter(t -> t.getTableNumber() == tableNumber)
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Table not found"));

            byte[] qrImage = tableService.generateQrCodeImage(table.getQrCodeData(), 400, 400);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setContentLength(qrImage.length);
            return new ResponseEntity<>(qrImage, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("QR generation error: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{restaurantId}/qr-base64/{tableNumber}")
    public ResponseEntity<?> getQrCodeBase64(@PathVariable String restaurantId, @PathVariable int tableNumber) {
        try {
            List<TableInfo> tables = tableService.getTablesByRestaurant(restaurantId);
            TableInfo table = tables.stream()
                    .filter(t -> t.getTableNumber() == tableNumber)
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Table not found"));

            String base64 = tableService.generateQrCodeBase64(table.getQrCodeData());
            return ResponseEntity.ok(new ApiResponse(true, "QR generated", base64));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{tableId}")
    public ResponseEntity<?> deleteTable(@PathVariable String tableId) {
        try {
            tableService.deleteTable(tableId);
            return ResponseEntity.ok(new ApiResponse(true, "Table deleted!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }
}
