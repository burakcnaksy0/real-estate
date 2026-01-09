package com.burakcanaksoy.realestate.repository;

import com.burakcanaksoy.realestate.model.RealEstate;
 import com.burakcanaksoy.realestate.request.RealEstateFilterRequest;
 import org.springframework.data.domain.Page;
 import org.springframework.data.domain.Pageable;
 import org.springframework.data.jpa.repository.Query;
 import org.springframework.data.repository.query.Param;

public interface RealEstateRepository extends BaseListingRepository<RealEstate> {

    @Query(
            value = """
                    select r
                    from RealEstate r
                    join r.category c
                    where (:#{#filter.city} is null or lower(r.city) = lower(:#{#filter.city}))
                      and (:#{#filter.district} is null or lower(r.district) = lower(:#{#filter.district}))
                      and (:#{#filter.categorySlug} is null or c.slug = :#{#filter.categorySlug})
                      and (:#{#filter.status} is null or r.status = :#{#filter.status})
                      and (:#{#filter.minPrice} is null or r.price >= :#{#filter.minPrice})
                      and (:#{#filter.maxPrice} is null or r.price <= :#{#filter.maxPrice})
                      and (:#{#filter.realEstateType} is null or r.realEstateType = :#{#filter.realEstateType})
                      and (:#{#filter.minRoomCount} is null or r.roomCount >= :#{#filter.minRoomCount})
                      and (:#{#filter.maxRoomCount} is null or r.roomCount <= :#{#filter.maxRoomCount})
                      and (:#{#filter.minSquareMeter} is null or r.squareMeter >= :#{#filter.minSquareMeter})
                      and (:#{#filter.maxSquareMeter} is null or r.squareMeter <= :#{#filter.maxSquareMeter})
                      and (:#{#filter.minBuildingAge} is null or r.buildingAge >= :#{#filter.minBuildingAge})
                      and (:#{#filter.maxBuildingAge} is null or r.buildingAge <= :#{#filter.maxBuildingAge})
                      and (:#{#filter.minFloor} is null or r.floor >= :#{#filter.minFloor})
                      and (:#{#filter.maxFloor} is null or r.floor <= :#{#filter.maxFloor})
                      and (:#{#filter.heatingType} is null or r.heatingType = :#{#filter.heatingType})
                      and (:#{#filter.furnished} is null or r.furnished = :#{#filter.furnished})
                    """,
            countQuery = """
                    select count(r)
                    from RealEstate r
                    join r.category c
                    where (:#{#filter.city} is null or lower(r.city) = lower(:#{#filter.city}))
                      and (:#{#filter.district} is null or lower(r.district) = lower(:#{#filter.district}))
                      and (:#{#filter.categorySlug} is null or c.slug = :#{#filter.categorySlug})
                      and (:#{#filter.status} is null or r.status = :#{#filter.status})
                      and (:#{#filter.minPrice} is null or r.price >= :#{#filter.minPrice})
                      and (:#{#filter.maxPrice} is null or r.price <= :#{#filter.maxPrice})
                      and (:#{#filter.realEstateType} is null or r.realEstateType = :#{#filter.realEstateType})
                      and (:#{#filter.minRoomCount} is null or r.roomCount >= :#{#filter.minRoomCount})
                      and (:#{#filter.maxRoomCount} is null or r.roomCount <= :#{#filter.maxRoomCount})
                      and (:#{#filter.minSquareMeter} is null or r.squareMeter >= :#{#filter.minSquareMeter})
                      and (:#{#filter.maxSquareMeter} is null or r.squareMeter <= :#{#filter.maxSquareMeter})
                      and (:#{#filter.minBuildingAge} is null or r.buildingAge >= :#{#filter.minBuildingAge})
                      and (:#{#filter.maxBuildingAge} is null or r.buildingAge <= :#{#filter.maxBuildingAge})
                      and (:#{#filter.minFloor} is null or r.floor >= :#{#filter.minFloor})
                      and (:#{#filter.maxFloor} is null or r.floor <= :#{#filter.maxFloor})
                      and (:#{#filter.heatingType} is null or r.heatingType = :#{#filter.heatingType})
                      and (:#{#filter.furnished} is null or r.furnished = :#{#filter.furnished})
                    """
    )
    Page<RealEstate> search(@Param("filter") RealEstateFilterRequest filter, Pageable pageable);
}
