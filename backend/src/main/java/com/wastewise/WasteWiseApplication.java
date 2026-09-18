package com.wastewise;

import com.wastewise.stats.UserRecyclingStats;
import com.wastewise.stats.UserRecyclingStatsRepository;
import com.wastewise.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class WasteWiseApplication {
    public static void main(String[] args) {
        SpringApplication.run(WasteWiseApplication.class, args);
    }

    // Demo fix: ensure SHADOW (sha@gmail.com, id 6) shows 5kg/200/2000 instead of 0/0/0
    // Runs on every startup — idempotent, only updates if current is 0/0/0 or missing
    @Bean
    CommandLineRunner demoStatsFix(UserRepository users, UserRecyclingStatsRepository statsRepo) {
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
                            // Use managed reference for @MapsId
                            var userRef = users.getReferenceById(id);
                            UserRecyclingStats ns = new UserRecyclingStats(userRef, 5.0, 200, 2000);
                            statsRepo.save(ns);
                            System.out.println("[WasteWise] Created demo stats for SHADOW id=" + id + " -> 5kg/200/2000");
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
                            s.setPetWeightKg(5.0);
                            s.setBottlesRecycled(200);
                            s.setPoints(2000);
                            try {
                                statsRepo.save(s);
                                System.out.println("[WasteWise] Fixed zero stats for SHADOW id=" + id + " -> 5kg/200/2000");
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
