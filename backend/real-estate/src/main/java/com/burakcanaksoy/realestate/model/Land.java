package com.burakcanaksoy.realestate.model;

import com.burakcanaksoy.realestate.model.enums.LandType;
import com.burakcanaksoy.realestate.model.enums.ListingFrom;
import com.burakcanaksoy.realestate.model.enums.TittleStatus;
import com.burakcanaksoy.realestate.model.enums.YesNo;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "lands")
@Data
@EqualsAndHashCode(callSuper = true)
public class Land extends BaseListing {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private LandType landType;

    @Column(nullable = false)
    private Integer squareMeter;

    @Column(length = 100)
    private String zoningStatus;

    @Column(nullable = false)
    private Integer parcelNumber;

    @Column(nullable = false)
    private Integer islandNumber;

    // New fields
    @Column(length = 50)
    private String paftaNo;

    @Column
    private Double kaks;

    @Column(length = 100)
    private String gabari;

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
