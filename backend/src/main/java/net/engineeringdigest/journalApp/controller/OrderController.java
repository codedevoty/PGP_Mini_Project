package net.engineeringdigest.journalApp.controller;

import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.dto.ApiResponse;
import net.engineeringdigest.journalApp.dto.OrderRequest;
import net.engineeringdigest.journalApp.entity.Order;
import net.engineeringdigest.journalApp.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Slf4j
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Customer places order (public - no auth required)
    @PostMapping("/api/order/place")
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest request) {
        try {
            Order order = orderService.placeOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Order placed successfully!", order));
        } catch (Exception e) {
            log.error("Place order error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Owner views live orders
    @GetMapping("/api/owner/orders/live/{restaurantId}")
    public ResponseEntity<?> getLiveOrders(@PathVariable String restaurantId) {
        List<Order> orders = orderService.getLiveOrders(restaurantId);
        return ResponseEntity.ok(new ApiResponse(true, "Live orders fetched", orders));
    }

    // Owner views orders by status
    @GetMapping("/api/owner/orders/{restaurantId}/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(@PathVariable String restaurantId, @PathVariable String status) {
        List<Order> orders = orderService.getOrdersByStatus(restaurantId, status);
        return ResponseEntity.ok(new ApiResponse(true, "Orders fetched", orders));
    }

    // Owner updates order status
    @PutMapping("/api/owner/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderId, @RequestBody java.util.Map<String, String> request) {
        try {
            String status = request.get("status");
            Order updated = orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok(new ApiResponse(true, "Order status updated to " + status, updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Get orders by session
    @GetMapping("/api/order/session/{sessionId}/orders")
    public ResponseEntity<?> getOrdersBySession(@PathVariable String sessionId) {
        List<Order> orders = orderService.getOrdersBySession(sessionId);
        return ResponseEntity.ok(new ApiResponse(true, "Orders fetched", orders));
    }
}
