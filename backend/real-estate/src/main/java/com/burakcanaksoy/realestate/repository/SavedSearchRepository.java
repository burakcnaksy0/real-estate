package com.burakcanaksoy.realestate.repository;

import com.burakcanaksoy.realestate.model.SavedSearch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedSearchRepository extends JpaRepository<SavedSearch, Long> {

    List<SavedSearch> findByUserId(Long userId);

    Optional<SavedSearch> findByIdAndUserId(Long id, Long userId);

    @Modifying
    @Query("DELETE FROM SavedSearch s WHERE s.id = :id AND s.user.id = :userId")
    void deleteByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    long countByUserId(Long userId);
}
