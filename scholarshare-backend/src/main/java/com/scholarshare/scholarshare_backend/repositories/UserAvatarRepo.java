package com.scholarshare.scholarshare_backend.repositories;

import com.scholarshare.scholarshare_backend.entities.UserAvatar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserAvatarRepo extends JpaRepository<UserAvatar, Long> {
}
