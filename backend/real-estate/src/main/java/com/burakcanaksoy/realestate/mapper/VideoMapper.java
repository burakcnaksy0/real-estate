package com.burakcanaksoy.realestate.mapper;

import com.burakcanaksoy.realestate.model.Video;
import com.burakcanaksoy.realestate.response.VideoResponse;

public class VideoMapper {

    public static VideoResponse toResponse(Video video) {
        if (video == null) {
            return null;
        }

        VideoResponse response = new VideoResponse();
        response.setId(video.getId());
        response.setFileName(video.getFileName());
        response.setFilePath(video.getFilePath());
        response.setFileType(video.getFileType());
        response.setFileSize(video.getFileSize());
        response.setDisplayOrder(video.getDisplayOrder());
        response.setCreatedAt(video.getCreatedAt());

        return response;
    }
}
