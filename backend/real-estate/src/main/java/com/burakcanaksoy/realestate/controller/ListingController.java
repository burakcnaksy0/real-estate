package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.request.GeneralFilterRequest;
import com.burakcanaksoy.realestate.response.BaseListingResponse;
import com.burakcanaksoy.realestate.response.CategoryStatsResponse;
import com.burakcanaksoy.realestate.response.VideoResponse;
import com.burakcanaksoy.realestate.service.FileStorageService;
import com.burakcanaksoy.realestate.service.ListingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.support.ResourceRegion;
import org.springframework.core.io.UrlResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import com.burakcanaksoy.realestate.repository.UserRepository;
import com.burakcanaksoy.realestate.model.User;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
@Slf4j
public class ListingController {

    private final ListingService listingService;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<BaseListingResponse>> getAllListings() {
        return ResponseEntity.ok(listingService.getAllListings());
    }

    @GetMapping("/page")
    public ResponseEntity<Page<BaseListingResponse>> getAllListings(Pageable pageable) {
        return ResponseEntity.ok(listingService.getAllListings(pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<BaseListingResponse>> search(@ModelAttribute GeneralFilterRequest filter,
            Pageable pageable) {
        log.info("Search request received. Filter: {}", filter);
        return ResponseEntity.ok(listingService.search(filter, pageable));
    }

    @GetMapping("/stats")
    public ResponseEntity<List<CategoryStatsResponse>> getCategoryStats() {
        return ResponseEntity.ok(listingService.getCategoryStats());
    }

    @GetMapping("/my-listings")
    public ResponseEntity<List<BaseListingResponse>> getMyListings(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        return ResponseEntity.ok(listingService.getListingsByOwnerId(user.getId()));
    }

    @PostMapping("/{id}/videos")
    public ResponseEntity<VideoResponse> uploadVideo(@PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("listingType") String listingType) {
        return ResponseEntity.ok(fileStorageService.uploadVideo(file, id, listingType));
    }

    @DeleteMapping("/videos/{videoId}")
    public ResponseEntity<Void> deleteVideo(@PathVariable Long videoId) {
        fileStorageService.deleteVideo(videoId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/videos")
    public ResponseEntity<List<VideoResponse>> getListingVideos(@PathVariable Long id,
            @RequestParam("listingType") String listingType) {
        return ResponseEntity.ok(fileStorageService.getListingVideos(id, listingType));
    }

    @GetMapping("/videos/{videoId}")
    public ResponseEntity<?> getVideo(@PathVariable Long videoId, @RequestHeader HttpHeaders headers) {
        try {
            log.info("Requesting video with ID: {}", videoId);
            List<HttpRange> ranges = headers.getRange();
            log.info("Range header: {}", ranges);

            Resource resource = fileStorageService.loadVideoAsResource(videoId);
            String contentType = fileStorageService.getVideoContentType(videoId);
            long contentLength = resource.contentLength();

            log.info("Video resource loaded. Content-Type: {}, Content-Length: {}", contentType, contentLength);

            // If no range header is present, return the full video
            if (ranges.isEmpty()) {
                log.info("Serving full video content for ID: {}", videoId);
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .contentLength(contentLength)
                        .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                        .body(resource);
            }

            // Handle range request
            HttpRange range = ranges.get(0);
            long start = range.getRangeStart(contentLength);
            long end = range.getRangeEnd(contentLength);
            long rangeLength = end - start + 1;

            ResourceRegion region = new ResourceRegion(resource, start, rangeLength);

            log.info("Serving partial content for ID: {}. Range: {}-{}", videoId, start, end);

            return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                    .contentType(MediaType.parseMediaType(contentType))
                    .contentLength(rangeLength)
                    .header("Content-Range", "bytes " + start + "-" + end + "/" + contentLength)
                    .header(HttpHeaders.ACCEPT_RANGES, "bytes")
                    .body(region);
        } catch (Exception e) {
            log.error("Error serving video {}: {}", videoId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error loading video: " + e.getMessage());
        }
    }
}