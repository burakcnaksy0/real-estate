package com.burakcanaksoy.realestate.model;

import com.burakcanaksoy.realestate.model.enums.LandType;
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
}
