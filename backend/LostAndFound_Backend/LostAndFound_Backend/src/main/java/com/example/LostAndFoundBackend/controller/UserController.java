package com.example.LostAndFoundBackend.controller;

import com.example.LostAndFoundBackend.entity.User;
import com.example.LostAndFoundBackend.repository.UserRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping
    public User createUser(@RequestBody User user) {

        user.setRole("USER");

        return userRepository.save(user);
    }

    @GetMapping
    public List<User> getAllUsers() {

        return userRepository.findAll();
    }
}