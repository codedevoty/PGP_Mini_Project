package net.engineeringdigest.journalApp.config;

import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import org.bson.types.ObjectId;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    @Bean
    public SimpleModule objectIdModule() {
        SimpleModule module = new SimpleModule();
        // Serialize ObjectId as a plain string instead of complex object
        module.addSerializer(ObjectId.class, new ToStringSerializer());
        return module;
    }
}
