package net.engineeringdigest.journalApp.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.extern.slf4j.Slf4j;
import net.engineeringdigest.journalApp.entity.TableInfo;
import net.engineeringdigest.journalApp.repository.TableInfoRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
@Slf4j
public class TableService {

    @Autowired
    private TableInfoRepository tableInfoRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public List<TableInfo> createTables(String restaurantId, int numberOfTables) {
        List<TableInfo> tables = new ArrayList<>();
        List<TableInfo> existingTables = tableInfoRepository.findByRestaurantId(restaurantId);
        int startNumber = existingTables.size() + 1;

        for (int i = startNumber; i < startNumber + numberOfTables; i++) {
            TableInfo table = new TableInfo();
            table.setTableNumber(i);
            table.setRestaurantId(restaurantId);

            // Generate QR code URL
            String qrUrl = frontendUrl + "/m/" + restaurantId + "/" + i;
            table.setQrCodeData(qrUrl);
            tables.add(tableInfoRepository.save(table));
        }

        log.info("Created {} tables for restaurant: {}", numberOfTables, restaurantId);
        return tables;
    }

    public List<TableInfo> getTablesByRestaurant(String restaurantId) {
        return tableInfoRepository.findByRestaurantId(restaurantId);
    }

    public byte[] generateQrCodeImage(String content, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height);
            BufferedImage image = MatrixToImageWriter.toBufferedImage(bitMatrix);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", baos);
            return baos.toByteArray();
        } catch (WriterException | IOException e) {
            log.error("Error generating QR code: {}", e.getMessage());
            throw new RuntimeException("Failed to generate QR code");
        }
    }

    public String generateQrCodeBase64(String content) {
        byte[] imageBytes = generateQrCodeImage(content, 300, 300);
        return Base64.getEncoder().encodeToString(imageBytes);
    }

    public void deleteTable(String tableId) {
        tableInfoRepository.deleteById(new ObjectId(tableId));
        log.info("Table deleted: {}", tableId);
    }
}
