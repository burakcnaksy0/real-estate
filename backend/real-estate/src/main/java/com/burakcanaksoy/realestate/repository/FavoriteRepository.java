package com.burakcanaksoy.realestate.repository;

import com.burakcanaksoy.realestate.model.Favorite;
import com.burakcanaksoy.realestate.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserOrderByCreatedAtDesc(User user);

    Optional<Favorite> findByUserAndListingId(User user, Long listingId);

    boolean existsByUserAndListingId(User user, Long listingId);

    void deleteByUserAndListingId(User user, Long listingId);

    void deleteByUser(User user);

    long countByUser(User user);
}
