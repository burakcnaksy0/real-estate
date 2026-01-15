package com.burakcanaksoy.realestate.repository;

import com.burakcanaksoy.realestate.model.BaseListing;
import com.burakcanaksoy.realestate.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ListingRepository extends JpaRepository<BaseListing, Long> {
    void deleteByCreatedBy(User user);
}
