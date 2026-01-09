package com.burakcanaksoy.realestate.model;

import com.burakcanaksoy.realestate.model.enums.HeatingType;
import com.burakcanaksoy.realestate.model.enums.RealEstateType;
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

    @Column(nullable = false)
    private Integer roomCount;

    @Column(nullable = false)
    private Integer squareMeter;

    @Column(nullable = false)
    private Integer buildingAge;

    private Integer floor;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private HeatingType heatingType;

    @Column(nullable = false)
    private Boolean furnished;
}
