package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.model.enums.Currency;
import com.burakcanaksoy.realestate.request.LandCreateRequest;
import com.burakcanaksoy.realestate.response.LandResponse;
import com.burakcanaksoy.realestate.security.AuthService;
import com.burakcanaksoy.realestate.security.JwtAuthenticationFilter;
import com.burakcanaksoy.realestate.service.LandService;
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

@WebMvcTest(controllers = LandController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("LandController Unit Tests")
class LandControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LandService landService;

    @MockBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("getAllLands - Should return list")
    void testGetAllLands() throws Exception {
        LandResponse response = new LandResponse();
        response.setId(1L);
        response.setTitle("Land 1");

        when(landService.getAllLands()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/lands"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Land 1"));
    }

    @Test
    @DisplayName("getAllLandsPage - Should return page")
    void testGetAllLandsPage() throws Exception {
        LandResponse response = new LandResponse();
        response.setId(1L);
        response.setTitle("Land 1");

        Page<LandResponse> page = new PageImpl<>(List.of(response));
        when(landService.getAllLands(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/lands/page"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Land 1"));
    }

    @Test
    @DisplayName("createLand - Should create")
    void testCreateLand() throws Exception {
        LandCreateRequest request = new LandCreateRequest();
        request.setTitle("New Land");
        request.setPrice(BigDecimal.valueOf(50000));
        request.setCurrency(Currency.USD);
        request.setCategorySlug("land");
        request.setCity("Izmir");
        request.setDistrict("Urla");
        request.setLandType(com.burakcanaksoy.realestate.model.enums.LandType.GARDEN);
        request.setSquareMeter(500);
        request.setZoningStatus("Residential");
        request.setParcelNumber(101);
        request.setIslandNumber(202);

        LandResponse response = new LandResponse();
        response.setId(1L);
        response.setTitle("New Land");

        when(landService.createLand(any(LandCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/lands")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("New Land"));
    }

    @Test
    @DisplayName("getLandById - Should return land")
    void testGetLandById() throws Exception {
        LandResponse response = new LandResponse();
        response.setId(1L);
        response.setTitle("Land 1");

        when(landService.getLandById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/lands/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Land 1"));
    }

    @Test
    @DisplayName("deleteLand - Should return success message")
    void testDeleteLand() throws Exception {
        mockMvc.perform(delete("/api/lands/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("Land deleted with this id : 1"));
    }
}
