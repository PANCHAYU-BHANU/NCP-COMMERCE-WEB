-- MySQL dump 10.13  Distrib 9.2.0, for Win64 (x86_64)
--
-- Host: localhost    Database: ncp_com_db
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `ncp_com_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `ncp_com_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `ncp_com_db`;

--
-- Table structure for table `al_national_results`
--

DROP TABLE IF EXISTS `al_national_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `al_national_results` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `a_count` int DEFAULT NULL,
  `b_count` int DEFAULT NULL,
  `c_count` int DEFAULT NULL,
  `f_count` int DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `pass_percentage` double DEFAULT NULL,
  `s_count` int DEFAULT NULL,
  `total_sat` int DEFAULT NULL,
  `exam_year` int NOT NULL,
  `school_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK2jtebn5mg62mi4jjte1r7thgx` (`school_id`),
  KEY `FKtm4yhlcxcuprnhxpoq55aur3j` (`subject_id`),
  CONSTRAINT `FK2jtebn5mg62mi4jjte1r7thgx` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  CONSTRAINT `FKtm4yhlcxcuprnhxpoq55aur3j` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `al_national_results`
--

LOCK TABLES `al_national_results` WRITE;
/*!40000 ALTER TABLE `al_national_results` DISABLE KEYS */;
/*!40000 ALTER TABLE `al_national_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cocurricular_activities`
--

DROP TABLE IF EXISTS `cocurricular_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cocurricular_activities` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `activity_type` varchar(255) NOT NULL,
  `position_or_event` varchar(255) NOT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKak7plequvlukvsjulqi8q3m08` (`student_id`),
  CONSTRAINT `FKak7plequvlukvsjulqi8q3m08` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cocurricular_activities`
--

LOCK TABLES `cocurricular_activities` WRITE;
/*!40000 ALTER TABLE `cocurricular_activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `cocurricular_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `committee_members`
--

DROP TABLE IF EXISTS `committee_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `committee_members` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `position` varchar(255) NOT NULL,
  `committee_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKdbyrs7nuk0wmqxsa2eudddp7h` (`committee_id`),
  KEY `FKqoxqk6i31houbkgtm2iy01hdf` (`user_id`),
  CONSTRAINT `FKdbyrs7nuk0wmqxsa2eudddp7h` FOREIGN KEY (`committee_id`) REFERENCES `committees` (`id`),
  CONSTRAINT `FKqoxqk6i31houbkgtm2iy01hdf` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `committee_members`
--

LOCK TABLES `committee_members` WRITE;
/*!40000 ALTER TABLE `committee_members` DISABLE KEYS */;
INSERT INTO `committee_members` VALUES (1,'Sec',1,1);
/*!40000 ALTER TABLE `committee_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `committee_messages`
--

DROP TABLE IF EXISTS `committee_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `committee_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `sender_position` varchar(255) DEFAULT NULL,
  `committee_id` bigint NOT NULL,
  `sender_id` bigint NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `is_pinned` bit(1) NOT NULL,
  `pinned_at` datetime(6) DEFAULT NULL,
  `pinned_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK4w83u5dq7q53w7o46f0dojc8p` (`committee_id`),
  KEY `FK9w5tybabph1lfo5foafq8sg8k` (`sender_id`),
  CONSTRAINT `FK4w83u5dq7q53w7o46f0dojc8p` FOREIGN KEY (`committee_id`) REFERENCES `committees` (`id`),
  CONSTRAINT `FK9w5tybabph1lfo5foafq8sg8k` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `committee_messages`
--

LOCK TABLES `committee_messages` WRITE;
/*!40000 ALTER TABLE `committee_messages` DISABLE KEYS */;
INSERT INTO `committee_messages` VALUES (3,'','2026-11-03 15:49:57.632513','Sec',1,1,'Cover of Harper\'s Bazaar Arabia , July 2020 (ID_57331)_ Magazines _ The FMD.jpeg',137702,'image','http://localhost:8080/uploads/c6a1bd2f-98df-43be-8ba5-7ee346dfc4c5_Cover_of_Harper_s_Bazaar_Arabia___July_2020__ID_57331___Magazines___The_FMD.jpeg',_binary '','2026-11-03 15:50:15.277555','Provincial Director');
/*!40000 ALTER TABLE `committee_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `committees`
--

DROP TABLE IF EXISTS `committees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `committees` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `zone_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKqrj13w7cysy7aguawbi5uuwkh` (`zone_id`),
  CONSTRAINT `FKqrj13w7cysy7aguawbi5uuwkh` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `committees`
--

LOCK TABLES `committees` WRITE;
/*!40000 ALTER TABLE `committees` DISABLE KEYS */;
INSERT INTO `committees` VALUES (1,'it','PROVINCIAL',NULL);
/*!40000 ALTER TABLE `committees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `districts`
--

DROP TABLE IF EXISTS `districts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `districts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `province_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK82doq1t64jhly7a546lpvnu2c` (`province_id`),
  CONSTRAINT `FK82doq1t64jhly7a546lpvnu2c` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `districts`
--

LOCK TABLES `districts` WRITE;
/*!40000 ALTER TABLE `districts` DISABLE KEYS */;
INSERT INTO `districts` VALUES (1,'Anuradhapura',1),(2,'Polonnaruwa',1);
/*!40000 ALTER TABLE `districts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `divisions`
--

DROP TABLE IF EXISTS `divisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `divisions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `zone_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK5crkacva5jsl8ui8s894ono5v` (`zone_id`),
  CONSTRAINT `FK5crkacva5jsl8ui8s894ono5v` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `divisions`
--

LOCK TABLES `divisions` WRITE;
/*!40000 ALTER TABLE `divisions` DISABLE KEYS */;
INSERT INTO `divisions` VALUES (1,'Anuradhapura',1);
/*!40000 ALTER TABLE `divisions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `educational_resources`
--

DROP TABLE IF EXISTS `educational_resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `educational_resources` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `exam_level` varchar(255) DEFAULT NULL,
  `exam_year` int DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `resource_type` varchar(255) DEFAULT NULL,
  `target_audience` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `uploaded_at` datetime(6) DEFAULT NULL,
  `subject_id` bigint DEFAULT NULL,
  `uploaded_by` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKmjjguqet0prp382hwk4j9xlk4` (`subject_id`),
  KEY `FK8uumtbx5g069g8tjo9m91csjm` (`uploaded_by`),
  CONSTRAINT `FK8uumtbx5g069g8tjo9m91csjm` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKmjjguqet0prp382hwk4j9xlk4` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `educational_resources`
--

LOCK TABLES `educational_resources` WRITE;
/*!40000 ALTER TABLE `educational_resources` DISABLE KEYS */;
/*!40000 ALTER TABLE `educational_resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `description` text,
  `event_date` datetime(6) NOT NULL,
  `exam_level` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'2026-11-06 18:46:49.530151','gsagui fusagfiuauf gsuigfuasif foag fiugfa fuifaig gfuigf siuafsfg sifgasf asifgs fosa fasf sgfo safg saifg saugf suoaifusgf usfa','2026-12-07 02:45:00.000000','GENERAL','/uploads/9fa69e5d-1747-4b72-aec7-ee008ede8829_Wattpad_logo.png','GGGGGGGGG');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `issues_suggestions`
--

DROP TABLE IF EXISTS `issues_suggestions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `issues_suggestions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKhutcsqmgladdiafgtpin1jbfi` (`user_id`),
  CONSTRAINT `FKhutcsqmgladdiafgtpin1jbfi` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `issues_suggestions`
--

LOCK TABLES `issues_suggestions` WRITE;
/*!40000 ALTER TABLE `issues_suggestions` DISABLE KEYS */;
/*!40000 ALTER TABLE `issues_suggestions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_gallery`
--

DROP TABLE IF EXISTS `media_gallery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_gallery` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `album` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `exam_level` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `uploaded_at` datetime(6) DEFAULT NULL,
  `url` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_gallery`
--

LOCK TABLES `media_gallery` WRITE;
/*!40000 ALTER TABLE `media_gallery` DISABLE KEYS */;
/*!40000 ALTER TABLE `media_gallery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `national_statistics`
--

DROP TABLE IF EXISTS `national_statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `national_statistics` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `pass_rate` double DEFAULT NULL,
  `total_schools` bigint DEFAULT NULL,
  `total_students` bigint DEFAULT NULL,
  `total_teachers` bigint DEFAULT NULL,
  `year` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKda4js180yhufliq6knkjre6kj` (`year`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `national_statistics`
--

LOCK TABLES `national_statistics` WRITE;
/*!40000 ALTER TABLE `national_statistics` DISABLE KEYS */;
/*!40000 ALTER TABLE `national_statistics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `exam_level` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES (1,'General','iuuhaf fha foahf iuas hfus fhausai fshf isuaf iusaf uasb fibsa fibasf asi afbid fuba isb ','2026-11-06 18:48:12.637800','GENERAL','Published','jijdas soaf ioasf');
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provinces`
--

DROP TABLE IF EXISTS `provinces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provinces` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKl256wnwfdobq071mcq7rckr9y` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provinces`
--

LOCK TABLES `provinces` WRITE;
/*!40000 ALTER TABLE `provinces` DISABLE KEYS */;
INSERT INTO `provinces` VALUES (1,'North Central Province');
/*!40000 ALTER TABLE `provinces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schools`
--

DROP TABLE IF EXISTS `schools`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schools` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `division_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKi0amwk9vd4lhgjtb2c943edtf` (`division_id`),
  CONSTRAINT `FKi0amwk9vd4lhgjtb2c943edtf` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schools`
--

LOCK TABLES `schools` WRITE;
/*!40000 ALTER TABLE `schools` DISABLE KEYS */;
INSERT INTO `schools` VALUES (1,NULL,'A/Central Collage',1);
/*!40000 ALTER TABLE `schools` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_details`
--

DROP TABLE IF EXISTS `staff_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `designation` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `whatsapp` varchar(255) DEFAULT NULL,
  `years_of_service` int DEFAULT NULL,
  `school_id` bigint NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK45exdr18my33orwdb15ulfwbc` (`school_id`),
  CONSTRAINT `FK45exdr18my33orwdb15ulfwbc` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_details`
--

LOCK TABLES `staff_details` WRITE;
/*!40000 ALTER TABLE `staff_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_al_results`
--

DROP TABLE IF EXISTS `student_al_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_al_results` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `grade` varchar(20) NOT NULL,
  `exam_year` int NOT NULL,
  `student_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKhue5koejnhwcwg9oxuuhihjqg` (`student_id`),
  KEY `FKahxtscqaiy4lsg4h9i6hvhs1b` (`subject_id`),
  CONSTRAINT `FKahxtscqaiy4lsg4h9i6hvhs1b` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `FKhue5koejnhwcwg9oxuuhihjqg` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_al_results`
--

LOCK TABLES `student_al_results` WRITE;
/*!40000 ALTER TABLE `student_al_results` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_al_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_al_summaries`
--

DROP TABLE IF EXISTS `student_al_summaries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_al_summaries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `district_rank` int DEFAULT NULL,
  `island_rank` int DEFAULT NULL,
  `exam_year` int NOT NULL,
  `z_score` double DEFAULT NULL,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKo3u96griu6lytklgxdgh57ri7` (`student_id`),
  CONSTRAINT `FKo3u96griu6lytklgxdgh57ri7` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_al_summaries`
--

LOCK TABLES `student_al_summaries` WRITE;
/*!40000 ALTER TABLE `student_al_summaries` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_al_summaries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_counts`
--

DROP TABLE IF EXISTS `student_counts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_counts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `count` int NOT NULL,
  `gender` varchar(255) NOT NULL,
  `grade` int NOT NULL,
  `school_id` bigint NOT NULL,
  `subject_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKee2ag28bx1hwuu12ukd7l00u3` (`school_id`),
  KEY `FKqdqoap2pfl3nuq00n7gfcvsaw` (`subject_id`),
  CONSTRAINT `FKee2ag28bx1hwuu12ukd7l00u3` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  CONSTRAINT `FKqdqoap2pfl3nuq00n7gfcvsaw` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_counts`
--

LOCK TABLES `student_counts` WRITE;
/*!40000 ALTER TABLE `student_counts` DISABLE KEYS */;
INSERT INTO `student_counts` VALUES (1,2,'MALE',12,1,NULL),(2,1,'FEMALE',12,1,NULL),(3,2,'MALE',13,1,NULL),(4,1,'FEMALE',13,1,NULL);
/*!40000 ALTER TABLE `student_counts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `gender` varchar(255) DEFAULT NULL,
  `grade` int NOT NULL,
  `index_number` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `whatsapp_number` varchar(255) DEFAULT NULL,
  `school_id` bigint NOT NULL,
  `al_year` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_school_student_index` (`school_id`,`index_number`),
  CONSTRAINT `FKdojmg8v3rw2ow4dev2b8q5oqq` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,'MALE',12,'20001','tom','719827653',1,2027),(2,'FEMALE',12,'20009','timi','789672783',1,2027),(3,'MALE',12,'20010','roy','987282937',1,2027),(7,'MALE',12,'260001','tom','719827653',1,2026),(8,'FEMALE',12,'260009','timi','789672783',1,2026),(9,'MALE',12,'260010','roy','987282937',1,2026);
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `medium` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  `description` text,
  `description_si` text,
  `image_url` varchar(255) DEFAULT NULL,
  `modules` text,
  `modules_si` text,
  `name_si` varchar(255) DEFAULT NULL,
  `name_ta` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,'All','Accounting','AL','21','from-blue-600 to-indigo-700','Core financial accounting principles, partnership accounts, manufacturing accounts, company accounting, auditing, and financial statement analysis.','මූල්‍ය ගිණුම්කරණ මූලධර්ම, හවුල් ව්‍යාපාර, නිෂ්පාදන ගිණුම්, සමාගම් ගිණුම්, විගණනය සහ මූල්‍ය ප්‍රකාශන විශ්ලේෂණය පිළිබඳ පූර්ණ න්‍යායාත්මක හා ප්‍රායෝගික අධ්‍යයනය.','/slide_1.png','Financial Statements, Cost & Management Accounting, Company Law & Auditing, Ratios & Interpretation','මූල්‍ය ප්‍රකාශන සැකසීම, පිරිවැය හා කළමනාකරණ ගිණුම්කරණය, සමාගම් හා විගණන ප්‍රමිතීන්, මූල්‍ය අනුපාත විශ්ලේෂණය','ගිණුම්කරණය','கணக்கியல்'),(2,'All','Business Studies','AL','22','from-emerald-600 to-teal-700','Business environment, commercial law, marketing management, human resources, operations, and modern entrepreneurship dynamics in Sri Lanka.','ව්‍යාපාර පරිසරය, වාණිජ නීතිය, අලෙවිකරණ කළමනාකරණය, මානව සම්පත්, මෙහෙයුම් සහ ශ්‍රී ලංකාවේ නූතන ව්‍යවසායකත්ව ප්‍රවණතා පිළිබඳ හැදෑරීම.','/commerce_students.jpg','Business Environment, Marketing & Sales, Human Resource Mgmt, Banking & Insurance','ව්‍යාපාර පරිසරය හා නීතිය, අලෙවිකරණ කළමනාකරණය, මානව සම්පත් කළමනාකරණය, බැංකු හා රක්ෂණ සේවා','ව්‍යාපාර අධ්‍යයනය','வணிகக் கல்வி'),(3,'All','Economics','AL','23','from-violet-600 to-purple-700','Microeconomic theory, price mechanism, market structures, macroeconomic stability, fiscal and monetary policies, and international trade in Sri Lanka.','ක්ෂුද්‍ර ආර්ථික විද්‍යාව, මිල යාන්ත්‍රණය, වෙළඳපල ව්‍යුහයන්, සාර්ව ආර්ථික ස්ථාවරත්වය, රාජ්‍ය මූල්‍ය හා මූල්‍ය ප්‍රතිපත්ති සහ ජාත්‍යන්තර වෙළඳාම.','/slide_2.png','Price Mechanism, National Income Accounting, Fiscal & Monetary Policy, International Trade','මිල යාන්ත්‍රණය හා ඉල්ලුම/සැපයුම, ජාතික ආදායම් ගිණුම්කරණය, මූල්‍ය හා රාජ්‍ය මූල්‍ය ප්‍රතිපත්ති, ජාත්‍යන්තර වෙළඳාම හා විදේශ විනිමය','ආර්ථික විද්‍යාව','பொருளாதாரம்'),(4,'All','Information & Communication Technology (ICT)','AL','43','from-cyan-600 to-blue-700','Database management systems, Python programming, computer networking, systems analysis, e-commerce, and business automation technologies.','දත්ත සමුදාය කළමනාකරණය (DBMS), පයිතන් ක්‍රමලේඛනය, ජාලකරණය, පද්ධති විශ්ලේෂණය, ඊ-වාණිජ්‍යය සහ ව්‍යාපාරික ස්වයංක්‍රීයකරණය.','/slide_3.png','Database Systems (SQL), Python Programming, Networking & Cloud, Web Technologies','දත්ත සමුදාය පද්ධති (SQL), පයිතන් ක්‍රමලේඛනය, පරිගණක ජාලකරණය, වෙබ් තාක්ෂණය හා ඊ-වාණිජ්‍යය','තොරතුරු හා සන්නිවේදන තාක්ෂණය (ICT)','தகவல் தொடர்பாடல் தொழில்நுட்பம்'),(5,'All','Business Statistics','AL','25','from-rose-600 to-pink-700','Descriptive statistics, probability distributions, sampling techniques, regression and time-series analysis for business forecasting.','විස්තරාත්මක සංඛ්‍යානය, සම්භාවිතා ව්‍යාප්ති, නියැදි ක්‍රම, ප්‍රතිපායන සහ කාල ශ්‍රේණි විශ්ලේෂණය පිළිබඳ හැදෑරීම.','/slide_1.png','Descriptive Statistics, Probability Distributions, Sampling Methods, Regression Analysis','විස්තරාත්මක සංඛ්‍යානය, සම්භාවිතා ව්‍යාප්ති, නියැදි ක්‍රමවේද, ප්‍රතිපායන විශ්ලේෂණය','ව්‍යාපාර සංඛ්‍යානය','வணிகப் புள்ளிவிபரம்'),(6,'All','Entrepreneurship Studies','AL','24','from-amber-600 to-orange-700','Ideation, startup launch, project formulation, venture capital, financial management for SME enterprises, and sustainable innovation.','ව්‍යාපාර අදහස් උත්පාදනය, ආරම්භක ව්‍යාපාර බිහිකිරීම, ව්‍යාපෘති වාර්තාකරණය, සුළු හා මධ්‍ය පරිමාණ මූල්‍යකරණය සහ තිරසර නවෝත්පාදනය.','/anuradhapura.png','Business Ideation, Business Plan Formulation, SME Financial Management, Innovation & Growth','ව්‍යාපාර සංකල්ප උත්පාදනය, ව්‍යාපාර සැලසුම් සැකසීම, සුළු හා මධ්‍ය පරිමාණ මූල්‍යකරණය, නවෝත්පාදනය හා ව්‍යාප්තිය','ව්‍යවසායකත්ව අධ්‍යයනය','தொழில்முயற்சி கல்வி'),(7,'All','Commerce & Accounting','OL','60','from-blue-600 to-teal-700','Foundational commerce, double-entry bookkeeping, cash book, ledger accounts, and basic final statements for G.C.E. O/L students.','සාමාන්‍ය පෙළ සිසුන් සඳහා මූලික වාණිජ්‍යය, ද්විත්ව සටහන් ක්‍රමය, මුදල් පොත, ලෙජර් ගිණුම් සහ මූලික අවසන් ගිණුම්කරණය.','/slide_1.png','Foundations of Commerce, Cash Book & Prime Entry, Ledger & Trial Balance, Basic Final Accounts','වාණිජ්‍යයේ පදනම, මුදල් පොත හා මූලික පොත්, ලෙජරය හා ශේෂ පිරික්සුම, මූලික අවසන් ගිණුම්','වාණිජ හා ගිණුම්කරණ අධ්‍යයනය','வணிகமும் கணக்கீட்டுக் கல்வியும்'),(8,'All','Business & Accounting Studies','OL','61','from-emerald-600 to-teal-700','Elementary business functions, banking procedures, trade transactions, and practical ledger maintenance.','ව්‍යාපාරික කටයුතු, බැංකු කාර්යපටිපාටි, වෙළඳ ගනුදෙනු සහ ප්‍රායෝගික ලෙජර් පවත්වාගෙන යාම පිළිබඳ හැදෑරීම.','/commerce_students.jpg','Business Functions, Banking Operations, Elementary Bookkeeping, Financial Statements','ව්‍යාපාරික කාර්යයන්, බැංකු මෙහෙයුම්, මූලික පොත් තැබීම, මූල්‍ය ප්‍රකාශන','ව්‍යාපාර හා ගිණුම්කරණ අධ්‍යයනය','வணிகமும் கணக்கீட்டுக் கல்வியும் (O/L)'),(9,'All','Entrepreneurship Studies (O/L)','OL','62','from-amber-600 to-orange-700','Introduction to entrepreneurial mindset, opportunity recognition, simple market survey, and micro-enterprise operations.','ව්‍යවසායකත්ව ආකල්ප, අවස්ථා හඳුනාගැනීම, සරල වෙළඳපල සමීක්ෂණ සහ ක්ෂුද්‍ර ව්‍යවසාය මෙහෙයුම් පිළිබඳ මූලික හැදෑරීම.','/anuradhapura.png','Entrepreneurial Mindset, Opportunity Identification, Simple Business Planning, Record Keeping','ව්‍යවසායකත්ව ආකල්ප, අවස්ථා හඳුනාගැනීම, සරල ව්‍යාපාර සැලසුම්කරණය, සටහන් තබාගැනීම','ව්‍යවසායකත්ව අධ්‍යයනය (සාමාන්‍ය පෙළ)','தொழில்முயற்சி கல்வி (O/L)');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_profiles`
--

DROP TABLE IF EXISTS `teacher_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher_profiles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `appointment_type` varchar(255) DEFAULT NULL,
  `current_school_name` varchar(255) DEFAULT NULL,
  `educational_qualifications` text,
  `email` varchar(255) DEFAULT NULL,
  `first_appointment_date` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `is_completed` bit(1) DEFAULT NULL,
  `name_with_initials` varchar(255) DEFAULT NULL,
  `nic` varchar(255) DEFAULT NULL,
  `official_address` text,
  `paper_marking` bit(1) DEFAULT NULL,
  `paper_marking_level` varchar(255) DEFAULT NULL,
  `personal_address` text,
  `previous_schools` text,
  `professional_qualifications` text,
  `profile_pic` text,
  `service_grade` varchar(255) DEFAULT NULL,
  `service_nature` varchar(255) DEFAULT NULL,
  `teaching_subjects` varchar(255) DEFAULT NULL,
  `training_needed` text,
  `whatsapp_number` varchar(255) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK85e2atxgeqqdc1ntgmupd4sia` (`user_id`),
  CONSTRAINT `FK38hlnhfrimybow0wdfwnsfhew` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_profiles`
--

LOCK TABLES `teacher_profiles` WRITE;
/*!40000 ALTER TABLE `teacher_profiles` DISABLE KEYS */;
INSERT INTO `teacher_profiles` VALUES (1,NULL,'A/Central Collage',NULL,'teacher@gmail.com',NULL,NULL,_binary '\0','School  teacher','200109202796',NULL,_binary '\0','NONE',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,5);
/*!40000 ALTER TABLE `teacher_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_subjects`
--

DROP TABLE IF EXISTS `teacher_subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher_subjects` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `grade` varchar(255) NOT NULL,
  `subject_id` bigint NOT NULL,
  `teacher_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKdweqkwxroox2u7pbmksehx04i` (`subject_id`),
  KEY `FK6dcl3ihufp4v0j1fuxlw4ksoj` (`teacher_id`),
  CONSTRAINT `FK6dcl3ihufp4v0j1fuxlw4ksoj` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`),
  CONSTRAINT `FKdweqkwxroox2u7pbmksehx04i` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_subjects`
--

LOCK TABLES `teacher_subjects` WRITE;
/*!40000 ALTER TABLE `teacher_subjects` DISABLE KEYS */;
/*!40000 ALTER TABLE `teacher_subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `school_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK25tvrvw3ww2p7mbt62abrbwev` (`school_id`),
  CONSTRAINT `FK25tvrvw3ww2p7mbt62abrbwev` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `term_test_marks`
--

DROP TABLE IF EXISTS `term_test_marks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `term_test_marks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `marks` double NOT NULL,
  `term` int NOT NULL,
  `exam_year` int NOT NULL,
  `student_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKj423wond1jg3lj3ahxeqgru67` (`student_id`),
  KEY `FKk23snu8vj37h9shuubmm6s599` (`subject_id`),
  CONSTRAINT `FKj423wond1jg3lj3ahxeqgru67` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FKk23snu8vj37h9shuubmm6s599` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `term_test_marks`
--

LOCK TABLES `term_test_marks` WRITE;
/*!40000 ALTER TABLE `term_test_marks` DISABLE KEYS */;
INSERT INTO `term_test_marks` VALUES (1,78,1,2027,1,1),(2,90,1,2027,2,1),(8,78,1,2026,7,1),(9,90,1,2026,8,1);
/*!40000 ALTER TABLE `term_test_marks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit_test_definitions`
--

DROP TABLE IF EXISTS `unit_test_definitions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit_test_definitions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` varchar(500) DEFAULT NULL,
  `unit_name` varchar(255) NOT NULL,
  `unit_number` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKrrtei5gnrav2rk0sonaaw2cde` (`unit_number`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_test_definitions`
--

LOCK TABLES `unit_test_definitions` WRITE;
/*!40000 ALTER TABLE `unit_test_definitions` DISABLE KEYS */;
INSERT INTO `unit_test_definitions` VALUES (1,'Official Provincial Commerce Syllabus Unit 1','Unit 1: Business Environment & Economic Foundations',1),(2,'Official Provincial Commerce Syllabus Unit 2','Unit 2: Accounting Equation & Prime Entry Books',2),(3,'Official Provincial Commerce Syllabus Unit 3','Unit 3: Preparation of Financial Statements',3),(4,'Official Provincial Commerce Syllabus Unit 4','Unit 4: Microeconomics & Market Equilibrium',4),(5,'Official Provincial Commerce Syllabus Unit 5','Unit 5: Macroeconomic Indicators & Fiscal Policy',5),(6,'Official Provincial Commerce Syllabus Unit 6','Unit 6: Business Forms & Organizational Structures',6),(7,'Official Provincial Commerce Syllabus Unit 7','Unit 7: Cost & Management Accounting Fundamentals',7),(8,'Official Provincial Commerce Syllabus Unit 8','Unit 8: Money, Banking & Financial Institutions',8),(9,'Official Provincial Commerce Syllabus Unit 9','Unit 9: International Trade & Exchange Rates',9),(10,'Official Provincial Commerce Syllabus Unit 10','Unit 10: Decision Making & Business Information Systems',10);
/*!40000 ALTER TABLE `unit_test_definitions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit_test_marks`
--

DROP TABLE IF EXISTS `unit_test_marks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit_test_marks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `marks` double NOT NULL,
  `unit_number` int NOT NULL,
  `exam_year` int NOT NULL,
  `student_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKrrbckvihfpqhkyx0vkirhan2p` (`student_id`),
  KEY `FKej69macl3btbkk1fgevc5nkgv` (`subject_id`),
  CONSTRAINT `FKej69macl3btbkk1fgevc5nkgv` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `FKrrbckvihfpqhkyx0vkirhan2p` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_test_marks`
--

LOCK TABLES `unit_test_marks` WRITE;
/*!40000 ALTER TABLE `unit_test_marks` DISABLE KEYS */;
/*!40000 ALTER TABLE `unit_test_marks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_subjects`
--

DROP TABLE IF EXISTS `user_subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_subjects` (
  `user_id` bigint NOT NULL,
  `subject_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`,`subject_id`),
  KEY `FKc9ornpqs4rj5g9ijn17p18wlu` (`subject_id`),
  CONSTRAINT `FK7jj09lbw40l669pbngidrnofu` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKc9ornpqs4rj5g9ijn17p18wlu` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_subjects`
--

LOCK TABLES `user_subjects` WRITE;
/*!40000 ALTER TABLE `user_subjects` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `exam_level` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `district_id` bigint DEFAULT NULL,
  `division_id` bigint DEFAULT NULL,
  `province_id` bigint DEFAULT NULL,
  `school_id` bigint DEFAULT NULL,
  `zone_id` bigint DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `is_section_head` bit(1) DEFAULT NULL,
  `profile_pic` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`),
  KEY `FKj30hhy45scxdgcj0usq90504r` (`district_id`),
  KEY `FKrtcf9am40qhu4k7ihqgcbqu0y` (`division_id`),
  KEY `FKmvmjqjo6wsc7b3594dlohbo2y` (`province_id`),
  KEY `FK3gj5j7vnsoxf1wp9n5hsqdiq3` (`school_id`),
  KEY `FK9ldg6jk1y4l8i5btcl4litk8g` (`zone_id`),
  CONSTRAINT `FK3gj5j7vnsoxf1wp9n5hsqdiq3` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  CONSTRAINT `FK9ldg6jk1y4l8i5btcl4litk8g` FOREIGN KEY (`zone_id`) REFERENCES `zones` (`id`),
  CONSTRAINT `FKj30hhy45scxdgcj0usq90504r` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`),
  CONSTRAINT `FKmvmjqjo6wsc7b3594dlohbo2y` FOREIGN KEY (`province_id`) REFERENCES `provinces` (`id`),
  CONSTRAINT `FKrtcf9am40qhu4k7ihqgcbqu0y` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'director@ncp.moe.gov.lk',NULL,'$2a$10$XMtx74S2A4SNvinaWD1hOu4k8QKGscBoDCCBWsGEOshV4PdimgaAi','ROLE_PROVINCIAL_DIRECTOR','provincial_director',NULL,NULL,1,NULL,NULL,'Provincial Director',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `zones`
--

DROP TABLE IF EXISTS `zones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `zones` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `district_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKg65v22nwkqw6onc814lps9g1x` (`district_id`),
  CONSTRAINT `FKg65v22nwkqw6onc814lps9g1x` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zones`
--

LOCK TABLES `zones` WRITE;
/*!40000 ALTER TABLE `zones` DISABLE KEYS */;
INSERT INTO `zones` VALUES (1,'Anuradhapura',1);
/*!40000 ALTER TABLE `zones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'ncp_com_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-08 15:27:58
