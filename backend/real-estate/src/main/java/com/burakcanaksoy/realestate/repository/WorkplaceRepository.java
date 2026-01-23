package com.burakcanaksoy.realestate.repository;

import com.burakcanaksoy.realestate.model.Workplace;
import com.burakcanaksoy.realestate.model.enums.ListingStatus;
import com.burakcanaksoy.realestate.model.enums.WorkplaceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.burakcanaksoy.realestate.request.WorkplaceFilterRequest;

import java.time.LocalDateTime;
import java.util.List;

public interface WorkplaceRepository extends BaseListingRepository<Workplace> {
  @Query(value = """
      select w
      from Workplace w
      join w.category c
      where (:#{#filter.city} is null or lower(w.city) = lower(:#{#filter.city}))
        and (:#{#filter.district} is null or lower(w.district) = lower(:#{#filter.district}))
        and (:#{#filter.categorySlug} is null or c.slug = :#{#filter.categorySlug})
        and (:#{#filter.status} is null or w.status = :#{#filter.status})
        and (:#{#filter.minPrice} is null or w.price >= :#{#filter.minPrice})
        and (:#{#filter.maxPrice} is null or w.price <= :#{#filter.maxPrice})
        and (:#{#filter.workplaceType} is null or w.workplaceType = :#{#filter.workplaceType})
        and (:#{#filter.minSquareMeter} is null or w.squareMeter >= :#{#filter.minSquareMeter})
        and (:#{#filter.maxSquareMeter} is null or w.squareMeter <= :#{#filter.maxSquareMeter})
        and (:#{#filter.minFloorCount} is null or w.floorCount >= :#{#filter.minFloorCount})
        and (:#{#filter.maxFloorCount} is null or w.floorCount <= :#{#filter.maxFloorCount})
        and (:#{#filter.furnished} is null or w.furnished = :#{#filter.furnished})
        and (:#{#filter.ownerId} is null or w.createdBy.id = :#{#filter.ownerId})
      """, countQuery = """
      select count(w)
      from Workplace w
      join w.category c
      where (:#{#filter.city} is null or lower(w.city) = lower(:#{#filter.city}))
        and (:#{#filter.district} is null or lower(w.district) = lower(:#{#filter.district}))
        and (:#{#filter.categorySlug} is null or c.slug = :#{#filter.categorySlug})
        and (:#{#filter.status} is null or w.status = :#{#filter.status})
        and (:#{#filter.minPrice} is null or w.price >= :#{#filter.minPrice})
        and (:#{#filter.maxPrice} is null or w.                                                                                                             price <= :#{#filter.maxPrice})
        and (:#{#filter.workplaceType} is null or w.workplaceType = :#{#filter.workplaceType})
        and (:#{#filter.minSquareMeter} is null or w.squareMeter >= :#{#filter.minSquareMeter})
        and (:#{#filter.maxSquareMeter} is null or w.squareMeter <= :#{#filter.maxSquareMeter})
        and (:#{#filter.minFloorCount} is null or w.floorCount >= :#{#filter.minFloorCount})
        and (:#{#filter.maxFloorCount} is null or w.floorCount <= :#{#filter.maxFloorCount})
        and (:#{#filter.furnished} is null or w.furnished = :#{#filter.furnished})
        and (:#{#filter.ownerId} is null or w.createdBy.id = :#{#filter.ownerId})
      """)
  Page<Workplace> search(@Param("filter") WorkplaceFilterRequest filter, Pageable pageable);

  List<Workplace> findTop3ByCityAndDistrictAndWorkplaceTypeAndIdNot(String city, String district,
      WorkplaceType workplaceType, Long id);

  // Analytics queries
  Long countByStatus(ListingStatus status);

  Long countByCreatedAtAfter(LocalDateTime date);

  List<Workplace> findTop10ByOrderByCreatedAtDesc();
}
