/*!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.6.18-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: directus
-- ------------------------------------------------------
-- Server version	10.6.18-MariaDB-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Username` varchar(255) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`Username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'Hardeol','caca'),(2,'Nathan','JeSuisGay');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_access`
--

DROP TABLE IF EXISTS `directus_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_access` (
  `id` char(36) NOT NULL,
  `role` char(36) DEFAULT NULL,
  `user` char(36) DEFAULT NULL,
  `policy` char(36) NOT NULL,
  `sort` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `directus_access_role_foreign` (`role`),
  KEY `directus_access_user_foreign` (`user`),
  KEY `directus_access_policy_foreign` (`policy`),
  CONSTRAINT `directus_access_policy_foreign` FOREIGN KEY (`policy`) REFERENCES `directus_policies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `directus_access_role_foreign` FOREIGN KEY (`role`) REFERENCES `directus_roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `directus_access_user_foreign` FOREIGN KEY (`user`) REFERENCES `directus_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_access`
--

LOCK TABLES `directus_access` WRITE;
/*!40000 ALTER TABLE `directus_access` DISABLE KEYS */;
INSERT INTO `directus_access` VALUES ('6e113236-654f-46a2-a06f-9efaeb09cee2','a5c47827-ca45-49e6-8d4f-beb3697b0332',NULL,'d284e4b7-54e2-49f0-a91c-65d9a0d2aed3',NULL),('e9cab0e3-16ba-4a0d-9c5d-31e49b12f400',NULL,NULL,'abf8a154-5b1c-4a46-ac9c-7300570f4f17',1);
/*!40000 ALTER TABLE `directus_access` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_activity`
--

DROP TABLE IF EXISTS `directus_activity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_activity` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `action` varchar(45) NOT NULL,
  `user` char(36) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `collection` varchar(64) NOT NULL,
  `item` varchar(255) NOT NULL,
  `comment` text DEFAULT NULL,
  `origin` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `directus_activity_collection_foreign` (`collection`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_activity`
--

LOCK TABLES `directus_activity` WRITE;
/*!40000 ALTER TABLE `directus_activity` DISABLE KEYS */;
INSERT INTO `directus_activity` VALUES (1,'login','a803e90b-a90c-496f-ba49-a17b3c623cc1','2024-09-17 15:00:00','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','directus_users','a803e90b-a90c-496f-ba49-a17b3c623cc1',NULL,'http://127.0.0.1:4242'),(2,'create','a803e90b-a90c-496f-ba49-a17b3c623cc1','2024-09-17 17:32:21','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','directus_fields','1',NULL,'http://127.0.0.1:4242'),(3,'create','a803e90b-a90c-496f-ba49-a17b3c623cc1','2024-09-17 17:32:21','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','directus_collections','Users',NULL,'http://127.0.0.1:4242'),(4,'create','a803e90b-a90c-496f-ba49-a17b3c623cc1','2024-09-17 17:33:14','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','directus_fields','2',NULL,'http://127.0.0.1:4242'),(5,'create','a803e90b-a90c-496f-ba49-a17b3c623cc1','2024-09-17 17:33:28','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','directus_fields','3',NULL,'http://127.0.0.1:4242'),(6,'update','a803e90b-a90c-496f-ba49-a17b3c623cc1','2024-09-17 17:33:47','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','directus_fields','3',NULL,'http://127.0.0.1:4242'),(7,'update','a803e90b-a90c-496f-ba49-a17b3c623cc1','2024-09-17 17:34:39','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','directus_collections','Users',NULL,'http://127.0.0.1:4242'),(8,'create','a803e90b-a90c-496f-ba49-a17b3c623cc1','2024-09-17 17:34:54','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','Users','1',NULL,'http://127.0.0.1:4242'),(9,'create','a803e90b-a90c-496f-ba49-a17b3c623cc1','2024-09-17 17:35:06','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','Users','2',NULL,'http://127.0.0.1:4242'),(10,'create','a803e90b-a90c-496f-ba49-a17b3c623cc1','2024-09-17 20:28:10','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','directus_permissions','1',NULL,'http://127.0.0.1:4242'),(11,'create','a803e90b-a90c-496f-ba49-a17b3c623cc1','2024-09-17 20:28:10','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','directus_permissions','2',NULL,'http://127.0.0.1:4242'),(12,'create','a803e90b-a90c-496f-ba49-a17b3c623cc1','2024-09-17 20:28:10','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','directus_permissions','3',NULL,'http://127.0.0.1:4242'),(13,'update','a803e90b-a90c-496f-ba49-a17b3c623cc1','2024-09-17 20:28:10','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','directus_policies','abf8a154-5b1c-4a46-ac9c-7300570f4f17',NULL,'http://127.0.0.1:4242'),(14,'create','a803e90b-a90c-496f-ba49-a17b3c623cc1','2024-09-17 22:07:39','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36','directus_settings','1',NULL,'http://127.0.0.1:4242');
/*!40000 ALTER TABLE `directus_activity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_collections`
--

DROP TABLE IF EXISTS `directus_collections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_collections` (
  `collection` varchar(64) NOT NULL,
  `icon` varchar(64) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `display_template` varchar(255) DEFAULT NULL,
  `hidden` tinyint(1) NOT NULL DEFAULT 0,
  `singleton` tinyint(1) NOT NULL DEFAULT 0,
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  `archive_field` varchar(64) DEFAULT NULL,
  `archive_app_filter` tinyint(1) NOT NULL DEFAULT 1,
  `archive_value` varchar(255) DEFAULT NULL,
  `unarchive_value` varchar(255) DEFAULT NULL,
  `sort_field` varchar(64) DEFAULT NULL,
  `accountability` varchar(255) DEFAULT 'all',
  `color` varchar(255) DEFAULT NULL,
  `item_duplication_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`item_duplication_fields`)),
  `sort` int(11) DEFAULT NULL,
  `group` varchar(64) DEFAULT NULL,
  `collapse` varchar(255) NOT NULL DEFAULT 'open',
  `preview_url` varchar(255) DEFAULT NULL,
  `versioning` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`collection`),
  KEY `directus_collections_group_foreign` (`group`),
  CONSTRAINT `directus_collections_group_foreign` FOREIGN KEY (`group`) REFERENCES `directus_collections` (`collection`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_collections`
--

LOCK TABLES `directus_collections` WRITE;
/*!40000 ALTER TABLE `directus_collections` DISABLE KEYS */;
INSERT INTO `directus_collections` VALUES ('Users',NULL,NULL,NULL,0,0,NULL,NULL,1,NULL,NULL,NULL,'all','#3AFA05',NULL,NULL,NULL,'open',NULL,0);
/*!40000 ALTER TABLE `directus_collections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_dashboards`
--

DROP TABLE IF EXISTS `directus_dashboards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_dashboards` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `icon` varchar(64) NOT NULL DEFAULT 'dashboard',
  `note` text DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_created` char(36) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `directus_dashboards_user_created_foreign` (`user_created`),
  CONSTRAINT `directus_dashboards_user_created_foreign` FOREIGN KEY (`user_created`) REFERENCES `directus_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_dashboards`
--

LOCK TABLES `directus_dashboards` WRITE;
/*!40000 ALTER TABLE `directus_dashboards` DISABLE KEYS */;
/*!40000 ALTER TABLE `directus_dashboards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_extensions`
--

DROP TABLE IF EXISTS `directus_extensions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_extensions` (
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `id` char(36) NOT NULL,
  `folder` varchar(255) NOT NULL,
  `source` varchar(255) NOT NULL,
  `bundle` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_extensions`
--

LOCK TABLES `directus_extensions` WRITE;
/*!40000 ALTER TABLE `directus_extensions` DISABLE KEYS */;
/*!40000 ALTER TABLE `directus_extensions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_fields`
--

DROP TABLE IF EXISTS `directus_fields`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_fields` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `collection` varchar(64) NOT NULL,
  `field` varchar(64) NOT NULL,
  `special` varchar(64) DEFAULT NULL,
  `interface` varchar(64) DEFAULT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `display` varchar(64) DEFAULT NULL,
  `display_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`display_options`)),
  `readonly` tinyint(1) NOT NULL DEFAULT 0,
  `hidden` tinyint(1) NOT NULL DEFAULT 0,
  `sort` int(10) unsigned DEFAULT NULL,
  `width` varchar(30) DEFAULT 'full',
  `translations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`translations`)),
  `note` text DEFAULT NULL,
  `conditions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`conditions`)),
  `required` tinyint(1) DEFAULT 0,
  `group` varchar(64) DEFAULT NULL,
  `validation` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`validation`)),
  `validation_message` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `directus_fields_collection_foreign` (`collection`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_fields`
--

LOCK TABLES `directus_fields` WRITE;
/*!40000 ALTER TABLE `directus_fields` DISABLE KEYS */;
INSERT INTO `directus_fields` VALUES (1,'Users','id',NULL,'input',NULL,NULL,NULL,1,1,1,'full',NULL,NULL,NULL,0,NULL,NULL,NULL),(2,'Users','Username',NULL,'input',NULL,NULL,NULL,0,0,2,'full',NULL,NULL,NULL,1,NULL,NULL,NULL),(3,'Users','Password',NULL,'input',NULL,NULL,NULL,0,0,3,'full',NULL,NULL,NULL,1,NULL,NULL,NULL);
/*!40000 ALTER TABLE `directus_fields` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_files`
--

DROP TABLE IF EXISTS `directus_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_files` (
  `id` char(36) NOT NULL,
  `storage` varchar(255) NOT NULL,
  `filename_disk` varchar(255) DEFAULT NULL,
  `filename_download` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `folder` char(36) DEFAULT NULL,
  `uploaded_by` char(36) DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `modified_by` char(36) DEFAULT NULL,
  `modified_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `charset` varchar(50) DEFAULT NULL,
  `filesize` bigint(20) DEFAULT NULL,
  `width` int(10) unsigned DEFAULT NULL,
  `height` int(10) unsigned DEFAULT NULL,
  `duration` int(10) unsigned DEFAULT NULL,
  `embed` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `location` text DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `focal_point_x` int(11) DEFAULT NULL,
  `focal_point_y` int(11) DEFAULT NULL,
  `tus_id` varchar(64) DEFAULT NULL,
  `tus_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tus_data`)),
  `uploaded_on` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  KEY `directus_files_uploaded_by_foreign` (`uploaded_by`),
  KEY `directus_files_modified_by_foreign` (`modified_by`),
  KEY `directus_files_folder_foreign` (`folder`),
  CONSTRAINT `directus_files_folder_foreign` FOREIGN KEY (`folder`) REFERENCES `directus_folders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `directus_files_modified_by_foreign` FOREIGN KEY (`modified_by`) REFERENCES `directus_users` (`id`),
  CONSTRAINT `directus_files_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `directus_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_files`
--

LOCK TABLES `directus_files` WRITE;
/*!40000 ALTER TABLE `directus_files` DISABLE KEYS */;
/*!40000 ALTER TABLE `directus_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_flows`
--

DROP TABLE IF EXISTS `directus_flows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_flows` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `icon` varchar(64) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `trigger` varchar(255) DEFAULT NULL,
  `accountability` varchar(255) DEFAULT 'all',
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `operation` char(36) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_created` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `directus_flows_operation_unique` (`operation`),
  KEY `directus_flows_user_created_foreign` (`user_created`),
  CONSTRAINT `directus_flows_user_created_foreign` FOREIGN KEY (`user_created`) REFERENCES `directus_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_flows`
--

LOCK TABLES `directus_flows` WRITE;
/*!40000 ALTER TABLE `directus_flows` DISABLE KEYS */;
/*!40000 ALTER TABLE `directus_flows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_folders`
--

DROP TABLE IF EXISTS `directus_folders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_folders` (
  `id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `parent` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `directus_folders_parent_foreign` (`parent`),
  CONSTRAINT `directus_folders_parent_foreign` FOREIGN KEY (`parent`) REFERENCES `directus_folders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_folders`
--

LOCK TABLES `directus_folders` WRITE;
/*!40000 ALTER TABLE `directus_folders` DISABLE KEYS */;
/*!40000 ALTER TABLE `directus_folders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_migrations`
--

DROP TABLE IF EXISTS `directus_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_migrations` (
  `version` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_migrations`
--

LOCK TABLES `directus_migrations` WRITE;
/*!40000 ALTER TABLE `directus_migrations` DISABLE KEYS */;
INSERT INTO `directus_migrations` VALUES ('20201028A','Remove Collection Foreign Keys','2024-09-17 16:53:51'),('20201029A','Remove System Relations','2024-09-17 16:53:51'),('20201029B','Remove System Collections','2024-09-17 16:53:51'),('20201029C','Remove System Fields','2024-09-17 16:53:51'),('20201105A','Add Cascade System Relations','2024-09-17 16:53:52'),('20201105B','Change Webhook URL Type','2024-09-17 16:53:52'),('20210225A','Add Relations Sort Field','2024-09-17 16:53:53'),('20210304A','Remove Locked Fields','2024-09-17 16:53:53'),('20210312A','Webhooks Collections Text','2024-09-17 16:53:53'),('20210331A','Add Refresh Interval','2024-09-17 16:53:53'),('20210415A','Make Filesize Nullable','2024-09-17 16:53:53'),('20210416A','Add Collections Accountability','2024-09-17 16:53:53'),('20210422A','Remove Files Interface','2024-09-17 16:53:53'),('20210506A','Rename Interfaces','2024-09-17 16:53:53'),('20210510A','Restructure Relations','2024-09-17 16:53:53'),('20210518A','Add Foreign Key Constraints','2024-09-17 16:53:53'),('20210519A','Add System Fk Triggers','2024-09-17 16:53:53'),('20210521A','Add Collections Icon Color','2024-09-17 16:53:54'),('20210525A','Add Insights','2024-09-17 16:53:54'),('20210608A','Add Deep Clone Config','2024-09-17 16:53:54'),('20210626A','Change Filesize Bigint','2024-09-17 16:53:54'),('20210716A','Add Conditions to Fields','2024-09-17 16:53:54'),('20210721A','Add Default Folder','2024-09-17 16:53:54'),('20210802A','Replace Groups','2024-09-17 16:53:54'),('20210803A','Add Required to Fields','2024-09-17 16:53:54'),('20210805A','Update Groups','2024-09-17 16:53:54'),('20210805B','Change Image Metadata Structure','2024-09-17 16:53:54'),('20210811A','Add Geometry Config','2024-09-17 16:53:54'),('20210831A','Remove Limit Column','2024-09-17 16:53:54'),('20210903A','Add Auth Provider','2024-09-17 16:53:54'),('20210907A','Webhooks Collections Not Null','2024-09-17 16:53:54'),('20210910A','Move Module Setup','2024-09-17 16:53:54'),('20210920A','Webhooks URL Not Null','2024-09-17 16:53:54'),('20210924A','Add Collection Organization','2024-09-17 16:53:54'),('20210927A','Replace Fields Group','2024-09-17 16:53:54'),('20210927B','Replace M2M Interface','2024-09-17 16:53:54'),('20210929A','Rename Login Action','2024-09-17 16:53:54'),('20211007A','Update Presets','2024-09-17 16:53:54'),('20211009A','Add Auth Data','2024-09-17 16:53:54'),('20211016A','Add Webhook Headers','2024-09-17 16:53:55'),('20211103A','Set Unique to User Token','2024-09-17 16:53:55'),('20211103B','Update Special Geometry','2024-09-17 16:53:55'),('20211104A','Remove Collections Listing','2024-09-17 16:53:55'),('20211118A','Add Notifications','2024-09-17 16:53:55'),('20211211A','Add Shares','2024-09-17 16:53:55'),('20211230A','Add Project Descriptor','2024-09-17 16:53:55'),('20220303A','Remove Default Project Color','2024-09-17 16:53:55'),('20220308A','Add Bookmark Icon and Color','2024-09-17 16:53:55'),('20220314A','Add Translation Strings','2024-09-17 16:53:55'),('20220322A','Rename Field Typecast Flags','2024-09-17 16:53:55'),('20220323A','Add Field Validation','2024-09-17 16:53:55'),('20220325A','Fix Typecast Flags','2024-09-17 16:53:55'),('20220325B','Add Default Language','2024-09-17 16:53:55'),('20220402A','Remove Default Value Panel Icon','2024-09-17 16:53:55'),('20220429A','Add Flows','2024-09-17 16:53:56'),('20220429B','Add Color to Insights Icon','2024-09-17 16:53:56'),('20220429C','Drop Non Null From IP of Activity','2024-09-17 16:53:56'),('20220429D','Drop Non Null From Sender of Notifications','2024-09-17 16:53:56'),('20220614A','Rename Hook Trigger to Event','2024-09-17 16:53:56'),('20220801A','Update Notifications Timestamp Column','2024-09-17 16:53:56'),('20220802A','Add Custom Aspect Ratios','2024-09-17 16:53:56'),('20220826A','Add Origin to Accountability','2024-09-17 16:53:56'),('20230401A','Update Material Icons','2024-09-17 16:53:56'),('20230525A','Add Preview Settings','2024-09-17 16:53:56'),('20230526A','Migrate Translation Strings','2024-09-17 16:53:56'),('20230721A','Require Shares Fields','2024-09-17 16:53:56'),('20230823A','Add Content Versioning','2024-09-17 16:53:56'),('20230927A','Themes','2024-09-17 16:53:57'),('20231009A','Update CSV Fields to Text','2024-09-17 16:53:57'),('20231009B','Update Panel Options','2024-09-17 16:53:57'),('20231010A','Add Extensions','2024-09-17 16:53:57'),('20231215A','Add Focalpoints','2024-09-17 16:53:57'),('20240122A','Add Report URL Fields','2024-09-17 16:53:57'),('20240204A','Marketplace','2024-09-17 16:53:57'),('20240305A','Change Useragent Type','2024-09-17 16:53:57'),('20240311A','Deprecate Webhooks','2024-09-17 16:53:57'),('20240422A','Public Registration','2024-09-17 16:53:57'),('20240515A','Add Session Window','2024-09-17 16:53:57'),('20240701A','Add Tus Data','2024-09-17 16:53:57'),('20240716A','Update Files Date Fields','2024-09-17 16:53:57'),('20240806A','Permissions Policies','2024-09-17 16:53:58'),('20240817A','Update Icon Fields Length','2024-09-17 16:53:58');
/*!40000 ALTER TABLE `directus_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_notifications`
--

DROP TABLE IF EXISTS `directus_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_notifications` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp NULL DEFAULT current_timestamp(),
  `status` varchar(255) DEFAULT 'inbox',
  `recipient` char(36) NOT NULL,
  `sender` char(36) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `collection` varchar(64) DEFAULT NULL,
  `item` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `directus_notifications_recipient_foreign` (`recipient`),
  KEY `directus_notifications_sender_foreign` (`sender`),
  CONSTRAINT `directus_notifications_recipient_foreign` FOREIGN KEY (`recipient`) REFERENCES `directus_users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `directus_notifications_sender_foreign` FOREIGN KEY (`sender`) REFERENCES `directus_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_notifications`
--

LOCK TABLES `directus_notifications` WRITE;
/*!40000 ALTER TABLE `directus_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `directus_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_operations`
--

DROP TABLE IF EXISTS `directus_operations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_operations` (
  `id` char(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `key` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `position_x` int(11) NOT NULL,
  `position_y` int(11) NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `resolve` char(36) DEFAULT NULL,
  `reject` char(36) DEFAULT NULL,
  `flow` char(36) NOT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_created` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `directus_operations_resolve_unique` (`resolve`),
  UNIQUE KEY `directus_operations_reject_unique` (`reject`),
  KEY `directus_operations_flow_foreign` (`flow`),
  KEY `directus_operations_user_created_foreign` (`user_created`),
  CONSTRAINT `directus_operations_flow_foreign` FOREIGN KEY (`flow`) REFERENCES `directus_flows` (`id`) ON DELETE CASCADE,
  CONSTRAINT `directus_operations_reject_foreign` FOREIGN KEY (`reject`) REFERENCES `directus_operations` (`id`),
  CONSTRAINT `directus_operations_resolve_foreign` FOREIGN KEY (`resolve`) REFERENCES `directus_operations` (`id`),
  CONSTRAINT `directus_operations_user_created_foreign` FOREIGN KEY (`user_created`) REFERENCES `directus_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_operations`
--

LOCK TABLES `directus_operations` WRITE;
/*!40000 ALTER TABLE `directus_operations` DISABLE KEYS */;
/*!40000 ALTER TABLE `directus_operations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_panels`
--

DROP TABLE IF EXISTS `directus_panels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_panels` (
  `id` char(36) NOT NULL,
  `dashboard` char(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `icon` varchar(64) DEFAULT NULL,
  `color` varchar(10) DEFAULT NULL,
  `show_header` tinyint(1) NOT NULL DEFAULT 0,
  `note` text DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  `position_x` int(11) NOT NULL,
  `position_y` int(11) NOT NULL,
  `width` int(11) NOT NULL,
  `height` int(11) NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_created` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `directus_panels_dashboard_foreign` (`dashboard`),
  KEY `directus_panels_user_created_foreign` (`user_created`),
  CONSTRAINT `directus_panels_dashboard_foreign` FOREIGN KEY (`dashboard`) REFERENCES `directus_dashboards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `directus_panels_user_created_foreign` FOREIGN KEY (`user_created`) REFERENCES `directus_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_panels`
--

LOCK TABLES `directus_panels` WRITE;
/*!40000 ALTER TABLE `directus_panels` DISABLE KEYS */;
/*!40000 ALTER TABLE `directus_panels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_permissions`
--

DROP TABLE IF EXISTS `directus_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_permissions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `collection` varchar(64) NOT NULL,
  `action` varchar(10) NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `validation` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`validation`)),
  `presets` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`presets`)),
  `fields` text DEFAULT NULL,
  `policy` char(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `directus_permissions_collection_foreign` (`collection`),
  KEY `directus_permissions_policy_foreign` (`policy`),
  CONSTRAINT `directus_permissions_policy_foreign` FOREIGN KEY (`policy`) REFERENCES `directus_policies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_permissions`
--

LOCK TABLES `directus_permissions` WRITE;
/*!40000 ALTER TABLE `directus_permissions` DISABLE KEYS */;
INSERT INTO `directus_permissions` VALUES (1,'Users','read',NULL,NULL,NULL,'*','abf8a154-5b1c-4a46-ac9c-7300570f4f17'),(2,'Users','update',NULL,NULL,NULL,'*','abf8a154-5b1c-4a46-ac9c-7300570f4f17'),(3,'Users','delete',NULL,NULL,NULL,'*','abf8a154-5b1c-4a46-ac9c-7300570f4f17');
/*!40000 ALTER TABLE `directus_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_policies`
--

DROP TABLE IF EXISTS `directus_policies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_policies` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `icon` varchar(64) NOT NULL DEFAULT 'badge',
  `description` text DEFAULT NULL,
  `ip_access` text DEFAULT NULL,
  `enforce_tfa` tinyint(1) NOT NULL DEFAULT 0,
  `admin_access` tinyint(1) NOT NULL DEFAULT 0,
  `app_access` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_policies`
--

LOCK TABLES `directus_policies` WRITE;
/*!40000 ALTER TABLE `directus_policies` DISABLE KEYS */;
INSERT INTO `directus_policies` VALUES ('abf8a154-5b1c-4a46-ac9c-7300570f4f17','$t:public_label','public','$t:public_description',NULL,0,0,1),('d284e4b7-54e2-49f0-a91c-65d9a0d2aed3','Administrator','verified','$t:admin_description',NULL,0,1,1);
/*!40000 ALTER TABLE `directus_policies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_presets`
--

DROP TABLE IF EXISTS `directus_presets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_presets` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `bookmark` varchar(255) DEFAULT NULL,
  `user` char(36) DEFAULT NULL,
  `role` char(36) DEFAULT NULL,
  `collection` varchar(64) DEFAULT NULL,
  `search` varchar(100) DEFAULT NULL,
  `layout` varchar(100) DEFAULT 'tabular',
  `layout_query` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`layout_query`)),
  `layout_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`layout_options`)),
  `refresh_interval` int(11) DEFAULT NULL,
  `filter` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`filter`)),
  `icon` varchar(64) DEFAULT 'bookmark',
  `color` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `directus_presets_collection_foreign` (`collection`),
  KEY `directus_presets_user_foreign` (`user`),
  KEY `directus_presets_role_foreign` (`role`),
  CONSTRAINT `directus_presets_role_foreign` FOREIGN KEY (`role`) REFERENCES `directus_roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `directus_presets_user_foreign` FOREIGN KEY (`user`) REFERENCES `directus_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_presets`
--

LOCK TABLES `directus_presets` WRITE;
/*!40000 ALTER TABLE `directus_presets` DISABLE KEYS */;
INSERT INTO `directus_presets` VALUES (1,NULL,'a803e90b-a90c-496f-ba49-a17b3c623cc1',NULL,'directus_users',NULL,'cards','{\"cards\":{\"sort\":[\"email\"],\"page\":1}}','{\"cards\":{\"icon\":\"account_circle\",\"title\":\"{{ first_name }} {{ last_name }}\",\"subtitle\":\"{{ email }}\",\"size\":4}}',NULL,NULL,'bookmark',NULL);
/*!40000 ALTER TABLE `directus_presets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_relations`
--

DROP TABLE IF EXISTS `directus_relations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_relations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `many_collection` varchar(64) NOT NULL,
  `many_field` varchar(64) NOT NULL,
  `one_collection` varchar(64) DEFAULT NULL,
  `one_field` varchar(64) DEFAULT NULL,
  `one_collection_field` varchar(64) DEFAULT NULL,
  `one_allowed_collections` text DEFAULT NULL,
  `junction_field` varchar(64) DEFAULT NULL,
  `sort_field` varchar(64) DEFAULT NULL,
  `one_deselect_action` varchar(255) NOT NULL DEFAULT 'nullify',
  PRIMARY KEY (`id`),
  KEY `directus_relations_many_collection_foreign` (`many_collection`),
  KEY `directus_relations_one_collection_foreign` (`one_collection`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_relations`
--

LOCK TABLES `directus_relations` WRITE;
/*!40000 ALTER TABLE `directus_relations` DISABLE KEYS */;
/*!40000 ALTER TABLE `directus_relations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_revisions`
--

DROP TABLE IF EXISTS `directus_revisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_revisions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `activity` int(10) unsigned NOT NULL,
  `collection` varchar(64) NOT NULL,
  `item` varchar(255) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `delta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`delta`)),
  `parent` int(10) unsigned DEFAULT NULL,
  `version` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `directus_revisions_collection_foreign` (`collection`),
  KEY `directus_revisions_parent_foreign` (`parent`),
  KEY `directus_revisions_activity_foreign` (`activity`),
  KEY `directus_revisions_version_foreign` (`version`),
  CONSTRAINT `directus_revisions_activity_foreign` FOREIGN KEY (`activity`) REFERENCES `directus_activity` (`id`) ON DELETE CASCADE,
  CONSTRAINT `directus_revisions_parent_foreign` FOREIGN KEY (`parent`) REFERENCES `directus_revisions` (`id`),
  CONSTRAINT `directus_revisions_version_foreign` FOREIGN KEY (`version`) REFERENCES `directus_versions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_revisions`
--

LOCK TABLES `directus_revisions` WRITE;
/*!40000 ALTER TABLE `directus_revisions` DISABLE KEYS */;
INSERT INTO `directus_revisions` VALUES (1,2,'directus_fields','1','{\"sort\":1,\"hidden\":true,\"interface\":\"input\",\"readonly\":true,\"field\":\"id\",\"collection\":\"Users\"}','{\"sort\":1,\"hidden\":true,\"interface\":\"input\",\"readonly\":true,\"field\":\"id\",\"collection\":\"Users\"}',NULL,NULL),(2,3,'directus_collections','Users','{\"singleton\":false,\"collection\":\"Users\"}','{\"singleton\":false,\"collection\":\"Users\"}',NULL,NULL),(3,4,'directus_fields','2','{\"sort\":2,\"interface\":\"input\",\"special\":null,\"required\":true,\"collection\":\"Users\",\"field\":\"Username\"}','{\"sort\":2,\"interface\":\"input\",\"special\":null,\"required\":true,\"collection\":\"Users\",\"field\":\"Username\"}',NULL,NULL),(4,5,'directus_fields','3','{\"sort\":3,\"interface\":\"input\",\"special\":null,\"collection\":\"Users\",\"field\":\"Password\"}','{\"sort\":3,\"interface\":\"input\",\"special\":null,\"collection\":\"Users\",\"field\":\"Password\"}',NULL,NULL),(5,6,'directus_fields','3','{\"id\":3,\"collection\":\"Users\",\"field\":\"Password\",\"special\":null,\"interface\":\"input\",\"options\":null,\"display\":null,\"display_options\":null,\"readonly\":false,\"hidden\":false,\"sort\":3,\"width\":\"full\",\"translations\":null,\"note\":null,\"conditions\":null,\"required\":true,\"group\":null,\"validation\":null,\"validation_message\":null}','{\"collection\":\"Users\",\"field\":\"Password\",\"required\":true}',NULL,NULL),(6,7,'directus_collections','Users','{\"collection\":\"Users\",\"icon\":null,\"note\":null,\"display_template\":null,\"hidden\":false,\"singleton\":false,\"translations\":null,\"archive_field\":null,\"archive_app_filter\":true,\"archive_value\":null,\"unarchive_value\":null,\"sort_field\":null,\"accountability\":\"all\",\"color\":\"#3AFA05\",\"item_duplication_fields\":null,\"sort\":null,\"group\":null,\"collapse\":\"open\",\"preview_url\":null,\"versioning\":false}','{\"color\":\"#3AFA05\"}',NULL,NULL),(7,8,'Users','1','{\"Username\":\"Hardeol\",\"Password\":\"caca\"}','{\"Username\":\"Hardeol\",\"Password\":\"caca\"}',NULL,NULL),(8,9,'Users','2','{\"Username\":\"Nathan\",\"Password\":\"JeSuisGay\"}','{\"Username\":\"Nathan\",\"Password\":\"JeSuisGay\"}',NULL,NULL),(9,10,'directus_permissions','1','{\"policy\":\"abf8a154-5b1c-4a46-ac9c-7300570f4f17\",\"permissions\":null,\"validation\":null,\"fields\":[\"*\"],\"presets\":null,\"collection\":\"Users\",\"action\":\"read\"}','{\"policy\":\"abf8a154-5b1c-4a46-ac9c-7300570f4f17\",\"permissions\":null,\"validation\":null,\"fields\":[\"*\"],\"presets\":null,\"collection\":\"Users\",\"action\":\"read\"}',12,NULL),(10,11,'directus_permissions','2','{\"policy\":\"abf8a154-5b1c-4a46-ac9c-7300570f4f17\",\"permissions\":null,\"validation\":null,\"fields\":[\"*\"],\"presets\":null,\"collection\":\"Users\",\"action\":\"update\"}','{\"policy\":\"abf8a154-5b1c-4a46-ac9c-7300570f4f17\",\"permissions\":null,\"validation\":null,\"fields\":[\"*\"],\"presets\":null,\"collection\":\"Users\",\"action\":\"update\"}',12,NULL),(11,12,'directus_permissions','3','{\"policy\":\"abf8a154-5b1c-4a46-ac9c-7300570f4f17\",\"permissions\":null,\"validation\":null,\"fields\":[\"*\"],\"presets\":null,\"collection\":\"Users\",\"action\":\"delete\"}','{\"policy\":\"abf8a154-5b1c-4a46-ac9c-7300570f4f17\",\"permissions\":null,\"validation\":null,\"fields\":[\"*\"],\"presets\":null,\"collection\":\"Users\",\"action\":\"delete\"}',12,NULL),(12,13,'directus_policies','abf8a154-5b1c-4a46-ac9c-7300570f4f17','{\"id\":\"abf8a154-5b1c-4a46-ac9c-7300570f4f17\",\"name\":\"$t:public_label\",\"icon\":\"public\",\"description\":\"$t:public_description\",\"ip_access\":null,\"enforce_tfa\":false,\"admin_access\":false,\"app_access\":true,\"permissions\":[1,2,3],\"users\":[\"e9cab0e3-16ba-4a0d-9c5d-31e49b12f400\"],\"roles\":[\"e9cab0e3-16ba-4a0d-9c5d-31e49b12f400\"]}','{\"app_access\":true}',NULL,NULL),(13,14,'directus_settings','1','{\"module_bar\":[{\"type\":\"module\",\"id\":\"content\",\"enabled\":true},{\"type\":\"module\",\"id\":\"users\",\"enabled\":true},{\"type\":\"module\",\"id\":\"files\",\"enabled\":true},{\"type\":\"module\",\"id\":\"insights\",\"enabled\":true},{\"type\":\"link\",\"id\":\"docs\",\"enabled\":true,\"name\":\"$t:documentation\",\"icon\":\"help\",\"url\":\"https://docs.directus.io\"},{\"type\":\"module\",\"id\":\"settings\",\"enabled\":true,\"locked\":true},{\"id\":\"oo-1jFD1EJZ9duXqziC5F\",\"type\":\"link\",\"enabled\":true,\"url\":\"/users\",\"name\":\"Users\",\"icon\":\"architecture\"}]}','{\"module_bar\":[{\"type\":\"module\",\"id\":\"content\",\"enabled\":true},{\"type\":\"module\",\"id\":\"users\",\"enabled\":true},{\"type\":\"module\",\"id\":\"files\",\"enabled\":true},{\"type\":\"module\",\"id\":\"insights\",\"enabled\":true},{\"type\":\"link\",\"id\":\"docs\",\"enabled\":true,\"name\":\"$t:documentation\",\"icon\":\"help\",\"url\":\"https://docs.directus.io\"},{\"type\":\"module\",\"id\":\"settings\",\"enabled\":true,\"locked\":true},{\"id\":\"oo-1jFD1EJZ9duXqziC5F\",\"type\":\"link\",\"enabled\":true,\"url\":\"/users\",\"name\":\"Users\",\"icon\":\"architecture\"}]}',NULL,NULL);
/*!40000 ALTER TABLE `directus_revisions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_roles`
--

DROP TABLE IF EXISTS `directus_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_roles` (
  `id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `icon` varchar(64) NOT NULL DEFAULT 'supervised_user_circle',
  `description` text DEFAULT NULL,
  `parent` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `directus_roles_parent_foreign` (`parent`),
  CONSTRAINT `directus_roles_parent_foreign` FOREIGN KEY (`parent`) REFERENCES `directus_roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_roles`
--

LOCK TABLES `directus_roles` WRITE;
/*!40000 ALTER TABLE `directus_roles` DISABLE KEYS */;
INSERT INTO `directus_roles` VALUES ('a5c47827-ca45-49e6-8d4f-beb3697b0332','Administrator','verified','$t:admin_description',NULL);
/*!40000 ALTER TABLE `directus_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_sessions`
--

DROP TABLE IF EXISTS `directus_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_sessions` (
  `token` varchar(64) NOT NULL,
  `user` char(36) DEFAULT NULL,
  `expires` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ip` varchar(255) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `share` char(36) DEFAULT NULL,
  `origin` varchar(255) DEFAULT NULL,
  `next_token` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`token`),
  KEY `directus_sessions_user_foreign` (`user`),
  KEY `directus_sessions_share_foreign` (`share`),
  CONSTRAINT `directus_sessions_share_foreign` FOREIGN KEY (`share`) REFERENCES `directus_shares` (`id`) ON DELETE CASCADE,
  CONSTRAINT `directus_sessions_user_foreign` FOREIGN KEY (`user`) REFERENCES `directus_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_sessions`
--

LOCK TABLES `directus_sessions` WRITE;
/*!40000 ALTER TABLE `directus_sessions` DISABLE KEYS */;
INSERT INTO `directus_sessions` VALUES ('BEuy4wHlXE4777odnqJCMMYpjQLM8QyO-C2rRMPBKUPqQVGjVF-QpklgYimfEbHw','a803e90b-a90c-496f-ba49-a17b3c623cc1','2024-09-18 22:27:13','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',NULL,'http://127.0.0.1:4242',NULL),('n0HQfMtKDWDuGC9GDv402rc7MsNkXbNYL05zi7CAlKSQe_URf4anOPE7TvM8RW0V','a803e90b-a90c-496f-ba49-a17b3c623cc1','2024-09-19 09:18:26','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',NULL,'http://127.0.0.1:4242',NULL),('WpGTmG_37yVLn90RIhoIt3NK99rkPm6gIhCOxIVQi9DvjdXqbgqY4Z85-aS0rFX9','a803e90b-a90c-496f-ba49-a17b3c623cc1','2024-09-18 09:18:36','127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',NULL,'http://127.0.0.1:4242','n0HQfMtKDWDuGC9GDv402rc7MsNkXbNYL05zi7CAlKSQe_URf4anOPE7TvM8RW0V');
/*!40000 ALTER TABLE `directus_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_settings`
--

DROP TABLE IF EXISTS `directus_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_settings` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `project_name` varchar(100) NOT NULL DEFAULT 'Directus',
  `project_url` varchar(255) DEFAULT NULL,
  `project_color` varchar(255) NOT NULL DEFAULT '#6644FF',
  `project_logo` char(36) DEFAULT NULL,
  `public_foreground` char(36) DEFAULT NULL,
  `public_background` char(36) DEFAULT NULL,
  `public_note` text DEFAULT NULL,
  `auth_login_attempts` int(10) unsigned DEFAULT 25,
  `auth_password_policy` varchar(100) DEFAULT NULL,
  `storage_asset_transform` varchar(7) DEFAULT 'all',
  `storage_asset_presets` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`storage_asset_presets`)),
  `custom_css` text DEFAULT NULL,
  `storage_default_folder` char(36) DEFAULT NULL,
  `basemaps` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`basemaps`)),
  `mapbox_key` varchar(255) DEFAULT NULL,
  `module_bar` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`module_bar`)),
  `project_descriptor` varchar(100) DEFAULT NULL,
  `default_language` varchar(255) NOT NULL DEFAULT 'en-US',
  `custom_aspect_ratios` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`custom_aspect_ratios`)),
  `public_favicon` char(36) DEFAULT NULL,
  `default_appearance` varchar(255) NOT NULL DEFAULT 'auto',
  `default_theme_light` varchar(255) DEFAULT NULL,
  `theme_light_overrides` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`theme_light_overrides`)),
  `default_theme_dark` varchar(255) DEFAULT NULL,
  `theme_dark_overrides` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`theme_dark_overrides`)),
  `report_error_url` varchar(255) DEFAULT NULL,
  `report_bug_url` varchar(255) DEFAULT NULL,
  `report_feature_url` varchar(255) DEFAULT NULL,
  `public_registration` tinyint(1) NOT NULL DEFAULT 0,
  `public_registration_verify_email` tinyint(1) NOT NULL DEFAULT 1,
  `public_registration_role` char(36) DEFAULT NULL,
  `public_registration_email_filter` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`public_registration_email_filter`)),
  PRIMARY KEY (`id`),
  KEY `directus_settings_project_logo_foreign` (`project_logo`),
  KEY `directus_settings_public_foreground_foreign` (`public_foreground`),
  KEY `directus_settings_public_background_foreign` (`public_background`),
  KEY `directus_settings_storage_default_folder_foreign` (`storage_default_folder`),
  KEY `directus_settings_public_favicon_foreign` (`public_favicon`),
  KEY `directus_settings_public_registration_role_foreign` (`public_registration_role`),
  CONSTRAINT `directus_settings_project_logo_foreign` FOREIGN KEY (`project_logo`) REFERENCES `directus_files` (`id`),
  CONSTRAINT `directus_settings_public_background_foreign` FOREIGN KEY (`public_background`) REFERENCES `directus_files` (`id`),
  CONSTRAINT `directus_settings_public_favicon_foreign` FOREIGN KEY (`public_favicon`) REFERENCES `directus_files` (`id`),
  CONSTRAINT `directus_settings_public_foreground_foreign` FOREIGN KEY (`public_foreground`) REFERENCES `directus_files` (`id`),
  CONSTRAINT `directus_settings_public_registration_role_foreign` FOREIGN KEY (`public_registration_role`) REFERENCES `directus_roles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `directus_settings_storage_default_folder_foreign` FOREIGN KEY (`storage_default_folder`) REFERENCES `directus_folders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_settings`
--

LOCK TABLES `directus_settings` WRITE;
/*!40000 ALTER TABLE `directus_settings` DISABLE KEYS */;
INSERT INTO `directus_settings` VALUES (1,'Directus',NULL,'#6644FF',NULL,NULL,NULL,NULL,25,NULL,'all',NULL,NULL,NULL,NULL,NULL,'[{\"type\":\"module\",\"id\":\"content\",\"enabled\":true},{\"type\":\"module\",\"id\":\"users\",\"enabled\":true},{\"type\":\"module\",\"id\":\"files\",\"enabled\":true},{\"type\":\"module\",\"id\":\"insights\",\"enabled\":true},{\"type\":\"link\",\"id\":\"docs\",\"enabled\":true,\"name\":\"$t:documentation\",\"icon\":\"help\",\"url\":\"https://docs.directus.io\"},{\"type\":\"module\",\"id\":\"settings\",\"enabled\":true,\"locked\":true},{\"id\":\"oo-1jFD1EJZ9duXqziC5F\",\"type\":\"link\",\"enabled\":true,\"url\":\"/users\",\"name\":\"Users\",\"icon\":\"architecture\"}]',NULL,'en-US',NULL,NULL,'auto',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,1,NULL,NULL);
/*!40000 ALTER TABLE `directus_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_shares`
--

DROP TABLE IF EXISTS `directus_shares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_shares` (
  `id` char(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `collection` varchar(64) NOT NULL,
  `item` varchar(255) NOT NULL,
  `role` char(36) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `user_created` char(36) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_start` timestamp NULL DEFAULT NULL,
  `date_end` timestamp NULL DEFAULT NULL,
  `times_used` int(11) DEFAULT 0,
  `max_uses` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `directus_shares_role_foreign` (`role`),
  KEY `directus_shares_user_created_foreign` (`user_created`),
  KEY `directus_shares_collection_foreign` (`collection`),
  CONSTRAINT `directus_shares_collection_foreign` FOREIGN KEY (`collection`) REFERENCES `directus_collections` (`collection`) ON DELETE CASCADE,
  CONSTRAINT `directus_shares_role_foreign` FOREIGN KEY (`role`) REFERENCES `directus_roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `directus_shares_user_created_foreign` FOREIGN KEY (`user_created`) REFERENCES `directus_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_shares`
--

LOCK TABLES `directus_shares` WRITE;
/*!40000 ALTER TABLE `directus_shares` DISABLE KEYS */;
/*!40000 ALTER TABLE `directus_shares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_translations`
--

DROP TABLE IF EXISTS `directus_translations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_translations` (
  `id` char(36) NOT NULL,
  `language` varchar(255) NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_translations`
--

LOCK TABLES `directus_translations` WRITE;
/*!40000 ALTER TABLE `directus_translations` DISABLE KEYS */;
/*!40000 ALTER TABLE `directus_translations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_users`
--

DROP TABLE IF EXISTS `directus_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_users` (
  `id` char(36) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `email` varchar(128) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `title` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `avatar` char(36) DEFAULT NULL,
  `language` varchar(255) DEFAULT NULL,
  `tfa_secret` varchar(255) DEFAULT NULL,
  `status` varchar(16) NOT NULL DEFAULT 'active',
  `role` char(36) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `last_access` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_page` varchar(255) DEFAULT NULL,
  `provider` varchar(128) NOT NULL DEFAULT 'default',
  `external_identifier` varchar(255) DEFAULT NULL,
  `auth_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`auth_data`)),
  `email_notifications` tinyint(1) DEFAULT 1,
  `appearance` varchar(255) DEFAULT NULL,
  `theme_dark` varchar(255) DEFAULT NULL,
  `theme_light` varchar(255) DEFAULT NULL,
  `theme_light_overrides` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`theme_light_overrides`)),
  `theme_dark_overrides` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`theme_dark_overrides`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `directus_users_external_identifier_unique` (`external_identifier`),
  UNIQUE KEY `directus_users_email_unique` (`email`),
  UNIQUE KEY `directus_users_token_unique` (`token`),
  KEY `directus_users_role_foreign` (`role`),
  CONSTRAINT `directus_users_role_foreign` FOREIGN KEY (`role`) REFERENCES `directus_roles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_users`
--

LOCK TABLES `directus_users` WRITE;
/*!40000 ALTER TABLE `directus_users` DISABLE KEYS */;
INSERT INTO `directus_users` VALUES ('a803e90b-a90c-496f-ba49-a17b3c623cc1','Admin','User','leonard.oursel@epitech.eu','$argon2id$v=19$m=65536,t=3,p=4$PRaXQeE7Vm/Ug91mEAAZhg$XO+b2AzHaPIloxBfORU4Q3YguE9N094J7UnVTNbC6u0',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'active','a5c47827-ca45-49e6-8d4f-beb3697b0332',NULL,'2024-09-18 09:18:26','/content/Users','default',NULL,NULL,1,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `directus_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_versions`
--

DROP TABLE IF EXISTS `directus_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_versions` (
  `id` char(36) NOT NULL,
  `key` varchar(64) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `collection` varchar(64) NOT NULL,
  `item` varchar(255) NOT NULL,
  `hash` varchar(255) DEFAULT NULL,
  `date_created` timestamp NOT NULL DEFAULT current_timestamp(),
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_created` char(36) DEFAULT NULL,
  `user_updated` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `directus_versions_collection_foreign` (`collection`),
  KEY `directus_versions_user_created_foreign` (`user_created`),
  KEY `directus_versions_user_updated_foreign` (`user_updated`),
  CONSTRAINT `directus_versions_collection_foreign` FOREIGN KEY (`collection`) REFERENCES `directus_collections` (`collection`) ON DELETE CASCADE,
  CONSTRAINT `directus_versions_user_created_foreign` FOREIGN KEY (`user_created`) REFERENCES `directus_users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `directus_versions_user_updated_foreign` FOREIGN KEY (`user_updated`) REFERENCES `directus_users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_versions`
--

LOCK TABLES `directus_versions` WRITE;
/*!40000 ALTER TABLE `directus_versions` DISABLE KEYS */;
/*!40000 ALTER TABLE `directus_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directus_webhooks`
--

DROP TABLE IF EXISTS `directus_webhooks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `directus_webhooks` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `method` varchar(10) NOT NULL DEFAULT 'POST',
  `url` varchar(255) NOT NULL,
  `status` varchar(10) NOT NULL DEFAULT 'active',
  `data` tinyint(1) NOT NULL DEFAULT 1,
  `actions` varchar(100) NOT NULL,
  `collections` varchar(255) NOT NULL,
  `headers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`headers`)),
  `was_active_before_deprecation` tinyint(1) NOT NULL DEFAULT 0,
  `migrated_flow` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `directus_webhooks_migrated_flow_foreign` (`migrated_flow`),
  CONSTRAINT `directus_webhooks_migrated_flow_foreign` FOREIGN KEY (`migrated_flow`) REFERENCES `directus_flows` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directus_webhooks`
--

LOCK TABLES `directus_webhooks` WRITE;
/*!40000 ALTER TABLE `directus_webhooks` DISABLE KEYS */;
/*!40000 ALTER TABLE `directus_webhooks` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-09-23 11:48:45
