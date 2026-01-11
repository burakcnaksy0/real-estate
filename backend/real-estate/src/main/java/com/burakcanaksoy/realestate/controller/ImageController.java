package com.burakcanaksoy.realestate.controller;

import com.burakcanaksoy.realestate.response.ImageResponse;
import com.burakcanaksoy.realestate.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<ImageResponse> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("listingId") Long listingId,
            @RequestParam("listingType") String listingType,
            @RequestParam(value = "isPrimary", required = false) Boolean isPrimary) {

        ImageResponse response = fileStorageService.uploadImage(file, listingId, listingType, isPrimary);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/listing/{listingId}/{listingType}")
    public ResponseEntity<List<ImageResponse>> getListingImages(
            @PathVariable Long listingId,
            @PathVariable String listingType) {

        List<ImageResponse> images = fileStorageService.getListingImages(listingId, listingType);
        return ResponseEntity.ok(images);
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<String> deleteImage(@PathVariable Long imageId) {
        fileStorageService.deleteImage(imageId);
        return ResponseEntity.ok("Image deleted successfully");
    }

    @GetMapping("/view/{imageId}")
    public ResponseEntity<byte[]> viewImage(@PathVariable Long imageId) {
        try {
            Resource resource = fileStorageService.loadFileAsResource(imageId);
            byte[] imageBytes = resource.getInputStream().readAllBytes();

            String contentType = fileStorageService.getImageContentType(imageId);

            // Eğer veritabanında kayıtlı type yoksa veya generic ise, dosyadan bulmaya
            // çalış
            if (contentType == null || "application/octet-stream".equals(contentType)) {
                try {
                    contentType = java.nio.file.Files.probeContentType(resource.getFile().toPath());
                } catch (Exception e) {
                    System.err.println("Could not probe content type: " + e.getMessage());
                }

                // Hala null ise uzantıdan tahmin et
                if (contentType == null && resource.getFilename() != null) {
                    String filename = resource.getFilename().toLowerCase();
                    if (filename.endsWith(".jpg") || filename.endsWith(".jpeg"))
                        contentType = "image/jpeg";
                    else if (filename.endsWith(".png"))
                        contentType = "image/png";
                    else if (filename.endsWith(".gif"))
                        contentType = "image/gif";
                }
            }

            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            System.out.println("Serving image ID=" + imageId + " Type=" + contentType + " Size=" + imageBytes.length);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(imageBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
}
