package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.response.BaseListingResponse;
import com.burakcanaksoy.realestate.security.AuthService;
import com.burakcanaksoy.realestate.security.JwtAuthenticationFilter;
import com.burakcanaksoy.realestate.service.ListingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ListingController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("ListingController Unit Tests")
class ListingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ListingService listingService;

    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("getAllListings - Should return list")
    void testGetAllListings() throws Exception {
        BaseListingResponse response = new BaseListingResponse();
        response.setId(1L);
        response.setTitle("Listing 1");

        when(listingService.getAllListings()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/listings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Listing 1"));
    }

    @Test
    @DisplayName("getAllListings(Pageable) - Should return page")
    void testGetAllListingsPage() throws Exception {
        BaseListingResponse response = new BaseListingResponse();
        response.setId(1L);
        response.setTitle("Listing 1");

        Page<BaseListingResponse> page = new PageImpl<>(List.of(response));
        when(listingService.getAllListings(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/listings/page"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Listing 1"));
    }
}
