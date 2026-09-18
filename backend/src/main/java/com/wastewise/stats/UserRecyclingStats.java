package com.wastewise.stats;

import com.wastewise.user.User;
import jakarta.persistence.*;

@Entity
@Table(name = "user_recycling_stats")
public class UserRecyclingStats {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_stats_user"))
    private User user;

    @Column(name = "pet_weight_kg", nullable = false)
    private Double petWeightKg = 0.0;

    @Column(name = "bottles_recycled", nullable = false)
    private Integer bottlesRecycled = 0;

    @Column(nullable = false)
    private Integer points = 0;

    protected UserRecyclingStats() {}

    public UserRecyclingStats(User user, Double petWeightKg, Integer bottlesRecycled, Integer points) {
        this.user = user;
        this.userId = user.getId();
        this.petWeightKg = petWeightKg;
        this.bottlesRecycled = bottlesRecycled;
        this.points = points;
    }

    public UserRecyclingStats(Long userId) {
        this.userId = userId;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; if (user != null) this.userId = user.getId(); }
    public Double getPetWeightKg() { return petWeightKg; }
    public void setPetWeightKg(Double petWeightKg) { this.petWeightKg = petWeightKg; }
    public Integer getBottlesRecycled() { return bottlesRecycled; }
    public void setBottlesRecycled(Integer bottlesRecycled) { this.bottlesRecycled = bottlesRecycled; }
    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }
}
