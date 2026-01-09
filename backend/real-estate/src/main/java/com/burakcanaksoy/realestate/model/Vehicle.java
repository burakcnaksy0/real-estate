package com.burakcanaksoy.realestate.model;

import com.burakcanaksoy.realestate.model.enums.FuelType;
import com.burakcanaksoy.realestate.model.enums.Transmission;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "vehicles")
@Data
@EqualsAndHashCode(callSuper = true)
public class Vehicle extends BaseListing {

    @Column(nullable = false, length = 50)
    private String brand;

    @Column(nullable = false, length = 50)
    private String model;

    @Column(name = "production_year", nullable = false)
    private Integer year;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FuelType fuelType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Transmission transmission;

    @Column(nullable = false)
    private Integer kilometer;

    @Column(length = 20)
    private String engineVolume;
}
