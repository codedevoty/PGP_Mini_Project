package net.engineeringdigest.journalApp.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.dto.ApiResponse;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@Slf4j
public class PaymentController {

    @Value("${app.razorpay.key-id}")
    private String keyId;

    @Value("${app.razorpay.key-secret}")
    private String keySecret;

    private RazorpayClient client;

    @PostConstruct
    public void init() {
        try {
            this.client = new RazorpayClient(keyId, keySecret);
        } catch (RazorpayException e) {
            log.error("Failed to initialize Razorpay Client: {}", e.getMessage());
        }
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createRazorpayOrder(@RequestBody Map<String, Object> data) {
        try {
            Object amountObj = data.get("amount");
            if (amountObj == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Amount is required"));
            }

            // Razorpay amount is in paise (multiply INR by 100)
            int amount = (int) Math.round(Double.parseDouble(amountObj.toString()) * 100);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            Order razorpayOrder = client.orders.create(orderRequest);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("orderId", razorpayOrder.get("id"));
            responseData.put("amount", razorpayOrder.get("amount"));
            responseData.put("currency", razorpayOrder.get("currency"));
            responseData.put("keyId", keyId); // Sent so frontend can initialize checkout

            return ResponseEntity.ok(new ApiResponse(true, "Razorpay Order created", responseData));
        } catch (RazorpayException e) {
            log.error("Razorpay error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            log.error("Payment error: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(new ApiResponse(false, "Failed to create payment order"));
        }
    }
}
