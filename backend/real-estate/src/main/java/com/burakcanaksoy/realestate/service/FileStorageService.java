package com.burakcanaksoy.realestate.service;

import com.burakcanaksoy.realestate.mapper.ImageMapper;
import com.burakcanaksoy.realestate.model.Image;
import com.burakcanaksoy.realestate.repository.ImageRepository;
import com.burakcanaksoy.realestate.response.ImageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final ImageRepository imageRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public ImageResponse uploadImage(MultipartFile file, Long listingId, String listingType, Boolean isPrimary) {
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, listingType.toLowerCase(), listingId.toString());
            Files.createDirectories(uploadPath);

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String filename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Create image entity
            Image image = new Image();
            image.setFileName(filename);
            image.setFilePath(filePath.toString());
            image.setFileType(file.getContentType());
            image.setFileSize(file.getSize());
            image.setListingId(listingId);
            image.setListingType(listingType);
            image.setIsPrimary(isPrimary != null ? isPrimary : false);

            // Set display order
            long imageCount = imageRepository.countByListingIdAndListingType(listingId, listingType);
            image.setDisplayOrder((int) imageCount);

            // If this is set as primary, unset other primary images
            if (image.getIsPrimary()) {
                imageRepository.findByListingIdAndListingTypeAndIsPrimaryTrue(listingId, listingType)
                        .ifPresent(existingPrimary -> {
                            existingPrimary.setIsPrimary(false);
                            imageRepository.save(existingPrimary);
                        });
            }

            Image savedImage = imageRepository.save(image);
            return ImageMapper.toResponse(savedImage);

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    public List<ImageResponse> getListingImages(Long listingId, String listingType) {
        return imageRepository.findByListingIdAndListingTypeOrderByDisplayOrderAsc(listingId, listingType)
                .stream()
                .map(ImageMapper::toResponse)
                .collect(Collectors.toList());
    }

    public void deleteImage(Long imageId) {
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        try {
            // Delete file from filesystem
            Path filePath = Paths.get(image.getFilePath());
            Files.deleteIfExists(filePath);

            // Delete from database
            imageRepository.delete(image);

        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file: " + e.getMessage(), e);
        }
    }

    public void deleteListingImages(Long listingId, String listingType) {
        List<Image> images = imageRepository.findByListingIdAndListingTypeOrderByDisplayOrderAsc(listingId,
                listingType);

        for (Image image : images) {
            try {
                Path filePath = Paths.get(image.getFilePath());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                // Log error but continue deleting other images
                System.err.println("Failed to delete file: " + image.getFilePath());
            }
        }

        imageRepository.deleteByListingIdAndListingType(listingId, listingType);
    }

    public org.springframework.core.io.Resource loadFileAsResource(Long imageId) {
        try {
            Image image = imageRepository.findById(imageId)
                    .orElseThrow(() -> new RuntimeException("Image not found " + imageId));

            Path filePath = Paths.get(image.getFilePath());

            // Eğer path relative ise, mevcut çalışma dizini ile birleştir
            if (!filePath.isAbsolute()) {
                String cwd = System.getProperty("user.dir");
                filePath = Paths.get(cwd).resolve(filePath);
            }

            filePath = filePath.normalize();

            System.out.println("DEBUG IMAGE LOAD: ID=" + imageId + ", Path=" + filePath.toAbsolutePath());

            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(
                    filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                System.err.println("ERROR IMAGE LOAD: File not found or not readable: " + filePath.toAbsolutePath());

                // Fallback: Try with just 'uploads' relative to run dir if explicit path failed
                if (!filePath.toString().contains("uploads")) {
                    Path fallback = Paths.get("uploads").resolve(image.getFilePath());
                    System.err.println("Trying fallback: " + fallback.toAbsolutePath());
                    org.springframework.core.io.Resource fbResource = new org.springframework.core.io.UrlResource(
                            fallback.toAbsolutePath().toUri());
                    if (fbResource.exists())
                        return fbResource;
                }

                throw new RuntimeException("File not found at path: " + filePath.toAbsolutePath());
            }
        } catch (Exception ex) {
            System.err.println("EXCEPTION IMAGE LOAD: " + ex.getMessage());
            ex.printStackTrace();
            throw new RuntimeException("File not found " + imageId, ex);
        }
    }

    public String getImageContentType(Long imageId) {
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found " + imageId));
        return image.getFileType();
    }

    public String uploadUserProfileImage(MultipartFile file, Long userId) {
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, "users", userId.toString());
            Files.createDirectories(uploadPath);

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String filename = "profile_" + UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return relative path or whatever you want to save in the User entity
            // For simplicity, we can return the filename if we serve it via a controller,
            // or a path.
            // Let's stick to the pattern used in uploadImage but we are not returning an
            // ImageResponse here, just the string path.
            return filePath.toString();

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    public void deleteUserProfileImage(Long userId) {
        try {
            Path uploadPath = Paths.get(uploadDir, "users", userId.toString());
            if (Files.exists(uploadPath)) {
                // Delete all files in the directory (should be only one profile picture but
                // let's be safe)
                // Or better, just delete the directory recursively if we want to cleanup
                // For now, let's keep it simple. If we store the path in User entity, we
                // usually pass that path here.
                // But since we only have userId, we might need to look it up or clear the
                // folder.

                // Let's assume we want to clear the folder
                java.nio.file.Files.walk(uploadPath)
                        .sorted(java.util.Comparator.reverseOrder())
                        .map(Path::toFile)
                        .forEach(java.io.File::delete);
            }
        } catch (IOException e) {
            // Log but don't fail hard
            System.err.println("Failed to delete user profile images: " + e.getMessage());
        }
    }
}
