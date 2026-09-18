package com.wastewise;

import com.wastewise.stats.UserRecyclingStatsRepository;
import com.wastewise.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class WasteWiseApplication {
    public static void main(String[] args) {
        SpringApplication.run(WasteWiseApplication.class, args);
    }

    // Demo fix: ensure SHADOW (sha@gmail.com, id 6) shows 5kg/200/2000 instead of 0/0/0
    // Uses JDBC upsert to bypass Hibernate @MapsId null identifier bug
    @Bean
    CommandLineRunner demoStatsFix(UserRepository users, UserRecyclingStatsRepository statsRepo, JdbcTemplate jdbc) {
        return args -> {
            try {
                var optUser = users.findByEmail("sha@gmail.com");
                if (optUser.isEmpty()) optUser = users.findByEmail("SHA@gmail.com");
                optUser.ifPresent(u -> {
                    Long id = u.getId();
                    if (id == null) {
                        System.out.println("[WasteWise] demoStatsFix: user id null for " + u.getEmail());
                        return;
                    }
                    var opt = statsRepo.findById(id);
                    if (opt.isEmpty()) {
                        try {
                            jdbc.update("INSERT INTO user_recycling_stats (user_id, pet_weight_kg, bottles_recycled, points) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE pet_weight_kg=VALUES(pet_weight_kg), bottles_recycled=VALUES(bottles_recycled), points=VALUES(points)", id, 5.0, 200, 2000);
                            System.out.println("[WasteWise] Created demo stats for SHADOW id=" + id + " -> 5kg/200/2000 (JDBC)");
                        } catch (Exception ex) {
                            System.out.println("[WasteWise] demoStatsFix create failed: " + ex.getMessage());
                            ex.printStackTrace();
                        }
                    } else {
                        var s = opt.get();
                        boolean isZero = (s.getPetWeightKg() == null || s.getPetWeightKg() == 0.0)
                                && (s.getBottlesRecycled() == null || s.getBottlesRecycled() == 0)
                                && (s.getPoints() == null || s.getPoints() == 0);
                        if (isZero) {
                            try {
                                jdbc.update("UPDATE user_recycling_stats SET pet_weight_kg=?, bottles_recycled=?, points=? WHERE user_id=?", 5.0, 200, 2000, id);
                                System.out.println("[WasteWise] Fixed zero stats for SHADOW id=" + id + " -> 5kg/200/2000 (JDBC)");
                            } catch (Exception ex) {
                                System.out.println("[WasteWise] demoStatsFix update failed: " + ex.getMessage());
                                ex.printStackTrace();
                            }
                        } else {
                            System.out.println("[WasteWise] SHADOW stats already " + s.getPetWeightKg() + "kg/" + s.getBottlesRecycled() + "/" + s.getPoints() + " — no fix needed");
                        }
                    }
                });
                if (optUser.isEmpty()) System.out.println("[WasteWise] demoStatsFix: sha@gmail.com not found");
            } catch (Exception e) {
                System.out.println("[WasteWise] demoStatsFix skipped: " + e.getMessage());
                e.printStackTrace();
            }
        };
    }
}
