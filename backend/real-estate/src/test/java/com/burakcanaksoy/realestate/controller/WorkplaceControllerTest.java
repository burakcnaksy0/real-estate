package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.model.enums.Currency;
import com.burakcanaksoy.realestate.request.WorkplaceCreateRequest;
import com.burakcanaksoy.realestate.response.WorkplaceResponse;
import com.burakcanaksoy.realestate.security.AuthService;
import com.burakcanaksoy.realestate.security.JwtAuthenticationFilter;
import com.burakcanaksoy.realestate.service.WorkplaceService;
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

@WebMvcTest(controllers = WorkplaceController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class))
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("WorkplaceController Unit Tests")
class WorkplaceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WorkplaceService workplaceService;

    @MockBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("getAllWorkplaces - Should return list")
    void testGetAllWorkplaces() throws Exception {
        WorkplaceResponse response = new WorkplaceResponse();
        response.setId(1L);
        response.setTitle("Workplace 1");

        when(workplaceService.getAllWorkplaces()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/workplaces"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Workplace 1"));
    }

    @Test
    @DisplayName("getAllWorkplacesPage - Should return page")
    void testGetAllWorkplacesPage() throws Exception {
        WorkplaceResponse response = new WorkplaceResponse();
        response.setId(1L);
        response.setTitle("Workplace 1");

        Page<WorkplaceResponse> page = new PageImpl<>(List.of(response));
        when(workplaceService.getAllWorkplaces(any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/workplaces/page"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Workplace 1"));
    }

    @Test
    @DisplayName("createWorkplace - Should create")
    void testCreateWorkplace() throws Exception {
        WorkplaceCreateRequest request = new WorkplaceCreateRequest();
        request.setTitle("New Office");
        request.setPrice(BigDecimal.valueOf(100000));
        request.setCurrency(Currency.USD);
        request.setCategorySlug("office");
        request.setCity("Bursa");
        request.setDistrict("Nilufer");
        request.setWorkplaceType(com.burakcanaksoy.realestate.model.enums.WorkplaceType.OFFICE);
        request.setSquareMeter(85);
        request.setFloorCount(5);
        request.setFurnished(false);

        WorkplaceResponse response = new WorkplaceResponse();
        response.setId(1L);
        response.setTitle("New Office");

        when(workplaceService.createWorkplace(any(WorkplaceCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/workplaces")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("New Office"));
    }

    @Test
    @DisplayName("getWorkplaceById - Should return workplace")
    void testGetWorkplaceById() throws Exception {
        WorkplaceResponse response = new WorkplaceResponse();
        response.setId(1L);
        response.setTitle("Office 1");

        when(workplaceService.getWorkplaceById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/workplaces/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Office 1"));
    }

    @Test
    @DisplayName("deleteWorkplace - Should return success message")
    void testDeleteWorkplace() throws Exception {
        mockMvc.perform(delete("/api/workplaces/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("Workplace deleted with this id : 1"));
    }
}
