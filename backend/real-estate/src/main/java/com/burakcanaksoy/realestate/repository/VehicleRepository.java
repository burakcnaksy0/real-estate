package com.burakcanaksoy.realestate.repository;

import com.burakcanaksoy.realestate.model.Vehicle;
import com.burakcanaksoy.realestate.model.enums.ListingStatus;

import java.time.LocalDateTime;
import java.util.List;
import com.burakcanaksoy.realestate.request.VehicleFilterRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;

@Repository
public interface VehicleRepository extends BaseListingRepository<Vehicle> {

  @Query(value = """
      select v
      from Vehicle v
      join v.category c
      where (:#{#filter.city} is null or lower(v.city) = lower(:#{#filter.city}))
        and (:#{#filter.district} is null or lower(v.district) = lower(:#{#filter.district}))
        and (:#{#filter.categorySlug} is null or c.slug = :#{#filter.categorySlug})
        and (:#{#filter.status} is null or v.status = :#{#filter.status})
        and (:#{#filter.minPrice} is null or v.price >= :#{#filter.minPrice})
        and (:#{#filter.maxPrice} is null or v.price <= :#{#filter.maxPrice})
        and (:#{#filter.brand} is null or lower(v.brand) = lower(:#{#filter.brand}))
        and (:#{#filter.model} is null or lower(v.model) = lower(:#{#filter.model}))
        and (:#{#filter.minYear} is null or v.year >= :#{#filter.minYear})
        and (:#{#filter.maxYear} is null or v.year <= :#{#filter.maxYear})
        and (:#{#filter.fuelType} is null or v.fuelType = :#{#filter.fuelType})
        and (:#{#filter.transmission} is null or v.transmission = :#{#filter.transmission})
        and (:#{#filter.minKilometer} is null or v.kilometer >= :#{#filter.minKilometer})
        and (:#{#filter.maxKilometer} is null or v.kilometer <= :#{#filter.maxKilometer})
        and (:#{#filter.engineVolume} is null or v.engineVolume = :#{#filter.engineVolume})
        and (:#{#filter.ownerId} is null or v.createdBy.id = :#{#filter.ownerId})
      """, countQuery = """
      select count(v)
      from Vehicle v
      join v.category c
      where (:#{#filter.city} is null or lower(v.city) = lower(:#{#filter.city}))
        and (:#{#filter.district} is null or lower(v.district) = lower(:#{#filter.district}))
        and (:#{#filter.categorySlug} is null or c.slug = :#{#filter.categorySlug})
        and (:#{#filter.status} is null or v.status = :#{#filter.status})
        and (:#{#filter.minPrice} is null or v.price >= :#{#filter.minPrice})
        and (:#{#filter.maxPrice} is null or v.price <= :#{#filter.maxPrice})
        and (:#{#filter.brand} is null or lower(v.brand) = lower(:#{#filter.brand}))
        and (:#{#filter.model} is null or lower(v.model) = lower(:#{#filter.model}))
        and (:#{#filter.minYear} is null or v.year >= :#{#filter.minYear})
        and (:#{#filter.maxYear} is null or v.year <= :#{#filter.maxYear})
        and (:#{#filter.fuelType} is null or v.fuelType = :#{#filter.fuelType})
        and (:#{#filter.transmission} is null or v.transmission = :#{#filter.transmission})
        and (:#{#filter.minKilometer} is null or v.kilometer >= :#{#filter.minKilometer})
        and (:#{#filter.maxKilometer} is null or v.kilometer <= :#{#filter.maxKilometer})
        and (:#{#filter.engineVolume} is null or v.engineVolume = :#{#filter.engineVolume})
        and (:#{#filter.ownerId} is null or v.createdBy.id = :#{#filter.ownerId})
      """)
  Page<Vehicle> search(@Param("filter") VehicleFilterRequest filter, Pageable pageable);

  List<Vehicle> findByCityAndDistrictAndBrandAndIdNot(String city, String district, String brand, Long id,
      Pageable pageable);

  // Analytics queries
  Long countByStatus(ListingStatus status);

  Long countByCreatedAtAfter(LocalDateTime date);

  List<Vehicle> findTop10ByOrderByCreatedAtDesc();
}
