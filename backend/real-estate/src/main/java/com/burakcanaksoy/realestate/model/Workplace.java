package com.burakcanaksoy.realestate.model;

import com.burakcanaksoy.realestate.model.enums.WorkplaceType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

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
}
