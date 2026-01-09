package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.model.enums.Currency;
import com.burakcanaksoy.realestate.model.enums.HeatingType;
import com.burakcanaksoy.realestate.model.enums.RealEstateType;
import com.burakcanaksoy.realestate.request.RealEstateCreateRequest;
import com.burakcanaksoy.realestate.response.RealEstateResponse;
import com.burakcanaksoy.realestate.security.AuthService;
import com.burakcanaksoy.realestate.security.JwtAuthenticationFilter;
import com.burakcanaksoy.realestate.service.RealEstateService;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.math.BigDecimal;
import java.util.List;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = RealEstateController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("RealEstateController Unit Tests")
class RealEstateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RealEstateService realEstateService;

    @MockBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("getAllRealEstates - Should return all real estates")
    void testGetAllRealEstates() throws Exception {
        RealEstateResponse response = new RealEstateResponse();
        response.setId(1L);
        response.setTitle("Test Real Estate");

        when(realEstateService.getAllRealEstates()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/realestates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test Real Estate"));
    }

    @Test
    @DisplayName("getAllRealEstates(Pageable) - Should return page")
    void testGetAllRealEstatesPage() throws Exception {
        RealEstateResponse response = new RealEstateResponse();
        response.setId(1L);
        response.setTitle("Test Real Estate");

        Page<RealEstateResponse> page = new PageImpl<>(List.of(response));
        when(realEstateService.getAllRealEstates(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/realestates/page"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Test Real Estate"));
    }

    @Test
    @DisplayName("createRealEstate - Should create")
    void testCreateRealEstate() throws Exception {
        RealEstateCreateRequest request = new RealEstateCreateRequest();
        request.setTitle("New House");
        request.setPrice(BigDecimal.valueOf(100000));
        request.setCurrency(Currency.USD);
        request.setCategorySlug("house");
        request.setCity("Istanbul");
        request.setDistrict("Kadikoy");
        request.setRealEstateType(RealEstateType.APARTMENT);
        request.setRoomCount(3);
        request.setSquareMeter(120);
        request.setBuildingAge(5);
        request.setFloor(2);
        request.setHeatingType(HeatingType.NATURAL_GAS);
        request.setFurnished(true);

        RealEstateResponse response = new RealEstateResponse();
        response.setId(1L);
        response.setTitle("New House");

        when(realEstateService.createRealEstate(any(RealEstateCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/realestates")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("New House"));
    }

    @Test
    @DisplayName("getRealEstateById - Should return real estate")
    void testGetRealEstateById() throws Exception {
        RealEstateResponse response = new RealEstateResponse();
        response.setId(1L);
        response.setTitle("House 1");

        when(realEstateService.getRealEstateById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/realestates/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("House 1"));
    }

    @Test
    @DisplayName("deleteRealEstate - Should return 200 OK")
    void testDeleteRealEstate() throws Exception {
        mockMvc.perform(delete("/api/realestates/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("Real Estate deleted with this id : 1"));
    }
}
