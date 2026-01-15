package com.burakcanaksoy.realestate.repository;

import com.burakcanaksoy.realestate.model.Land;
import com.burakcanaksoy.realestate.model.enums.LandType;
import com.burakcanaksoy.realestate.model.enums.ListingStatus;
import com.burakcanaksoy.realestate.request.LandFilterRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface LandRepository extends BaseListingRepository<Land> {

  @Query(value = """
      select l
      from Land l
      join l.category c
      where (:#{#filter.city} is null or lower(l.city) = lower(:#{#filter.city}))
        and (:#{#filter.district} is null or lower(l.district) = lower(:#{#filter.district}))
        and (:#{#filter.categorySlug} is null or c.slug = :#{#filter.categorySlug})
        and (:#{#filter.status} is null or l.status = :#{#filter.status})
        and (:#{#filter.minPrice} is null or l.price >= :#{#filter.minPrice})
        and (:#{#filter.maxPrice} is null or l.price <= :#{#filter.maxPrice})
        and (:#{#filter.landType} is null or l.landType = :#{#filter.landType})
        and (:#{#filter.minSquareMeter} is null or l.squareMeter >= :#{#filter.minSquareMeter})
        and (:#{#filter.maxSquareMeter} is null or l.squareMeter <= :#{#filter.maxSquareMeter})
      """, countQuery = """
      select count(l)
      from Land l
      join l.category c
      where (:#{#filter.city} is null or lower(l.city) = lower(:#{#filter.city}))
        and (:#{#filter.district} is null or lower(l.district) = lower(:#{#filter.district}))
        and (:#{#filter.categorySlug} is null or c.slug = :#{#filter.categorySlug})
        and (:#{#filter.status} is null or l.status = :#{#filter.status})
        and (:#{#filter.minPrice} is null or l.price >= :#{#filter.minPrice})
        and (:#{#filter.maxPrice} is null or l.price <= :#{#filter.maxPrice})
        and (:#{#filter.landType} is null or l.landType = :#{#filter.landType})
        and (:#{#filter.minSquareMeter} is null or l.squareMeter >= :#{#filter.minSquareMeter})
        and (:#{#filter.maxSquareMeter} is null or l.squareMeter <= :#{#filter.maxSquareMeter})
      """)
  Page<Land> search(@Param("filter") LandFilterRequest filter, Pageable pageable);

  List<Land> findTop3ByCityAndDistrictAndLandTypeAndIdNot(String city, String district, LandType landType, Long id);

  // Analytics queries
  Long countByStatus(ListingStatus status);

  Long countByCreatedAtAfter(LocalDateTime date);

  List<Land> findTop10ByOrderByCreatedAtDesc();
}
