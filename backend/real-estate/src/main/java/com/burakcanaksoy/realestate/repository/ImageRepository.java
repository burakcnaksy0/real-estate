package com.burakcanaksoy.realestate.repository;

import com.burakcanaksoy.realestate.model.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {

    List<Image> findByListingIdAndListingTypeOrderByDisplayOrderAsc(Long listingId, String listingType);

    Optional<Image> findByListingIdAndListingTypeAndIsPrimaryTrue(Long listingId, String listingType);

    void deleteByListingIdAndListingType(Long listingId, String listingType);

    long countByListingIdAndListingType(Long listingId, String listingType);

    Optional<Image> findFirstByListingIdAndListingTypeOrderByDisplayOrderAsc(Long listingId, String listingType);
}
