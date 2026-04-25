package com.smartcampus;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SmartCampusApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartCampusApplication.class, args);
    }

    @Bean
    public CommandLineRunner startupMessage() {
        return args -> {
            System.out.println("====================================================================");
            System.out.println("✅ SUCCESS: SMART CAMPUS OPERATIONS HUB BACKEND IS NOW FULLY RUNNING!");
            System.out.println("====================================================================");
            System.out.println("--> Server Port: 8083");
            System.out.println("--> Waiting for connections...");
            System.out.println("====================================================================");
        };
    }

}
