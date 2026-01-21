package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.request.CompareRequest;
import com.burakcanaksoy.realestate.response.ComparisonResponse;
import com.burakcanaksoy.realestate.service.ComparisonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/compare")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ComparisonController {

    private final ComparisonService comparisonService;

    @PostMapping
    public ResponseEntity<ComparisonResponse> compareListings(@Valid @RequestBody CompareRequest request) {
        ComparisonResponse response = comparisonService.compareListings(request.getListingIds());
        return ResponseEntity.ok(response);
    }
}
