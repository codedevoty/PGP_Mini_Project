package net.engineeringdigest.journalApp.repository;

import net.engineeringdigest.journalApp.entity.TableInfo;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TableInfoRepository extends MongoRepository<TableInfo, ObjectId> {

    List<TableInfo> findByRestaurantId(String restaurantId);

    TableInfo findByRestaurantIdAndTableNumber(String restaurantId, int tableNumber);

    void deleteByRestaurantId(String restaurantId);
}
