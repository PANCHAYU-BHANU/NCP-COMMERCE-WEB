package com.commers.ncp_com_web;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NcpComWebApplication {

	public static void main(String[] args) {
		SpringApplication.run(NcpComWebApplication.class, args);
	}

}
