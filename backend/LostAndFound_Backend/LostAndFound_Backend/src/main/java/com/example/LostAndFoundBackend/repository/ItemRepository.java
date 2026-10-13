
package com.example.LostAndFoundBackend.repository;

import com.example.LostAndFoundBackend.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    @Query("""
        SELECT i FROM Item i
        WHERE (:type IS NULL OR LOWER(i.type) = LOWER(:type))
        AND (:category IS NULL OR LOWER(i.category) = LOWER(:category))
        AND (
            :keyword IS NULL
            OR LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(i.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(i.location) LIKE LOWER(CONCAT('%', :keyword, '%'))
        )
        """)
    List<Item> searchItems(
            @Param("type") String type,
            @Param("category") String category,
            @Param("keyword") String keyword
    );
}
