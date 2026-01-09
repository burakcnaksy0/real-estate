package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.response.BaseListingResponse;
import com.burakcanaksoy.realestate.service.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

    @GetMapping
    public ResponseEntity<List<BaseListingResponse>> getAllListings() {
        return ResponseEntity.ok(listingService.getAllListings());
    }

    @GetMapping("/page")
    public ResponseEntity<Page<BaseListingResponse>> getAllListings(Pageable pageable) {
        return ResponseEntity.ok(listingService.getAllListings(pageable));
    }
}