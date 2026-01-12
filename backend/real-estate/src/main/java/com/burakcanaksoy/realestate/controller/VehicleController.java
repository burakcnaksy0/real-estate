package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.request.VehicleCreateRequest;
import com.burakcanaksoy.realestate.request.VehicleFilterRequest;
import com.burakcanaksoy.realestate.request.VehicleUpdateRequest;
import com.burakcanaksoy.realestate.response.VehicleResponse;
import com.burakcanaksoy.realestate.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {
    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping()
    public ResponseEntity<List<VehicleResponse>> getAllVehicles() {
        return new ResponseEntity<>(this.vehicleService.getAllVehicles(), HttpStatus.OK);
    }

    @GetMapping("/page")
    public ResponseEntity<Page<VehicleResponse>> getAllVehiclesPage(Pageable pageable) {
        return new ResponseEntity<>(this.vehicleService.getAllVehicles(pageable), HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<VehicleResponse>> search(@ModelAttribute VehicleFilterRequest filter,
            Pageable pageable) {
        return new ResponseEntity<>(this.vehicleService.search(filter, pageable), HttpStatus.OK);
    }

    @PostMapping()
    public ResponseEntity<VehicleResponse> createVehicle(
            @RequestBody @Valid VehicleCreateRequest vehicleCreateRequest) {
        return new ResponseEntity<>(this.vehicleService.createVehicle(vehicleCreateRequest), HttpStatus.CREATED);
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<VehicleResponse> getVehicleById(@PathVariable Long vehicleId) {
        return new ResponseEntity<>(this.vehicleService.getVehicleById(vehicleId), HttpStatus.OK);
    }

    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<String> deleteVehicle(@PathVariable Long vehicleId) {
        this.vehicleService.deleteVehicle(vehicleId);
        return ResponseEntity.ok("Vehicle deleted with this id : " + vehicleId);
    }

    @PutMapping("/{vehicleId}")
    public ResponseEntity<VehicleResponse> updateVehicle(@PathVariable Long vehicleId,
            @Valid @RequestBody VehicleUpdateRequest request) {
        return new ResponseEntity<>(this.vehicleService.updateVehicle(vehicleId, request), HttpStatus.OK);
    }

    @GetMapping("/{vehicleId}/similar")
    public ResponseEntity<List<VehicleResponse>> getSimilarVehicles(@PathVariable Long vehicleId) {
        return new ResponseEntity<>(this.vehicleService.getSimilarVehicles(vehicleId), HttpStatus.OK);
    }
}
