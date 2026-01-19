package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.request.LandCreateRequest;
import com.burakcanaksoy.realestate.request.LandFilterRequest;
import com.burakcanaksoy.realestate.request.LandUpdateRequest;
import com.burakcanaksoy.realestate.response.LandResponse;
import com.burakcanaksoy.realestate.service.LandService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lands")
public class LandController {
    private final LandService landService;

    public LandController(LandService landService) {
        this.landService = landService;
    }

    @GetMapping()
    public ResponseEntity<List<LandResponse>> getAllLands() {
        return new ResponseEntity<>(this.landService.getAllLands(), HttpStatus.OK);
    }

    @GetMapping("/page")
    public ResponseEntity<Page<LandResponse>> getAllLandsPage(Pageable pageable) {
        return new ResponseEntity<>(this.landService.getAllLands(pageable), HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<LandResponse>> search(@ModelAttribute LandFilterRequest filter, Pageable pageable) {
        return new ResponseEntity<>(this.landService.search(filter, pageable), HttpStatus.OK);
    }

    @PostMapping()
    public ResponseEntity<LandResponse> createLand(@RequestBody @Valid LandCreateRequest landCreateRequest) {
        return new ResponseEntity<>(this.landService.createLand(landCreateRequest), HttpStatus.CREATED);
    }

    @GetMapping("/{landId}")
    public ResponseEntity<LandResponse> getLandById(@PathVariable Long landId) {
        this.landService.incrementViewCount(landId);
        return new ResponseEntity<>(this.landService.getLandById(landId), HttpStatus.OK);
    }

    @DeleteMapping("/{landId}")
    public ResponseEntity<String> deleteLand(@PathVariable Long landId) {
        this.landService.deleteLand(landId);
        return ResponseEntity.ok("Land deleted with this id : " + landId);
    }

    @PutMapping("/{landId}")
    public ResponseEntity<LandResponse> updateLand(@PathVariable Long landId,
            @RequestBody @Valid LandUpdateRequest request) {
        return new ResponseEntity<>(this.landService.updateLand(landId, request), HttpStatus.OK);
    }

    @GetMapping("/{landId}/similar")
    public ResponseEntity<List<LandResponse>> getSimilarLands(@PathVariable Long landId) {
        return new ResponseEntity<>(this.landService.getSimilarLands(landId), HttpStatus.OK);
    }
}
