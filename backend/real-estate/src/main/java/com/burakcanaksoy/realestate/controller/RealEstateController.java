package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.request.RealEstateCreateRequest;
import com.burakcanaksoy.realestate.request.RealEstateFilterRequest;
import com.burakcanaksoy.realestate.request.RealEstateUpdateRequest;
import com.burakcanaksoy.realestate.response.RealEstateResponse;
import com.burakcanaksoy.realestate.service.RealEstateService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/realestates")
public class RealEstateController {
    private final RealEstateService realEstateService;

    public RealEstateController(RealEstateService realEstateService) {
        this.realEstateService = realEstateService;
    }

    @GetMapping()
    public ResponseEntity<List<RealEstateResponse>> getALlRealEstates() {
        return new ResponseEntity<>(this.realEstateService.getAllRealEstates(), HttpStatus.OK);
    }

    @GetMapping("/page")
    public ResponseEntity<Page<RealEstateResponse>> getAllRealEstatesPage(Pageable pageable) {
        return new ResponseEntity<>(this.realEstateService.getAllRealEstates(pageable), HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<RealEstateResponse>> search(@ModelAttribute RealEstateFilterRequest filter,
            Pageable pageable) {
        return new ResponseEntity<>(this.realEstateService.search(filter, pageable), HttpStatus.OK);
    }

    @PostMapping()
    public ResponseEntity<RealEstateResponse> createRealEstate(
            @RequestBody @Valid RealEstateCreateRequest realEstateCreateRequest) {
        return new ResponseEntity<>(this.realEstateService.createRealEstate(realEstateCreateRequest),
                HttpStatus.CREATED);
    }

    @GetMapping("/{realEstateId}")
    public ResponseEntity<RealEstateResponse> getRealEstateById(@PathVariable Long realEstateId) {
        this.realEstateService.incrementViewCount(realEstateId);
        return new ResponseEntity<>(this.realEstateService.getRealEstateById(realEstateId), HttpStatus.OK);
    }

    @DeleteMapping("/{realEstateId}")
    public ResponseEntity<String> deleteRealEstate(@PathVariable Long realEstateId) {
        this.realEstateService.deleteRealEstate(realEstateId);
        return ResponseEntity.ok("Real Estate deleted with this id : " + realEstateId);
    }

    @PutMapping("/{realEstateId}")
    public ResponseEntity<RealEstateResponse> updateRealEstate(@PathVariable Long realEstateId,
            @Valid @RequestBody RealEstateUpdateRequest request) {
        return new ResponseEntity<>(this.realEstateService.updateRealEstate(realEstateId, request), HttpStatus.OK);
    }

    @GetMapping("/{realEstateId}/similar")
    public ResponseEntity<List<RealEstateResponse>> getSimilarRealEstates(@PathVariable Long realEstateId) {
        return new ResponseEntity<>(this.realEstateService.getSimilarRealEstates(realEstateId), HttpStatus.OK);
    }
}
