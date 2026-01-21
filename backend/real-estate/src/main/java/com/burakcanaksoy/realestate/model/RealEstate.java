package com.burakcanaksoy.realestate.model;

import com.burakcanaksoy.realestate.model.enums.HeatingType;
import com.burakcanaksoy.realestate.model.enums.RealEstateType;
import com.burakcanaksoy.realestate.model.enums.UsingStatus;
import com.burakcanaksoy.realestate.model.enums.KitchenType;
import com.burakcanaksoy.realestate.model.enums.TittleStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "real_estates")
@Data
@EqualsAndHashCode(callSuper = true)
public class RealEstate extends BaseListing {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RealEstateType realEstateType;

    @Column(length = 20)
    private String roomCount;

    @Column
    private Integer grossSquareMeter;

    @Column
    private Integer netSquareMeter;

    @Column(length = 20)
    private String buildingAge;

    private Integer floor;

    private Integer totalFloors;

    private Integer bathroomCount;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private HeatingType heatingType;

    private Boolean balcony;

    @Column(nullable = false)
    private Boolean furnished;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private UsingStatus usingStatus;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private KitchenType kitchen;

    private Boolean elevator;

    private Boolean parking;

    private Boolean inComplex;

    private String complexName;

    private java.math.BigDecimal dues;

    private java.math.BigDecimal deposit;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private TittleStatus tittleStatus;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private com.burakcanaksoy.realestate.model.enums.ListingFrom fromWho;
}
