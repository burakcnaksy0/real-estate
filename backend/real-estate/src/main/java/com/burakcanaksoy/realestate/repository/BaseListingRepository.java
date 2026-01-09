package com.burakcanaksoy.realestate.repository;

import com.burakcanaksoy.realestate.model.BaseListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface BaseListingRepository<T extends BaseListing>
        extends JpaRepository<T, Long> {
}
