
package com.example.LostAndFoundBackend.controller;

import com.example.LostAndFoundBackend.entity.Item;
import com.example.LostAndFoundBackend.repository.ItemRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/items")
@CrossOrigin(origins = "http://localhost:5173")
public class ItemImageController {

    private final ItemRepository itemRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public ItemImageController(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @PostMapping(
        value = "/{id}/image",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Item uploadImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image) {

        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Item not found"));

        if (image == null || image.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Please select an image");
        }

        if (image.getSize() > 5 * 1024 * 1024) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Image must be 5 MB or smaller");
        }

        String contentType = image.getContentType();
        Set<String> allowedTypes = Set.of(
                "image/jpeg", "image/png", "image/webp"
        );

        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only JPG, PNG, and WebP images are allowed");
        }

        String extension = switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Unsupported image type");
        };

        String filename = UUID.randomUUID() + extension;

        try {
            Path directory = Paths.get(uploadDir)
                    .toAbsolutePath().normalize();
            Files.createDirectories(directory);

            Path destination = directory.resolve(filename).normalize();

            if (!destination.startsWith(directory)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid file path");
            }

            image.transferTo(destination);

            item.setImageUrl("/uploads/" + filename);
            return itemRepository.save(item);

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not save image");
        }
    }
}
