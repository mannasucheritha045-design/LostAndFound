package com.example.LostAndFoundBackend.controller;

import com.example.LostAndFoundBackend.entity.User;
import com.example.LostAndFoundBackend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        if (user.getName() == null || user.getEmail() == null
                || user.getPassword() == null
                || user.getName().isBlank()
                || user.getEmail().isBlank()
                || user.getPassword().length() < 8) {
            return ResponseEntity.badRequest().body(
                    Map.of("message",
                    "Name and email are required; password must be at least 8 characters."));
        }

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already registered."));
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");

        User saved = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of("id", saved.getId(),
                       "name", saved.getName(),
                       "email", saved.getEmail(),
                       "message", "Registration successful."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User request) {

        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Email and password are required."));
        }

        Optional<User> result =
                userRepository.findByEmail(request.getEmail());

        if (result.isEmpty() || !passwordEncoder.matches(
                request.getPassword(), result.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password."));
        }

        User user = result.get();

        return ResponseEntity.ok(
                Map.of("id", user.getId(),
                       "name", user.getName(),
                       "email", user.getEmail(),
                       "role", user.getRole(),
                       "message", "Login successful."));
    }
}