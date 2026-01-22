package com.burakcanaksoy.realestate.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Data
@NoArgsConstructor
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username; // Or userId if we want a relation, but username is safer if user is deleted

    @Column(nullable = false)
    private String action; // E.g., "LOGIN", "DELETE_USER", "CREATE_LISTING"

    @Column(columnDefinition = "TEXT")
    private String description;

    private String ipAddress;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public ActivityLog(String username, String action, String description, String ipAddress) {
        this.username = username;
        this.action = action;
        this.description = description;
        this.ipAddress = ipAddress;
        this.timestamp = LocalDateTime.now();
    }
}
