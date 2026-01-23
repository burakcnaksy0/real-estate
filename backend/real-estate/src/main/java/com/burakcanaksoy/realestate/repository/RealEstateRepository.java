package com.burakcanaksoy.realestate.repository;

import com.burakcanaksoy.realestate.model.RealEstate;
import com.burakcanaksoy.realestate.model.enums.ListingStatus;
import com.burakcanaksoy.realestate.model.enums.RealEstateType;
import com.burakcanaksoy.realestate.request.RealEstateFilterRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RealEstateRepository extends BaseListingRepository<RealEstate> {

  @Query(value = """
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
        and (:#{#filter.roomCount} is null or r.roomCount = :#{#filter.roomCount})
        and (:#{#filter.minGrossSquareMeter} is null or r.grossSquareMeter >= :#{#filter.minGrossSquareMeter})
        and (:#{#filter.maxGrossSquareMeter} is null or r.grossSquareMeter <= :#{#filter.maxGrossSquareMeter})
        and (:#{#filter.buildingAge} is null or r.buildingAge = :#{#filter.buildingAge})
        and (:#{#filter.minFloor} is null or r.floor >= :#{#filter.minFloor})
        and (:#{#filter.maxFloor} is null or r.floor <= :#{#filter.maxFloor})
        and (:#{#filter.heatingType} is null or r.heatingType = :#{#filter.heatingType})
        and (:#{#filter.furnished} is null or r.furnished = :#{#filter.furnished})
        and (:#{#filter.ownerId} is null or r.createdBy.id = :#{#filter.ownerId})
      """, countQuery = """
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
        and (:#{#filter.roomCount} is null or r.roomCount = :#{#filter.roomCount})
        and (:#{#filter.minGrossSquareMeter} is null or r.grossSquareMeter >= :#{#filter.minGrossSquareMeter})
        and (:#{#filter.maxGrossSquareMeter} is null or r.grossSquareMeter <= :#{#filter.maxGrossSquareMeter})
        and (:#{#filter.buildingAge} is null or r.buildingAge = :#{#filter.buildingAge})
        and (:#{#filter.minFloor} is null or r.floor >= :#{#filter.minFloor})
        and (:#{#filter.maxFloor} is null or r.floor <= :#{#filter.maxFloor})
        and (:#{#filter.heatingType} is null or r.heatingType = :#{#filter.heatingType})
        and (:#{#filter.furnished} is null or r.furnished = :#{#filter.furnished})
        and (:#{#filter.ownerId} is null or r.createdBy.id = :#{#filter.ownerId})
      """)
  Page<RealEstate> search(@Param("filter") RealEstateFilterRequest filter, Pageable pageable);

  List<RealEstate> findTop3ByCityAndDistrictAndRealEstateTypeAndIdNot(String city, String district,
      RealEstateType realEstateType, Long id);

  // Analytics queries
  Long countByStatus(ListingStatus status);

  Long countByCreatedAtAfter(LocalDateTime date);

  List<RealEstate> findTop10ByOrderByCreatedAtDesc();
}
