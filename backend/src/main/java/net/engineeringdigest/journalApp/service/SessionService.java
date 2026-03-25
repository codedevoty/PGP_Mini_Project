package net.engineeringdigest.journalApp.service;

import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.entity.Order;
import net.engineeringdigest.journalApp.entity.Session;
import net.engineeringdigest.journalApp.entity.TableInfo;
import net.engineeringdigest.journalApp.repository.OrderRepository;
import net.engineeringdigest.journalApp.repository.SessionRepository;
import net.engineeringdigest.journalApp.repository.TableInfoRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class SessionService {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TableInfoRepository tableInfoRepository;

    @Transactional
    public Session startSession(String tableId, int tableNumber, String restaurantId) {
        // Check if there's already an active session for this table
        Session existing = sessionRepository.findByTableIdAndStatus(tableId, "ACTIVE");
        if (existing != null) {
            log.info("Returning existing active session for table {}", tableNumber);
            return existing;
        }

        Session session = new Session();
        session.setTableId(tableId);
        session.setTableNumber(tableNumber);
        session.setRestaurantId(restaurantId);
        session.setStatus("ACTIVE");
        session.setStartTime(LocalDateTime.now());

        Session saved = sessionRepository.save(session);

        // Mark table as occupied
        Optional<TableInfo> table = tableInfoRepository.findById(new ObjectId(tableId));
        if (table.isPresent()) {
            TableInfo tableInfo = table.get();
            tableInfo.setOccupied(true);
            tableInfo.setActiveSessionId(saved.getId().toHexString());
            tableInfoRepository.save(tableInfo);
        }

        log.info("Session started for table {} in restaurant {}", tableNumber, restaurantId);
        return saved;
    }

    public Optional<Session> getById(String id) {
        return sessionRepository.findById(new ObjectId(id));
    }

    public Session getActiveSession(String tableId) {
        return sessionRepository.findByTableIdAndStatus(tableId, "ACTIVE");
    }

    public List<Session> getSessionsByRestaurant(String restaurantId) {
        return sessionRepository.findByRestaurantId(restaurantId);
    }

    public List<Session> getActiveSessionsByRestaurant(String restaurantId) {
        return sessionRepository.findByRestaurantIdAndStatus(restaurantId, "ACTIVE");
    }

    @Transactional
    public Session generateBill(String sessionId) {
        Optional<Session> existing = sessionRepository.findById(new ObjectId(sessionId));
        if (!existing.isPresent()) {
            throw new RuntimeException("Session not found!");
        }
        Session session = existing.get();

        // Calculate total from all orders
        List<Order> orders = orderRepository.findBySessionId(sessionId);
        double total = 0;
        for (Order order : orders) {
            total += order.getTotalAmount();
        }
        session.setTotalAmount(total);
        log.info("Bill generated for session {}: ₹{}", sessionId, total);
        return sessionRepository.save(session);
    }

    @Transactional
    public Session completeSession(String sessionId, String paymentMethod) {
        try {
            Optional<Session> existing = sessionRepository.findById(new ObjectId(sessionId));
            if (!existing.isPresent()) {
                throw new RuntimeException("Session not found!");
            }
            Session session = existing.get();
            session.setStatus("COMPLETED");
            session.setEndTime(LocalDateTime.now());
            session.setPaid(true);
            session.setPaymentMethod(paymentMethod);

            // Free up the table
            Optional<TableInfo> table = tableInfoRepository.findById(new ObjectId(session.getTableId()));
            if (table.isPresent()) {
                TableInfo tableInfo = table.get();
                tableInfo.setOccupied(false);
                tableInfo.setActiveSessionId(null);
                tableInfoRepository.save(tableInfo);
            }

            log.info("Session {} completed. Payment: {} ₹{}", sessionId, paymentMethod, session.getTotalAmount());
            return sessionRepository.save(session);
        } catch (Exception e) {
            log.error("Error completing session: {}", e.getMessage());
            throw new RuntimeException("Failed to complete session: " + e.getMessage());
        }
    }
}
