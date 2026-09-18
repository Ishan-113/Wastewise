package com.wastewise.auth;

import com.wastewise.stats.UserRecyclingStats;
import com.wastewise.stats.UserRecyclingStatsRepository;
import com.wastewise.user.User;
import com.wastewise.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final UserRecyclingStatsRepository statsRepo;
    private final JwtService jwt;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository users, UserRecyclingStatsRepository statsRepo, JwtService jwt) {
        this.users = users;
        this.statsRepo = statsRepo;
        this.jwt = jwt;
    }

    // DTOs
    public record RegisterRequest(
            @NotBlank @Size(min = 2, max = 80) String name,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 6, max = 72) String password) {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password) {}

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already registered"));
        }
        User u = new User();
        u.setName(req.name().trim());
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(req.password()));
        users.save(u);
        // Seed prototype recycling stats for new user: 3.25 kg, 127 bottles, 1300 points (3250g * 0.4)
        UserRecyclingStats stats = new UserRecyclingStats(u, 3.25, 127, 1300);
        statsRepo.save(stats);
        String token = jwt.generate(u.getId(), u.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "token", token,
                "user", Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail())
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        String email = req.email().trim().toLowerCase();
        var opt = users.findByEmail(email);
        if (opt.isEmpty() || !encoder.matches(req.password(), opt.get().getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }
        User u = opt.get();
        String token = jwt.generate(u.getId(), u.getEmail());
        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail())
        ));
    }

    // Optional: list users count for admin check (without passwords)
    @GetMapping("/count")
    public Map<String, Object> count() {
        return Map.of("count", users.count());
    }
}
