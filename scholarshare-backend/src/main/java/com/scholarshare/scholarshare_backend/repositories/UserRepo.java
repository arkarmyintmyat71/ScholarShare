package com.scholarshare.scholarshare_backend.repositories;

import com.scholarshare.scholarshare_backend.entities.User;
import com.scholarshare.scholarshare_backend.entities.enums.AccountStatus;
import com.scholarshare.scholarshare_backend.entities.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /** Used to send one notification per admin. */
    List<User> findByRoleAndAccountStatus(Role role, AccountStatus status);

    List<User> findByAccountStatusOrderByCreatedAtAsc(AccountStatus status);

    long countByAccountStatus(AccountStatus status);

    long countByRoleAndAccountStatus(Role role, AccountStatus status);

    /** Admin user list. status and q are optional (null = no filter). q must already be lower-case "%text%". */
    @Query(value = "select u from User u "
            + "where (:status is null or u.accountStatus = :status) "
            + "and (:q is null or lower(u.name) like :q or lower(u.email) like :q) "
            + "order by u.createdAt desc",
            countQuery = "select count(u) from User u "
                    + "where (:status is null or u.accountStatus = :status) "
                    + "and (:q is null or lower(u.name) like :q or lower(u.email) like :q)")
    Page<User> search(@Param("status") AccountStatus status, @Param("q") String q, Pageable pageable);
}
