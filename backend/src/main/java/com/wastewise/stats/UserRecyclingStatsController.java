package com.wastewise.stats;

import com.wastewise.auth.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserRecyclingStatsController {

    private final UserRecyclingStatsRepository statsRepo;
    private final JwtService jwt;

    public UserRecyclingStatsController(UserRecyclingStatsRepository statsRepo, JwtService jwt) {
        this.statsRepo = statsRepo;
        this.jwt = jwt;
    }

    @GetMapping("/recycling-stats")
    public ResponseEntity<?> getStats(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Optional<Long> userIdOpt = jwt.parseUserId(authHeader);
        if (userIdOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized: missing or invalid token"));
        }
        Long userId = userIdOpt.get();

        Optional<UserRecyclingStats> opt = statsRepo.findById(userId);
        if (opt.isPresent()) {
            UserRecyclingStats s = opt.get();
            return ResponseEntity.ok(Map.of(
                    "pet_weight_kg", s.getPetWeightKg(),
                    "bottles_recycled", s.getBottlesRecycled(),
                    "points", s.getPoints()
            ));
        }

        // Missing record → create zero record (idempotent, no duplicate) and return zeros
        // Do not expose error page as per spec
        UserRecyclingStats zero = new UserRecyclingStats(userId);
        zero.setPetWeightKg(0.0);
        zero.setBottlesRecycled(0);
        zero.setPoints(0);
        try {
            // Only save if user exists; if FK fails, just return zeros without persisting
            statsRepo.save(zero);
        } catch (Exception e) {
            // FK violation (user not found) → return zeros transient
        }
        return ResponseEntity.ok(Map.of(
                "pet_weight_kg", 0.0,
                "bottles_recycled", 0,
                "points", 0
        ));
    }
}
