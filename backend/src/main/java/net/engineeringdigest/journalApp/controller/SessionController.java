package net.engineeringdigest.journalApp.controller;

import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.dto.ApiResponse;
import net.engineeringdigest.journalApp.entity.Session;
import net.engineeringdigest.journalApp.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@Slf4j
public class SessionController {

    @Autowired
    private SessionService sessionService;

    // Start a session when customer scans QR (public)
    @PostMapping("/api/order/session/start")
    public ResponseEntity<?> startSession(@RequestBody Map<String, Object> request) {
        try {
            String tableId = (String) request.get("tableId");
            int tableNumber = (int) request.get("tableNumber");
            String restaurantId = (String) request.get("restaurantId");

            Session session = sessionService.startSession(tableId, tableNumber, restaurantId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Session started!", session));
        } catch (Exception e) {
            log.error("Start session error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Get bill for a session (public)
    @GetMapping("/api/order/session/{sessionId}/bill")
    public ResponseEntity<?> getBill(@PathVariable String sessionId) {
        try {
            Session session = sessionService.generateBill(sessionId);
            return ResponseEntity.ok(new ApiResponse(true, "Bill generated", session));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Complete payment (public)
    @PutMapping("/api/order/session/{sessionId}/pay")
    public ResponseEntity<?> payBill(@PathVariable String sessionId, @RequestBody Map<String, String> request) {
        try {
            String paymentMethod = request.getOrDefault("paymentMethod", "CASH");
            Session session = sessionService.completeSession(sessionId, paymentMethod);
            return ResponseEntity.ok(new ApiResponse(true, "Payment successful! Session completed.", session));
        } catch (RuntimeException e) {
            log.error("Payment error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Owner views active sessions
    @GetMapping("/api/owner/sessions/{restaurantId}")
    public ResponseEntity<?> getActiveSessions(@PathVariable String restaurantId) {
        List<Session> sessions = sessionService.getActiveSessionsByRestaurant(restaurantId);
        return ResponseEntity.ok(new ApiResponse(true, "Active sessions fetched", sessions));
    }

    // Owner views all sessions (history)
    @GetMapping("/api/owner/sessions/{restaurantId}/all")
    public ResponseEntity<?> getAllSessions(@PathVariable String restaurantId) {
        List<Session> sessions = sessionService.getSessionsByRestaurant(restaurantId);
        return ResponseEntity.ok(new ApiResponse(true, "All sessions fetched", sessions));
    }
}
