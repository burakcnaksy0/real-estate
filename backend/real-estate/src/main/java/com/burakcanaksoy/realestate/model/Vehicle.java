package com.burakcanaksoy.realestate.model;

import com.burakcanaksoy.realestate.model.enums.FuelType;
import com.burakcanaksoy.realestate.model.enums.Transmission;
import com.burakcanaksoy.realestate.model.enums.VehicleStatus;
import com.burakcanaksoy.realestate.model.enums.BodyType;
import com.burakcanaksoy.realestate.model.enums.TractionType;
import com.burakcanaksoy.realestate.model.enums.ListingFrom;
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

    @Column(length = 50)
    private String series;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private VehicleStatus vehicleStatus;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private BodyType bodyType;

    @Column(length = 20)
    private String enginePower;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private TractionType tractionType;

    @Column(length = 30)
    private String color;

    private Boolean warranty;

    private Boolean heavyDamage;

    @Column(length = 50)
    private String plateNationality;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ListingFrom fromWho;

    private Boolean exchange;
}
