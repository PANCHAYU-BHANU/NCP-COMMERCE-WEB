package com.commers.ncp_com_web.repository;

import com.commers.ncp_com_web.entity.MediaGallery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaGalleryRepository extends JpaRepository<MediaGallery, Long> {
    List<MediaGallery> findByType(String type);
    List<MediaGallery> findByAlbum(String album);
}
