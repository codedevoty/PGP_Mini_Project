package net.engineeringdigest.journalApp.service;

import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.dto.OrderRequest;
import net.engineeringdigest.journalApp.entity.Order;
import net.engineeringdigest.journalApp.entity.OrderItem;
import net.engineeringdigest.journalApp.entity.Session;
import net.engineeringdigest.journalApp.repository.OrderRepository;
import net.engineeringdigest.journalApp.repository.SessionRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Order placeOrder(OrderRequest request) {
        try {
            Order order = new Order();
            order.setSessionId(request.getSessionId());
            order.setTableId(request.getTableId());
            order.setTableNumber(request.getTableNumber());
            order.setRestaurantId(request.getRestaurantId());
            order.setItems(request.getItems());
            order.setSpecialInstructions(request.getSpecialInstructions());
            order.setOrderTime(LocalDateTime.now());
            order.setStatus("PENDING");

            // Calculate total amount
            double total = 0;
            for (OrderItem item : request.getItems()) {
                total += item.getPrice() * item.getQuantity();
            }
            order.setTotalAmount(total);

            Order saved = orderRepository.save(order);

            // Update session with order
            if (request.getSessionId() != null && !request.getSessionId().isEmpty()) {
                Session session = sessionRepository.findById(new ObjectId(request.getSessionId())).orElse(null);
                if (session != null) {
                    session.getOrderIds().add(saved.getId().toHexString());
                    session.setTotalAmount(session.getTotalAmount() + total);
                    sessionRepository.save(session);
                }
            }

            // Push real-time notification to owner dashboard via WebSocket
            try {
                messagingTemplate.convertAndSend(
                        "/topic/orders/" + request.getRestaurantId(), saved);
                log.info("WebSocket push sent for new order at table {}", request.getTableNumber());
            } catch (Exception wsEx) {
                log.warn("WebSocket push failed (non-critical): {}", wsEx.getMessage());
            }

            log.info("Order placed for table {} in restaurant {}", request.getTableNumber(), request.getRestaurantId());
            return saved;
        } catch (Exception e) {
            log.error("Error placing order: {}", e.getMessage());
            throw new RuntimeException("Failed to place order: " + e.getMessage());
        }
    }

    public List<Order> getLiveOrders(String restaurantId) {
        return orderRepository.findByRestaurantIdOrderByOrderTimeDesc(restaurantId);
    }

    public List<Order> getOrdersByStatus(String restaurantId, String status) {
        return orderRepository.findByRestaurantIdAndStatus(restaurantId, status);
    }

    public List<Order> getOrdersBySession(String sessionId) {
        return orderRepository.findBySessionId(sessionId);
    }

    public Optional<Order> getById(String id) {
        return orderRepository.findById(new ObjectId(id));
    }

    public Order updateOrderStatus(String orderId, String status) {
        Optional<Order> existing = orderRepository.findById(new ObjectId(orderId));
        if (!existing.isPresent()) {
            throw new RuntimeException("Order not found!");
        }
        Order order = existing.get();
        order.setStatus(status);
        Order updated = orderRepository.save(order);

        // Push status update to owner dashboard via WebSocket
        try {
            messagingTemplate.convertAndSend(
                    "/topic/orders/" + order.getRestaurantId(), updated);
        } catch (Exception wsEx) {
            log.warn("WebSocket push failed (non-critical): {}", wsEx.getMessage());
        }

        log.info("Order {} status updated to {}", orderId, status);
        return updated;
    }
}

