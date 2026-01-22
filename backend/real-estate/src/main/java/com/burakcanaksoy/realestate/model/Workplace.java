package com.burakcanaksoy.realestate.model;

import com.burakcanaksoy.realestate.model.enums.HeatingType;
import com.burakcanaksoy.realestate.model.enums.ListingFrom;
import com.burakcanaksoy.realestate.model.enums.TittleStatus;
import com.burakcanaksoy.realestate.model.enums.WorkplaceType;
import com.burakcanaksoy.realestate.model.enums.YesNo;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Entity
@Table(name = "workplaces")
@Data
@EqualsAndHashCode(callSuper = true)
public class Workplace extends BaseListing {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private WorkplaceType workplaceType;

    @Column(nullable = false)
    private Integer squareMeter;

    @Column(nullable = false)
    private Integer floorCount;

    @Column(nullable = false)
    private Boolean furnished;

    // New fields
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private HeatingType heatingType;

    @Column(length = 50)
    private String buildingAge;

    @Column(precision = 10, scale = 2)
    private BigDecimal dues;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private YesNo creditEligibility;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private TittleStatus deedStatus;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private ListingFrom listingFrom;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private YesNo exchange;
}
