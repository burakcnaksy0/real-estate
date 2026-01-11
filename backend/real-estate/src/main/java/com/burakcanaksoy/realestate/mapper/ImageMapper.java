package com.burakcanaksoy.realestate.mapper;

import com.burakcanaksoy.realestate.model.Image;
import com.burakcanaksoy.realestate.response.ImageResponse;

public class ImageMapper {

    public static ImageResponse toResponse(Image image) {
        if (image == null) {
            return null;
        }

        ImageResponse response = new ImageResponse();
        response.setId(image.getId());
        response.setFileName(image.getFileName());
        response.setFilePath(image.getFilePath());
        response.setFileType(image.getFileType());
        response.setFileSize(image.getFileSize());
        response.setIsPrimary(image.getIsPrimary());
        response.setDisplayOrder(image.getDisplayOrder());
        response.setCreatedAt(image.getCreatedAt());

        return response;
    }
}
