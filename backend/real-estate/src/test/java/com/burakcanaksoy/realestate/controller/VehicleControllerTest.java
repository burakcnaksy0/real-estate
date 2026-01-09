package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.model.enums.Currency;
import com.burakcanaksoy.realestate.request.VehicleCreateRequest;
import com.burakcanaksoy.realestate.response.VehicleResponse;
import com.burakcanaksoy.realestate.security.AuthService;
import com.burakcanaksoy.realestate.security.JwtAuthenticationFilter;
import com.burakcanaksoy.realestate.service.VehicleService;
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

@WebMvcTest(controllers = VehicleController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("VehicleController Unit Tests")
class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VehicleService vehicleService;

    @MockBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("getAllVehicles - Should return list")
    void testGetAllVehicles() throws Exception {
        VehicleResponse response = new VehicleResponse();
        response.setId(1L);
        response.setTitle("Vehicle 1");

        when(vehicleService.getAllVehicles()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Vehicle 1"));
    }

    @Test
    @DisplayName("getAllVehiclesPage - Should return page")
    void testGetAllVehiclesPage() throws Exception {
        VehicleResponse response = new VehicleResponse();
        response.setId(1L);
        response.setTitle("Vehicle 1");

        Page<VehicleResponse> page = new PageImpl<>(List.of(response));
        when(vehicleService.getAllVehicles(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/vehicles/page"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Vehicle 1"));
    }

    @Test
    @DisplayName("createVehicle - Should create")
    void testCreateVehicle() throws Exception {
        VehicleCreateRequest request = new VehicleCreateRequest();
        request.setTitle("New Vehicle");
        request.setPrice(BigDecimal.valueOf(20000));
        request.setCurrency(Currency.USD);
        request.setCategorySlug("vehicle");
        request.setCity("Ankara");
        request.setDistrict("Cankaya");
        request.setBrand("Toyota");
        request.setModel("Corolla");
        request.setYear(2020);
        request.setFuelType(com.burakcanaksoy.realestate.model.enums.FuelType.GASOLINE);
        request.setTransmission(com.burakcanaksoy.realestate.model.enums.Transmission.AUTOMATIC);
        request.setKilometer(15000);
        request.setEngineVolume("1.6");

        VehicleResponse response = new VehicleResponse();
        response.setId(1L);
        response.setTitle("New Vehicle");

        when(vehicleService.createVehicle(any(VehicleCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/vehicles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("New Vehicle"));
    }

    @Test
    @DisplayName("getVehicleById - Should return vehicle")
    void testGetVehicleById() throws Exception {
        VehicleResponse response = new VehicleResponse();
        response.setId(1L);
        response.setTitle("Vehicle 1");

        when(vehicleService.getVehicleById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/vehicles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Vehicle 1"));
    }

    @Test
    @DisplayName("deleteVehicle - Should return success message")
    void testDeleteVehicle() throws Exception {
        mockMvc.perform(delete("/api/vehicles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("Vehicle deleted with this id : 1"));
    }
}
