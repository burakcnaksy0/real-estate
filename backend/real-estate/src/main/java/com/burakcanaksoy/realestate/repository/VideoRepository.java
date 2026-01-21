package com.burakcanaksoy.realestate.repository;

import com.burakcanaksoy.realestate.model.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {
    List<Video> findByListingIdAndListingTypeOrderByDisplayOrderAsc(Long listingId, String listingType);

    void deleteByListingIdAndListingType(Long listingId, String listingType);

    long countByListingIdAndListingType(Long listingId, String listingType);
}
