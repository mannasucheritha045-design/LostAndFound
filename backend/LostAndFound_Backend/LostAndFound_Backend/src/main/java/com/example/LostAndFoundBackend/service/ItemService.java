
package com.example.LostAndFoundBackend.service;

import com.example.LostAndFoundBackend.entity.Item;
import com.example.LostAndFoundBackend.repository.ItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ItemService {

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    // Add an item
    public Item addItem(Item item) {
        return itemRepository.save(item);
    }

    // Get all items
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    // Get item by ID
    public Optional<Item> getItemById(Long id) {
        return itemRepository.findById(id);
    }

    // Update item
    public Optional<Item> updateItem(Long id, Item item) {
        return itemRepository.findById(id).map(oldItem -> {
            oldItem.setTitle(item.getTitle());
            oldItem.setDescription(item.getDescription());
            oldItem.setCategory(item.getCategory());
            oldItem.setType(item.getType());
            oldItem.setLocation(item.getLocation());
            oldItem.setDate(item.getDate());
            oldItem.setContactName(item.getContactName());
            oldItem.setContactEmail(item.getContactEmail());
            oldItem.setContactPhone(item.getContactPhone());
            oldItem.setStatus(item.getStatus());

            return itemRepository.save(oldItem);
        });
    }

    // Delete item
    public boolean deleteItem(Long id) {
        if (!itemRepository.existsById(id)) {
            return false;
        }

        itemRepository.deleteById(id);
        return true;
    }

    // Search items by type, category, or keyword
    public List<Item> searchItems(
            String type, String category, String keyword) {

        List<Item> items = itemRepository.findAll();

        return items.stream()
                .filter(item -> type == null || type.isBlank()
                        || type.equalsIgnoreCase(item.getType()))
                .filter(item -> category == null || category.isBlank()
                        || category.equalsIgnoreCase(item.getCategory()))
                .filter(item -> keyword == null || keyword.isBlank()
                        || (item.getTitle() != null
                        && item.getTitle().toLowerCase()
                        .contains(keyword.toLowerCase()))
                        || (item.getDescription() != null
                        && item.getDescription().toLowerCase()
                        .contains(keyword.toLowerCase())))
                .toList();
    }
}
