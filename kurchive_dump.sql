-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: kurchive
-- ------------------------------------------------------
-- Server version	8.0.44

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
-- Current Database: `kurchive`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `kurchive` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `kurchive`;

--
-- Table structure for table `admin_config`
--

DROP TABLE IF EXISTS `admin_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `auth_code` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_config`
--

LOCK TABLES `admin_config` WRITE;
/*!40000 ALTER TABLE `admin_config` DISABLE KEYS */;
INSERT INTO `admin_config` VALUES (1,'kurry');
/*!40000 ALTER TABLE `admin_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_logs`
--

DROP TABLE IF EXISTS `admin_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int DEFAULT NULL,
  `action_type` varchar(50) DEFAULT NULL,
  `target_user` int DEFAULT NULL,
  `detail` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  KEY `target_user` (`target_user`),
  CONSTRAINT `admin_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`),
  CONSTRAINT `admin_logs_ibfk_2` FOREIGN KEY (`target_user`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_logs`
--

LOCK TABLES `admin_logs` WRITE;
/*!40000 ALTER TABLE `admin_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alembic_version`
--

DROP TABLE IF EXISTS `alembic_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alembic_version` (
  `version_num` varchar(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alembic_version`
--

LOCK TABLES `alembic_version` WRITE;
/*!40000 ALTER TABLE `alembic_version` DISABLE KEYS */;
INSERT INTO `alembic_version` VALUES ('934244468a08');
/*!40000 ALTER TABLE `alembic_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_code_change_requests`
--

DROP TABLE IF EXISTS `auth_code_change_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_code_change_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `new_auth_code` varchar(500) NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL,
  `requester_id` int NOT NULL,
  `approver_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT (now()),
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `requester_id` (`requester_id`),
  KEY `approver_id` (`approver_id`),
  CONSTRAINT `auth_code_change_requests_ibfk_1` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`),
  CONSTRAINT `auth_code_change_requests_ibfk_2` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_code_change_requests`
--

LOCK TABLES `auth_code_change_requests` WRITE;
/*!40000 ALTER TABLE `auth_code_change_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_code_change_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `content` text NOT NULL,
  `created_at` datetime DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `restaurant_id` (`restaurant_id`),
  KEY `ix_comments_id` (`id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `restaurant_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `restaurant_id` (`restaurant_id`),
  KEY `ix_favorites_id` (`id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingredient_categories`
--

DROP TABLE IF EXISTS `ingredient_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredient_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredient_categories`
--

LOCK TABLES `ingredient_categories` WRITE;
/*!40000 ALTER TABLE `ingredient_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `ingredient_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingredient_units`
--

DROP TABLE IF EXISTS `ingredient_units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredient_units` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ingredient_id` int NOT NULL,
  `unit_name` varchar(500) NOT NULL,
  `is_default` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ingredient_unit` (`ingredient_id`,`unit_name`),
  CONSTRAINT `ingredient_units_ibfk_1` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1847 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredient_units`
--

LOCK TABLES `ingredient_units` WRITE;
/*!40000 ALTER TABLE `ingredient_units` DISABLE KEYS */;
INSERT INTO `ingredient_units` VALUES (15,1,'g',0),(16,2,'g',0),(17,3,'g',0),(18,4,'g',0),(19,7,'g',0),(20,8,'g',0),(21,9,'g',0),(22,10,'g',0),(23,11,'g',0),(24,12,'g',0),(25,13,'g',0),(26,14,'g',0),(27,15,'g',0),(28,16,'g',0),(29,17,'g',0),(30,18,'g',0),(31,19,'g',0),(32,20,'g',0),(33,21,'g',0),(34,22,'g',0),(35,23,'g',0),(36,24,'g',0),(37,25,'g',0),(38,26,'g',0),(39,27,'g',0),(40,28,'g',0),(41,29,'g',0),(42,30,'g',0),(43,31,'g',0),(44,32,'g',0),(45,33,'g',0),(46,34,'g',0),(47,35,'g',0),(48,36,'g',0),(49,37,'g',0),(50,38,'g',0),(51,39,'g',0),(52,40,'g',0),(53,41,'g',0),(54,42,'g',0),(55,43,'g',0),(56,44,'g',0),(57,45,'g',0),(58,46,'g',0),(59,47,'g',0),(60,48,'g',0),(61,49,'g',0),(62,50,'g',0),(63,51,'g',0),(64,52,'g',0),(65,53,'g',0),(66,54,'g',0),(67,55,'g',0),(68,56,'g',0),(69,57,'g',0),(70,58,'g',0),(71,59,'g',0),(72,60,'g',0),(73,61,'g',0),(74,62,'g',0),(75,63,'g',0),(76,64,'g',0),(77,65,'g',0),(78,66,'g',0),(79,67,'g',0),(80,68,'g',0),(81,69,'g',0),(82,70,'g',0),(83,71,'g',0),(84,72,'g',0),(85,73,'g',0),(86,74,'g',0),(87,75,'g',0),(88,76,'g',0),(89,77,'g',0),(90,78,'g',0),(91,79,'g',0),(92,80,'g',0),(93,81,'g',0),(94,82,'g',0),(95,83,'g',0),(96,84,'g',0),(97,85,'g',0),(98,86,'g',0),(99,87,'g',0),(100,88,'g',0),(101,89,'g',0),(102,90,'g',0),(103,91,'g',0),(104,92,'g',0),(105,93,'g',0),(106,94,'g',0),(107,95,'g',0),(108,96,'g',0),(109,97,'g',0),(110,98,'g',0),(111,1,'ml',0),(112,2,'ml',0),(113,3,'ml',0),(114,4,'ml',0),(115,7,'ml',0),(116,8,'ml',0),(117,9,'ml',0),(118,10,'ml',0),(119,11,'ml',0),(120,12,'ml',0),(121,13,'ml',0),(122,14,'ml',0),(123,15,'ml',0),(124,16,'ml',0),(125,17,'ml',0),(126,18,'ml',0),(127,19,'ml',0),(128,20,'ml',0),(129,21,'ml',0),(130,22,'ml',0),(131,23,'ml',0),(132,24,'ml',0),(133,25,'ml',0),(134,26,'ml',0),(135,27,'ml',0),(136,28,'ml',0),(137,29,'ml',0),(138,30,'ml',0),(139,31,'ml',0),(140,32,'ml',0),(141,33,'ml',0),(142,34,'ml',0),(143,35,'ml',0),(144,36,'ml',0),(145,37,'ml',0),(146,38,'ml',0),(147,39,'ml',0),(148,40,'ml',0),(149,41,'ml',0),(150,42,'ml',0),(151,43,'ml',0),(152,44,'ml',0),(153,45,'ml',0),(154,46,'ml',0),(155,47,'ml',0),(156,48,'ml',0),(157,49,'ml',0),(158,50,'ml',0),(159,51,'ml',0),(160,52,'ml',0),(161,53,'ml',0),(162,54,'ml',0),(163,55,'ml',0),(164,56,'ml',0),(165,57,'ml',0),(166,58,'ml',0),(167,59,'ml',0),(168,60,'ml',0),(169,61,'ml',0),(170,62,'ml',0),(171,63,'ml',0),(172,64,'ml',0),(173,65,'ml',0),(174,66,'ml',0),(175,67,'ml',0),(176,68,'ml',0),(177,69,'ml',0),(178,70,'ml',0),(179,71,'ml',0),(180,72,'ml',0),(181,73,'ml',0),(182,74,'ml',0),(183,75,'ml',0),(184,76,'ml',0),(185,77,'ml',0),(186,78,'ml',0),(187,79,'ml',0),(188,80,'ml',0),(189,81,'ml',0),(190,82,'ml',0),(191,83,'ml',0),(192,84,'ml',0),(193,85,'ml',0),(194,86,'ml',0),(195,87,'ml',0),(196,88,'ml',0),(197,89,'ml',0),(198,90,'ml',0),(199,91,'ml',0),(200,92,'ml',0),(201,93,'ml',0),(202,94,'ml',0),(203,95,'ml',0),(204,96,'ml',0),(205,97,'ml',0),(206,98,'ml',0),(207,1,'tbsp',0),(208,2,'tbsp',0),(209,3,'tbsp',0),(210,4,'tbsp',0),(211,7,'tbsp',0),(212,8,'tbsp',0),(213,9,'tbsp',0),(214,10,'tbsp',0),(215,11,'tbsp',0),(216,12,'tbsp',0),(217,13,'tbsp',0),(218,14,'tbsp',0),(219,15,'tbsp',0),(220,16,'tbsp',0),(221,17,'tbsp',0),(222,18,'tbsp',0),(223,19,'tbsp',0),(224,20,'tbsp',0),(225,21,'tbsp',0),(226,22,'tbsp',0),(227,23,'tbsp',0),(228,24,'tbsp',0),(229,25,'tbsp',0),(230,26,'tbsp',0),(231,27,'tbsp',0),(232,28,'tbsp',0),(233,29,'tbsp',0),(234,30,'tbsp',0),(235,31,'tbsp',0),(236,32,'tbsp',0),(237,33,'tbsp',0),(238,34,'tbsp',0),(239,35,'tbsp',0),(240,36,'tbsp',0),(241,37,'tbsp',0),(242,38,'tbsp',0),(243,39,'tbsp',0),(244,40,'tbsp',0),(245,41,'tbsp',0),(246,42,'tbsp',0),(247,43,'tbsp',0),(248,44,'tbsp',0),(249,45,'tbsp',0),(250,46,'tbsp',0),(251,47,'tbsp',0),(252,48,'tbsp',0),(253,49,'tbsp',0),(254,50,'tbsp',0),(255,51,'tbsp',0),(256,52,'tbsp',0),(257,53,'tbsp',0),(258,54,'tbsp',0),(259,55,'tbsp',0),(260,56,'tbsp',0),(261,57,'tbsp',0),(262,58,'tbsp',0),(263,59,'tbsp',0),(264,60,'tbsp',0),(265,61,'tbsp',0),(266,62,'tbsp',0),(267,63,'tbsp',0),(268,64,'tbsp',0),(269,65,'tbsp',0),(270,66,'tbsp',0),(271,67,'tbsp',0),(272,68,'tbsp',0),(273,69,'tbsp',0),(274,70,'tbsp',0),(275,71,'tbsp',0),(276,72,'tbsp',0),(277,73,'tbsp',0),(278,74,'tbsp',0),(279,75,'tbsp',0),(280,76,'tbsp',0),(281,77,'tbsp',0),(282,78,'tbsp',0),(283,79,'tbsp',0),(284,80,'tbsp',0),(285,81,'tbsp',0),(286,82,'tbsp',0),(287,83,'tbsp',0),(288,84,'tbsp',0),(289,85,'tbsp',0),(290,86,'tbsp',0),(291,87,'tbsp',0),(292,88,'tbsp',0),(293,89,'tbsp',0),(294,90,'tbsp',0),(295,91,'tbsp',0),(296,92,'tbsp',0),(297,93,'tbsp',0),(298,94,'tbsp',0),(299,95,'tbsp',0),(300,96,'tbsp',0),(301,97,'tbsp',0),(302,98,'tbsp',0),(303,1,'tsp',0),(304,2,'tsp',0),(305,3,'tsp',0),(306,4,'tsp',0),(307,7,'tsp',0),(308,8,'tsp',0),(309,9,'tsp',0),(310,10,'tsp',0),(311,11,'tsp',0),(312,12,'tsp',0),(313,13,'tsp',0),(314,14,'tsp',0),(315,15,'tsp',0),(316,16,'tsp',0),(317,17,'tsp',0),(318,18,'tsp',0),(319,19,'tsp',0),(320,20,'tsp',0),(321,21,'tsp',0),(322,22,'tsp',0),(323,23,'tsp',0),(324,24,'tsp',0),(325,25,'tsp',0),(326,26,'tsp',0),(327,27,'tsp',0),(328,28,'tsp',0),(329,29,'tsp',0),(330,30,'tsp',0),(331,31,'tsp',0),(332,32,'tsp',0),(333,33,'tsp',0),(334,34,'tsp',0),(335,35,'tsp',0),(336,36,'tsp',0),(337,37,'tsp',0),(338,38,'tsp',0),(339,39,'tsp',0),(340,40,'tsp',0),(341,41,'tsp',0),(342,42,'tsp',0),(343,43,'tsp',0),(344,44,'tsp',0),(345,45,'tsp',0),(346,46,'tsp',0),(347,47,'tsp',0),(348,48,'tsp',0),(349,49,'tsp',0),(350,50,'tsp',0),(351,51,'tsp',0),(352,52,'tsp',0),(353,53,'tsp',0),(354,54,'tsp',0),(355,55,'tsp',0),(356,56,'tsp',0),(357,57,'tsp',0),(358,58,'tsp',0),(359,59,'tsp',0),(360,60,'tsp',0),(361,61,'tsp',0),(362,62,'tsp',0),(363,63,'tsp',0),(364,64,'tsp',0),(365,65,'tsp',0),(366,66,'tsp',0),(367,67,'tsp',0),(368,68,'tsp',0),(369,69,'tsp',0),(370,70,'tsp',0),(371,71,'tsp',0),(372,72,'tsp',0),(373,73,'tsp',0),(374,74,'tsp',0),(375,75,'tsp',0),(376,76,'tsp',0),(377,77,'tsp',0),(378,78,'tsp',0),(379,79,'tsp',0),(380,80,'tsp',0),(381,81,'tsp',0),(382,82,'tsp',0),(383,83,'tsp',0),(384,84,'tsp',0),(385,85,'tsp',0),(386,86,'tsp',0),(387,87,'tsp',0),(388,88,'tsp',0),(389,89,'tsp',0),(390,90,'tsp',0),(391,91,'tsp',0),(392,92,'tsp',0),(393,93,'tsp',0),(394,94,'tsp',0),(395,95,'tsp',0),(396,96,'tsp',0),(397,97,'tsp',0),(398,98,'tsp',0),(399,1,'cup',0),(400,2,'cup',0),(401,3,'cup',0),(402,4,'cup',0),(403,7,'cup',0),(404,8,'cup',0),(405,9,'cup',0),(406,10,'cup',0),(407,11,'cup',0),(408,12,'cup',0),(409,13,'cup',0),(410,14,'cup',0),(411,15,'cup',0),(412,16,'cup',0),(413,17,'cup',0),(414,18,'cup',0),(415,19,'cup',0),(416,20,'cup',0),(417,21,'cup',0),(418,22,'cup',0),(419,23,'cup',0),(420,24,'cup',0),(421,25,'cup',0),(422,26,'cup',0),(423,27,'cup',0),(424,28,'cup',0),(425,29,'cup',0),(426,30,'cup',0),(427,31,'cup',0),(428,32,'cup',0),(429,33,'cup',0),(430,34,'cup',0),(431,35,'cup',0),(432,36,'cup',0),(433,37,'cup',0),(434,38,'cup',0),(435,39,'cup',0),(436,40,'cup',0),(437,41,'cup',0),(438,42,'cup',0),(439,43,'cup',0),(440,44,'cup',0),(441,45,'cup',0),(442,46,'cup',0),(443,47,'cup',0),(444,48,'cup',0),(445,49,'cup',0),(446,50,'cup',0),(447,51,'cup',0),(448,52,'cup',0),(449,53,'cup',0),(450,54,'cup',0),(451,55,'cup',0),(452,56,'cup',0),(453,57,'cup',0),(454,58,'cup',0),(455,59,'cup',0),(456,60,'cup',0),(457,61,'cup',0),(458,62,'cup',0),(459,63,'cup',0),(460,64,'cup',0),(461,65,'cup',0),(462,66,'cup',0),(463,67,'cup',0),(464,68,'cup',0),(465,69,'cup',0),(466,70,'cup',0),(467,71,'cup',0),(468,72,'cup',0),(469,73,'cup',0),(470,74,'cup',0),(471,75,'cup',0),(472,76,'cup',0),(473,77,'cup',0),(474,78,'cup',0),(475,79,'cup',0),(476,80,'cup',0),(477,81,'cup',0),(478,82,'cup',0),(479,83,'cup',0),(480,84,'cup',0),(481,85,'cup',0),(482,86,'cup',0),(483,87,'cup',0),(484,88,'cup',0),(485,89,'cup',0),(486,90,'cup',0),(487,91,'cup',0),(488,92,'cup',0),(489,93,'cup',0),(490,94,'cup',0),(491,95,'cup',0),(492,96,'cup',0),(493,97,'cup',0),(494,98,'cup',0),(495,131,'g',0),(496,131,'ml',0),(497,131,'tbsp',0),(498,131,'tsp',0),(499,131,'cup',0),(500,132,'g',0),(501,132,'ml',0),(502,132,'tbsp',0),(503,132,'tsp',0),(504,132,'cup',0),(505,133,'g',0),(506,133,'ml',0),(507,133,'tbsp',0),(508,133,'tsp',0),(509,133,'cup',0),(510,134,'g',0),(511,134,'ml',0),(512,134,'tbsp',0),(513,134,'tsp',0),(514,134,'cup',0),(515,137,'g',0),(516,137,'ml',0),(517,137,'tbsp',0),(518,137,'tsp',0),(519,137,'cup',0),(520,138,'g',0),(521,138,'ml',0),(522,138,'tbsp',0),(523,138,'tsp',0),(524,138,'cup',0),(525,139,'g',0),(526,139,'ml',0),(527,139,'tbsp',0),(528,139,'tsp',0),(529,139,'cup',0),(530,140,'g',0),(531,140,'ml',0),(532,140,'tbsp',0),(533,140,'tsp',0),(534,140,'cup',0),(535,141,'g',0),(536,141,'ml',0),(537,141,'tbsp',0),(538,141,'tsp',0),(539,141,'cup',0),(540,142,'g',0),(541,142,'ml',0),(542,142,'tbsp',0),(543,142,'tsp',0),(544,142,'cup',0),(545,143,'g',0),(546,143,'ml',0),(547,143,'tbsp',0),(548,143,'tsp',0),(549,143,'cup',0),(550,144,'g',0),(551,144,'ml',0),(552,144,'tbsp',0),(553,144,'tsp',0),(554,144,'cup',0),(555,145,'g',0),(556,145,'ml',0),(557,145,'tbsp',0),(558,145,'tsp',0),(559,145,'cup',0),(560,146,'g',0),(561,146,'ml',0),(562,146,'tbsp',0),(563,146,'tsp',0),(564,146,'cup',0),(565,147,'g',0),(566,147,'ml',0),(567,147,'tbsp',0),(568,147,'tsp',0),(569,147,'cup',0),(570,148,'g',0),(571,148,'ml',0),(572,148,'tbsp',0),(573,148,'tsp',0),(574,148,'cup',0),(575,149,'g',0),(576,149,'ml',0),(577,149,'tbsp',0),(578,149,'tsp',0),(579,149,'cup',0),(580,150,'g',0),(581,150,'ml',0),(582,150,'tbsp',0),(583,150,'tsp',0),(584,150,'cup',0),(585,151,'g',0),(586,151,'ml',0),(587,151,'tbsp',0),(588,151,'tsp',0),(589,151,'cup',0),(590,152,'g',0),(591,152,'ml',0),(592,152,'tbsp',0),(593,152,'tsp',0),(594,152,'cup',0),(595,153,'g',0),(596,153,'ml',0),(597,153,'tbsp',0),(598,153,'tsp',0),(599,153,'cup',0),(600,154,'g',0),(601,154,'ml',0),(602,154,'tbsp',0),(603,154,'tsp',0),(604,154,'cup',0),(605,155,'g',0),(606,155,'ml',0),(607,155,'tbsp',0),(608,155,'tsp',0),(609,155,'cup',0),(610,156,'g',0),(611,156,'ml',0),(612,156,'tbsp',0),(613,156,'tsp',0),(614,156,'cup',0),(615,157,'g',0),(616,157,'ml',0),(617,157,'tbsp',0),(618,157,'tsp',0),(619,157,'cup',0),(620,158,'g',0),(621,158,'ml',0),(622,158,'tbsp',0),(623,158,'tsp',0),(624,158,'cup',0),(625,159,'g',0),(626,159,'ml',0),(627,159,'tbsp',0),(628,159,'tsp',0),(629,159,'cup',0),(630,160,'g',0),(631,160,'ml',0),(632,160,'tbsp',0),(633,160,'tsp',0),(634,160,'cup',0),(635,161,'g',0),(636,161,'ml',0),(637,161,'tbsp',0),(638,161,'tsp',0),(639,161,'cup',0),(640,162,'g',0),(641,162,'ml',0),(642,162,'tbsp',0),(643,162,'tsp',0),(644,162,'cup',0),(645,163,'g',0),(646,163,'ml',0),(647,163,'tbsp',0),(648,163,'tsp',0),(649,163,'cup',0),(650,164,'g',0),(651,164,'ml',0),(652,164,'tbsp',0),(653,164,'tsp',0),(654,164,'cup',0),(655,165,'g',0),(656,165,'ml',0),(657,165,'tbsp',0),(658,165,'tsp',0),(659,165,'cup',0),(660,166,'g',0),(661,166,'ml',0),(662,166,'tbsp',0),(663,166,'tsp',0),(664,166,'cup',0),(665,167,'g',0),(666,167,'ml',0),(667,167,'tbsp',0),(668,167,'tsp',0),(669,167,'cup',0),(670,168,'g',0),(671,168,'ml',0),(672,168,'tbsp',0),(673,168,'tsp',0),(674,168,'cup',0),(675,169,'g',0),(676,169,'ml',0),(677,169,'tbsp',0),(678,169,'tsp',0),(679,169,'cup',0),(680,170,'g',0),(681,170,'ml',0),(682,170,'tbsp',0),(683,170,'tsp',0),(684,170,'cup',0),(685,171,'g',0),(686,171,'ml',0),(687,171,'tbsp',0),(688,171,'tsp',0),(689,171,'cup',0),(690,172,'g',0),(691,172,'ml',0),(692,172,'tbsp',0),(693,172,'tsp',0),(694,172,'cup',0),(695,173,'g',0),(696,173,'ml',0),(697,173,'tbsp',0),(698,173,'tsp',0),(699,173,'cup',0),(700,174,'g',0),(701,174,'ml',0),(702,174,'tbsp',0),(703,174,'tsp',0),(704,174,'cup',0),(705,175,'g',0),(706,175,'ml',0),(707,175,'tbsp',0),(708,175,'tsp',0),(709,175,'cup',0),(710,176,'g',0),(711,176,'ml',0),(712,176,'tbsp',0),(713,176,'tsp',0),(714,176,'cup',0),(715,177,'g',0),(716,177,'ml',0),(717,177,'tbsp',0),(718,177,'tsp',0),(719,177,'cup',0),(720,178,'g',0),(721,178,'ml',0),(722,178,'tbsp',0),(723,178,'tsp',0),(724,178,'cup',0),(725,179,'g',0),(726,179,'ml',0),(727,179,'tbsp',0),(728,179,'tsp',0),(729,179,'cup',0),(730,180,'g',0),(731,180,'ml',0),(732,180,'tbsp',0),(733,180,'tsp',0),(734,180,'cup',0),(735,181,'g',0),(736,181,'ml',0),(737,181,'tbsp',0),(738,181,'tsp',0),(739,181,'cup',0),(740,182,'g',0),(741,182,'ml',0),(742,182,'tbsp',0),(743,182,'tsp',0),(744,182,'cup',0),(745,183,'g',0),(746,183,'ml',0),(747,183,'tbsp',0),(748,183,'tsp',0),(749,183,'cup',0),(750,184,'g',0),(751,184,'ml',0),(752,184,'tbsp',0),(753,184,'tsp',0),(754,184,'cup',0),(755,185,'g',0),(756,185,'ml',0),(757,185,'tbsp',0),(758,185,'tsp',0),(759,185,'cup',0),(760,186,'g',0),(761,186,'ml',0),(762,186,'tbsp',0),(763,186,'tsp',0),(764,186,'cup',0),(765,187,'g',0),(766,187,'ml',0),(767,187,'tbsp',0),(768,187,'tsp',0),(769,187,'cup',0),(770,188,'g',0),(771,188,'ml',0),(772,188,'tbsp',0),(773,188,'tsp',0),(774,188,'cup',0),(775,189,'g',0),(776,189,'ml',0),(777,189,'tbsp',0),(778,189,'tsp',0),(779,189,'cup',0),(780,190,'g',0),(781,190,'ml',0),(782,190,'tbsp',0),(783,190,'tsp',0),(784,190,'cup',0),(785,191,'g',0),(786,191,'ml',0),(787,191,'tbsp',0),(788,191,'tsp',0),(789,191,'cup',0),(790,192,'g',0),(791,192,'ml',0),(792,192,'tbsp',0),(793,192,'tsp',0),(794,192,'cup',0),(795,193,'g',0),(796,193,'ml',0),(797,193,'tbsp',0),(798,193,'tsp',0),(799,193,'cup',0),(800,194,'g',0),(801,194,'ml',0),(802,194,'tbsp',0),(803,194,'tsp',0),(804,194,'cup',0),(805,195,'g',0),(806,195,'ml',0),(807,195,'tbsp',0),(808,195,'tsp',0),(809,195,'cup',0),(810,196,'g',0),(811,196,'ml',0),(812,196,'tbsp',0),(813,196,'tsp',0),(814,196,'cup',0),(815,197,'g',0),(816,197,'ml',0),(817,197,'tbsp',0),(818,197,'tsp',0),(819,197,'cup',0),(820,198,'g',0),(821,198,'ml',0),(822,198,'tbsp',0),(823,198,'tsp',0),(824,198,'cup',0),(825,199,'g',0),(826,199,'ml',0),(827,199,'tbsp',0),(828,199,'tsp',0),(829,199,'cup',0),(830,200,'g',0),(831,200,'ml',0),(832,200,'tbsp',0),(833,200,'tsp',0),(834,200,'cup',0),(835,201,'g',0),(836,201,'ml',0),(837,201,'tbsp',0),(838,201,'tsp',0),(839,201,'cup',0),(840,202,'g',0),(841,202,'ml',0),(842,202,'tbsp',0),(843,202,'tsp',0),(844,202,'cup',0),(845,203,'g',0),(846,203,'ml',0),(847,203,'tbsp',0),(848,203,'tsp',0),(849,203,'cup',0),(850,204,'g',0),(851,204,'ml',0),(852,204,'tbsp',0),(853,204,'tsp',0),(854,204,'cup',0),(855,205,'g',0),(856,205,'ml',0),(857,205,'tbsp',0),(858,205,'tsp',0),(859,205,'cup',0),(860,206,'g',0),(861,206,'ml',0),(862,206,'tbsp',0),(863,206,'tsp',0),(864,206,'cup',0),(865,207,'g',0),(866,207,'ml',0),(867,207,'tbsp',0),(868,207,'tsp',0),(869,207,'cup',0),(870,208,'g',0),(871,208,'ml',0),(872,208,'tbsp',0),(873,208,'tsp',0),(874,208,'cup',0),(875,209,'g',0),(876,209,'ml',0),(877,209,'tbsp',0),(878,209,'tsp',0),(879,209,'cup',0),(880,210,'g',0),(881,210,'ml',0),(882,210,'tbsp',0),(883,210,'tsp',0),(884,210,'cup',0),(885,211,'g',0),(886,211,'ml',0),(887,211,'tbsp',0),(888,211,'tsp',0),(889,211,'cup',0),(890,212,'g',0),(891,212,'ml',0),(892,212,'tbsp',0),(893,212,'tsp',0),(894,212,'cup',0),(895,213,'g',0),(896,213,'ml',0),(897,213,'tbsp',0),(898,213,'tsp',0),(899,213,'cup',0),(900,214,'g',0),(901,214,'ml',0),(902,214,'tbsp',0),(903,214,'tsp',0),(904,214,'cup',0),(905,215,'g',0),(906,215,'ml',0),(907,215,'tbsp',0),(908,215,'tsp',0),(909,215,'cup',0),(910,216,'g',0),(911,216,'ml',0),(912,216,'tbsp',0),(913,216,'tsp',0),(914,216,'cup',0),(915,217,'g',0),(916,217,'ml',0),(917,217,'tbsp',0),(918,217,'tsp',0),(919,217,'cup',0),(920,218,'g',0),(921,218,'ml',0),(922,218,'tbsp',0),(923,218,'tsp',0),(924,218,'cup',0),(925,219,'g',0),(926,219,'ml',0),(927,219,'tbsp',0),(928,219,'tsp',0),(929,219,'cup',0),(930,220,'g',0),(931,220,'ml',0),(932,220,'tbsp',0),(933,220,'tsp',0),(934,220,'cup',0),(935,221,'g',0),(936,221,'ml',0),(937,221,'tbsp',0),(938,221,'tsp',0),(939,221,'cup',0),(940,222,'g',0),(941,222,'ml',0),(942,222,'tbsp',0),(943,222,'tsp',0),(944,222,'cup',0),(945,223,'g',0),(946,223,'ml',0),(947,223,'tbsp',0),(948,223,'tsp',0),(949,223,'cup',0),(950,224,'g',0),(951,224,'ml',0),(952,224,'tbsp',0),(953,224,'tsp',0),(954,224,'cup',0),(955,225,'g',0),(956,225,'ml',0),(957,225,'tbsp',0),(958,225,'tsp',0),(959,225,'cup',0),(960,226,'g',0),(961,226,'ml',0),(962,226,'tbsp',0),(963,226,'tsp',0),(964,226,'cup',0),(965,227,'g',0),(966,227,'ml',0),(967,227,'tbsp',0),(968,227,'tsp',0),(969,227,'cup',0),(970,228,'g',0),(971,228,'ml',0),(972,228,'tbsp',0),(973,228,'tsp',0),(974,228,'cup',0),(975,5,'g',0),(976,5,'kg',0),(977,6,'g',0),(978,6,'kg',0),(979,135,'g',0),(980,135,'kg',0),(981,136,'g',0),(982,136,'kg',0),(983,229,'g',0),(984,229,'kg',0),(985,230,'g',0),(986,230,'kg',0),(987,231,'g',0),(988,231,'kg',0),(989,232,'g',0),(990,232,'kg',0),(991,233,'g',0),(992,233,'kg',0),(993,234,'g',0),(994,234,'kg',0),(995,235,'g',0),(996,235,'kg',0),(997,236,'g',0),(998,236,'kg',0),(999,237,'g',0),(1000,237,'kg',0),(1001,238,'g',0),(1002,238,'kg',0),(1003,239,'g',0),(1004,239,'kg',0),(1005,240,'g',0),(1006,240,'kg',0),(1007,241,'g',0),(1008,241,'kg',0),(1009,242,'g',0),(1010,242,'kg',0),(1011,243,'g',0),(1012,243,'kg',0),(1013,244,'g',0),(1014,244,'kg',0),(1015,245,'g',0),(1016,245,'kg',0),(1017,246,'g',0),(1018,246,'kg',0),(1019,247,'g',0),(1020,247,'kg',0),(1021,248,'g',0),(1022,248,'kg',0),(1023,249,'g',0),(1024,249,'kg',0),(1025,250,'g',0),(1026,250,'kg',0),(1027,251,'g',0),(1028,251,'kg',0),(1029,252,'g',0),(1030,252,'kg',0),(1031,253,'g',0),(1032,253,'kg',0),(1033,254,'g',0),(1034,254,'kg',0),(1035,255,'g',0),(1036,255,'kg',0),(1037,256,'g',0),(1038,256,'kg',0),(1039,257,'g',0),(1040,257,'kg',0),(1041,258,'g',0),(1042,258,'kg',0),(1295,1,'L',0),(1296,2,'L',0),(1297,3,'L',0),(1298,4,'L',0),(1299,7,'L',0),(1300,8,'L',0),(1301,9,'L',0),(1302,10,'L',0),(1303,11,'L',0),(1304,12,'L',0),(1305,13,'L',0),(1306,14,'L',0),(1307,15,'L',0),(1308,16,'L',0),(1309,17,'L',0),(1310,18,'L',0),(1311,19,'L',0),(1312,20,'L',0),(1313,21,'L',0),(1314,22,'L',0),(1315,23,'L',0),(1316,24,'L',0),(1317,25,'L',0),(1318,26,'L',0),(1319,27,'L',0),(1320,28,'L',0),(1321,29,'L',0),(1322,30,'L',0),(1323,31,'L',0),(1324,32,'L',0),(1325,33,'L',0),(1326,34,'L',0),(1327,35,'L',0),(1328,36,'L',0),(1329,37,'L',0),(1330,38,'L',0),(1331,39,'L',0),(1332,40,'L',0),(1333,41,'L',0),(1334,42,'L',0),(1335,43,'L',0),(1336,44,'L',0),(1337,45,'L',0),(1338,46,'L',0),(1339,47,'L',0),(1340,48,'L',0),(1341,49,'L',0),(1342,50,'L',0),(1343,51,'L',0),(1344,52,'L',0),(1345,53,'L',0),(1346,54,'L',0),(1347,55,'L',0),(1348,56,'L',0),(1349,57,'L',0),(1350,58,'L',0),(1351,59,'L',0),(1352,60,'L',0),(1353,61,'L',0),(1354,62,'L',0),(1355,63,'L',0),(1356,64,'L',0),(1357,65,'L',0),(1358,66,'L',0),(1359,67,'L',0),(1360,68,'L',0),(1361,69,'L',0),(1362,70,'L',0),(1363,71,'L',0),(1364,72,'L',0),(1365,73,'L',0),(1366,74,'L',0),(1367,75,'L',0),(1368,76,'L',0),(1369,77,'L',0),(1370,78,'L',0),(1371,79,'L',0),(1372,80,'L',0),(1373,81,'L',0),(1374,82,'L',0),(1375,83,'L',0),(1376,84,'L',0),(1377,85,'L',0),(1378,86,'L',0),(1379,87,'L',0),(1380,88,'L',0),(1381,89,'L',0),(1382,90,'L',0),(1383,91,'L',0),(1384,92,'L',0),(1385,93,'L',0),(1386,94,'L',0),(1387,95,'L',0),(1388,96,'L',0),(1389,97,'L',0),(1390,98,'L',0),(1391,131,'L',0),(1392,132,'L',0),(1393,133,'L',0),(1394,134,'L',0),(1395,137,'L',0),(1396,138,'L',0),(1397,139,'L',0),(1398,140,'L',0),(1399,141,'L',0),(1400,142,'L',0),(1401,143,'L',0),(1402,144,'L',0),(1403,145,'L',0),(1404,146,'L',0),(1405,147,'L',0),(1406,148,'L',0),(1407,149,'L',0),(1408,150,'L',0),(1409,151,'L',0),(1410,152,'L',0),(1411,153,'L',0),(1412,154,'L',0),(1413,155,'L',0),(1414,156,'L',0),(1415,157,'L',0),(1416,158,'L',0),(1417,159,'L',0),(1418,160,'L',0),(1419,161,'L',0),(1420,162,'L',0),(1421,163,'L',0),(1422,164,'L',0),(1423,165,'L',0),(1424,166,'L',0),(1425,167,'L',0),(1426,168,'L',0),(1427,169,'L',0),(1428,170,'L',0),(1429,171,'L',0),(1430,172,'L',0),(1431,173,'L',0),(1432,174,'L',0),(1433,175,'L',0),(1434,176,'L',0),(1435,177,'L',0),(1436,178,'L',0),(1437,179,'L',0),(1438,180,'L',0),(1439,181,'L',0),(1440,182,'L',0),(1441,183,'L',0),(1442,184,'L',0),(1443,185,'L',0),(1444,186,'L',0),(1445,187,'L',0),(1446,188,'L',0),(1447,189,'L',0),(1448,190,'L',0),(1449,191,'L',0),(1450,192,'L',0),(1451,193,'L',0),(1452,194,'L',0),(1453,195,'L',0),(1454,196,'L',0),(1455,197,'L',0),(1456,198,'L',0),(1457,199,'L',0),(1458,200,'L',0),(1459,201,'L',0),(1460,202,'L',0),(1461,203,'L',0),(1462,204,'L',0),(1463,205,'L',0),(1464,206,'L',0),(1465,207,'L',0),(1466,208,'L',0),(1467,209,'L',0),(1468,210,'L',0),(1469,211,'L',0),(1470,212,'L',0),(1471,213,'L',0),(1472,214,'L',0),(1473,215,'L',0),(1474,216,'L',0),(1475,217,'L',0),(1476,218,'L',0),(1477,219,'L',0),(1478,220,'L',0),(1479,221,'L',0),(1480,222,'L',0),(1481,223,'L',0),(1482,224,'L',0),(1483,225,'L',0),(1484,226,'L',0),(1485,227,'L',0),(1486,228,'L',0),(1655,1,'kg',0),(1656,2,'kg',0),(1657,3,'kg',0),(1658,4,'kg',0),(1659,7,'kg',0),(1660,8,'kg',0),(1661,9,'kg',0),(1662,10,'kg',0),(1663,11,'kg',0),(1664,12,'kg',0),(1665,13,'kg',0),(1666,14,'kg',0),(1667,15,'kg',0),(1668,16,'kg',0),(1669,17,'kg',0),(1670,18,'kg',0),(1671,19,'kg',0),(1672,20,'kg',0),(1673,21,'kg',0),(1674,22,'kg',0),(1675,23,'kg',0),(1676,24,'kg',0),(1677,25,'kg',0),(1678,26,'kg',0),(1679,27,'kg',0),(1680,28,'kg',0),(1681,29,'kg',0),(1682,30,'kg',0),(1683,31,'kg',0),(1684,32,'kg',0),(1685,33,'kg',0),(1686,34,'kg',0),(1687,35,'kg',0),(1688,36,'kg',0),(1689,37,'kg',0),(1690,38,'kg',0),(1691,39,'kg',0),(1692,40,'kg',0),(1693,41,'kg',0),(1694,42,'kg',0),(1695,43,'kg',0),(1696,44,'kg',0),(1697,45,'kg',0),(1698,46,'kg',0),(1699,47,'kg',0),(1700,48,'kg',0),(1701,49,'kg',0),(1702,50,'kg',0),(1703,51,'kg',0),(1704,52,'kg',0),(1705,53,'kg',0),(1706,54,'kg',0),(1707,55,'kg',0),(1708,56,'kg',0),(1709,57,'kg',0),(1710,58,'kg',0),(1711,59,'kg',0),(1712,60,'kg',0),(1713,61,'kg',0),(1714,62,'kg',0),(1715,63,'kg',0),(1716,64,'kg',0),(1717,65,'kg',0),(1718,66,'kg',0),(1719,67,'kg',0),(1720,68,'kg',0),(1721,69,'kg',0),(1722,70,'kg',0),(1723,71,'kg',0),(1724,72,'kg',0),(1725,73,'kg',0),(1726,74,'kg',0),(1727,75,'kg',0),(1728,76,'kg',0),(1729,77,'kg',0),(1730,78,'kg',0),(1731,79,'kg',0),(1732,80,'kg',0),(1733,81,'kg',0),(1734,82,'kg',0),(1735,83,'kg',0),(1736,84,'kg',0),(1737,85,'kg',0),(1738,86,'kg',0),(1739,87,'kg',0),(1740,88,'kg',0),(1741,89,'kg',0),(1742,90,'kg',0),(1743,91,'kg',0),(1744,92,'kg',0),(1745,93,'kg',0),(1746,94,'kg',0),(1747,95,'kg',0),(1748,96,'kg',0),(1749,97,'kg',0),(1750,98,'kg',0),(1751,131,'kg',0),(1752,132,'kg',0),(1753,133,'kg',0),(1754,134,'kg',0),(1755,137,'kg',0),(1756,138,'kg',0),(1757,139,'kg',0),(1758,140,'kg',0),(1759,141,'kg',0),(1760,142,'kg',0),(1761,143,'kg',0),(1762,144,'kg',0),(1763,145,'kg',0),(1764,146,'kg',0),(1765,147,'kg',0),(1766,148,'kg',0),(1767,149,'kg',0),(1768,150,'kg',0),(1769,151,'kg',0),(1770,152,'kg',0),(1771,153,'kg',0),(1772,154,'kg',0),(1773,155,'kg',0),(1774,156,'kg',0),(1775,157,'kg',0),(1776,158,'kg',0),(1777,159,'kg',0),(1778,160,'kg',0),(1779,161,'kg',0),(1780,162,'kg',0),(1781,163,'kg',0),(1782,164,'kg',0),(1783,165,'kg',0),(1784,166,'kg',0),(1785,167,'kg',0),(1786,168,'kg',0),(1787,169,'kg',0),(1788,170,'kg',0),(1789,171,'kg',0),(1790,172,'kg',0),(1791,173,'kg',0),(1792,174,'kg',0),(1793,175,'kg',0),(1794,176,'kg',0),(1795,177,'kg',0),(1796,178,'kg',0),(1797,179,'kg',0),(1798,180,'kg',0),(1799,181,'kg',0),(1800,182,'kg',0),(1801,183,'kg',0),(1802,184,'kg',0),(1803,185,'kg',0),(1804,186,'kg',0),(1805,187,'kg',0),(1806,188,'kg',0),(1807,189,'kg',0),(1808,190,'kg',0),(1809,191,'kg',0),(1810,192,'kg',0),(1811,193,'kg',0),(1812,194,'kg',0),(1813,195,'kg',0),(1814,196,'kg',0),(1815,197,'kg',0),(1816,198,'kg',0),(1817,199,'kg',0),(1818,200,'kg',0),(1819,201,'kg',0),(1820,202,'kg',0),(1821,203,'kg',0),(1822,204,'kg',0),(1823,205,'kg',0),(1824,206,'kg',0),(1825,207,'kg',0),(1826,208,'kg',0),(1827,209,'kg',0),(1828,210,'kg',0),(1829,211,'kg',0),(1830,212,'kg',0),(1831,213,'kg',0),(1832,214,'kg',0),(1833,215,'kg',0),(1834,216,'kg',0),(1835,217,'kg',0),(1836,218,'kg',0),(1837,219,'kg',0),(1838,220,'kg',0),(1839,221,'kg',0),(1840,222,'kg',0),(1841,223,'kg',0),(1842,224,'kg',0),(1843,225,'kg',0),(1844,226,'kg',0),(1845,227,'kg',0),(1846,228,'kg',0);
/*!40000 ALTER TABLE `ingredient_units` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingredients`
--

DROP TABLE IF EXISTS `ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `density` float DEFAULT NULL,
  `average_weight` float DEFAULT NULL,
  `unit_type` varchar(500) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `is_custom` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `ingredients_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `ingredient_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=259 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredients`
--

LOCK TABLES `ingredients` WRITE;
/*!40000 ALTER TABLE `ingredients` DISABLE KEYS */;
INSERT INTO `ingredients` VALUES (1,'해선장',2.2,NULL,'liquid',NULL,0),(2,'굴소스',2,NULL,'liquid',NULL,0),(3,'머스타드',2,NULL,'liquid',NULL,0),(4,'땅콩버터',2,NULL,'liquid',NULL,0),(5,'다진 마늘',1.6,NULL,'vegetable',NULL,0),(6,'다진 생강',1.6,NULL,'vegetable',NULL,0),(7,'매실액',1.6,NULL,'liquid',NULL,0),(8,'홀그레인 머스타드',1.6,NULL,'liquid',NULL,0),(9,'홀스레디쉬',1.6,NULL,'liquid',NULL,0),(10,'와사비',1.6,NULL,'liquid',NULL,0),(11,'삼발',1.6,NULL,'liquid',NULL,0),(12,'두반장',1.6,NULL,'liquid',NULL,0),(13,'물엿',1.4,NULL,'liquid',NULL,0),(14,'조청',1.4,NULL,'liquid',NULL,0),(15,'치킨스톡',1.4,NULL,'powder',NULL,0),(16,'비프스톡',1.4,NULL,'powder',NULL,0),(17,'쯔유',1.4,NULL,'liquid',NULL,0),(18,'액젓',1.2,NULL,'liquid',NULL,0),(19,'춘장',1.2,NULL,'liquid',NULL,0),(20,'우스터셔',1.2,NULL,'liquid',NULL,0),(21,'액상캬라멜',1.2,NULL,'liquid',NULL,0),(22,'케찹',1.2,NULL,'liquid',NULL,0),(23,'마요네즈',1.2,NULL,'liquid',NULL,0),(24,'토마토 페이스트',1.2,NULL,'liquid',NULL,0),(25,'휘핑크림',1.2,NULL,'liquid',NULL,0),(26,'그릭 요거트',1.2,NULL,'liquid',NULL,0),(27,'토마토 소스',1.13333,NULL,'liquid',NULL,0),(28,'물',1,NULL,'liquid',NULL,0),(29,'우유',1,NULL,'liquid',NULL,0),(30,'간장',1,NULL,'liquid',NULL,0),(31,'식초',1,NULL,'liquid',NULL,0),(32,'레몬즙',1,NULL,'liquid',NULL,0),(33,'라임즙',1,NULL,'liquid',NULL,0),(34,'맛술',1,NULL,'liquid',NULL,0),(35,'와인',1,NULL,'liquid',NULL,0),(36,'핫소스',1,NULL,'liquid',NULL,0),(37,'스리라챠',1,NULL,'liquid',NULL,0),(38,'브로스',1,NULL,'liquid',NULL,0),(39,'생크림',1,NULL,'liquid',NULL,0),(40,'사워크림',1,NULL,'liquid',NULL,0),(41,'버터',0.933333,NULL,'liquid',NULL,0),(42,'참기름',0.933333,NULL,'liquid',NULL,0),(43,'들기름',0.933333,NULL,'liquid',NULL,0),(44,'식용유',0.866667,NULL,'liquid',NULL,0),(45,'올리브유',0.866667,NULL,'liquid',NULL,0),(46,'바닐라 익스트랙',0.866667,NULL,'liquid',NULL,0),(47,'소금',1,NULL,'powder',NULL,0),(48,'설탕',1,NULL,'powder',NULL,0),(49,'미원',1,NULL,'powder',NULL,0),(50,'카레가루',1,NULL,'powder',NULL,0),(51,'치킨파우더',1,NULL,'powder',NULL,0),(52,'베이킹 소다',1,NULL,'powder',NULL,0),(53,'전분',1,NULL,'powder',NULL,0),(54,'베이킹 파우더',0.8,NULL,'powder',NULL,0),(55,'찹쌀가루',0.8,NULL,'powder',NULL,0),(56,'후추',0.8,NULL,'powder',NULL,0),(57,'고춧가루',0.8,NULL,'powder',NULL,0),(58,'다시다',0.8,NULL,'powder',NULL,0),(59,'카이엔',0.8,NULL,'powder',NULL,0),(60,'레드페퍼 플레이크',0.8,NULL,'powder',NULL,0),(61,'건고추',0.8,NULL,'powder',NULL,0),(62,'페페로치노 홀',0.8,NULL,'powder',NULL,0),(63,'파프리카 파우더',0.8,NULL,'powder',NULL,0),(64,'칠리 파우더',0.8,NULL,'powder',NULL,0),(65,'갈릭 파우더',0.8,NULL,'powder',NULL,0),(66,'강황',0.8,NULL,'powder',NULL,0),(67,'어니언 파우더',0.8,NULL,'powder',NULL,0),(68,'올스파이스',0.8,NULL,'powder',NULL,0),(69,'양꼬치시즈닝',0.8,NULL,'powder',NULL,0),(70,'오향분',0.8,NULL,'powder',NULL,0),(71,'시나몬',0.8,NULL,'powder',NULL,0),(72,'제스트',0.6,NULL,'powder',NULL,0),(73,'파마산',0.6,NULL,'powder',NULL,0),(74,'이스트',0.6,NULL,'powder',NULL,0),(75,'콘밀',0.6,NULL,'powder',NULL,0),(76,'튀김가루',0.6,NULL,'powder',NULL,0),(77,'부침가루',0.6,NULL,'powder',NULL,0),(78,'들깨가루',0.6,NULL,'powder',NULL,0),(79,'강력분',0.550847,NULL,'powder',NULL,0),(80,'중력분',0.508475,NULL,'powder',NULL,0),(81,'박력분',0.423729,NULL,'powder',NULL,0),(82,'아몬드 가루',0.6,NULL,'powder',NULL,0),(83,'타임',0.4,NULL,'powder',NULL,0),(84,'바질',0.4,NULL,'powder',NULL,0),(85,'넛맥',0.4,NULL,'powder',NULL,0),(86,'마조람',0.4,NULL,'powder',NULL,0),(87,'로즈마리',0.4,NULL,'powder',NULL,0),(88,'큐민 시드',0.4,NULL,'powder',NULL,0),(89,'캐러웨이 시드',0.4,NULL,'powder',NULL,0),(90,'가람 마살라',0.4,NULL,'powder',NULL,0),(91,'코리앤더',0.4,NULL,'powder',NULL,0),(92,'커피가루',0.4,NULL,'powder',NULL,0),(93,'통깨',0.4,NULL,'powder',NULL,0),(94,'오레가노',0.2,NULL,'powder',NULL,0),(95,'타라곤',0.2,NULL,'powder',NULL,0),(96,'세이지',0.2,NULL,'powder',NULL,0),(97,'딜',0.133333,NULL,'powder',NULL,0),(98,'파슬리 가루',0.133333,NULL,'powder',NULL,0),(131,'해선장',2.2,NULL,'liquid',NULL,0),(132,'굴소스',2,NULL,'liquid',NULL,0),(133,'머스타드',2,NULL,'liquid',NULL,0),(134,'땅콩버터',2,NULL,'liquid',NULL,0),(135,'다진 마늘',1.6,NULL,'vegetable',NULL,0),(136,'다진 생강',1.6,NULL,'vegetable',NULL,0),(137,'매실액',1.6,NULL,'liquid',NULL,0),(138,'홀그레인 머스타드',1.6,NULL,'liquid',NULL,0),(139,'홀스레디쉬',1.6,NULL,'liquid',NULL,0),(140,'와사비',1.6,NULL,'liquid',NULL,0),(141,'삼발',1.6,NULL,'liquid',NULL,0),(142,'두반장',1.6,NULL,'liquid',NULL,0),(143,'물엿',1.4,NULL,'liquid',NULL,0),(144,'조청',1.4,NULL,'liquid',NULL,0),(145,'치킨스톡',1.4,NULL,'powder',NULL,0),(146,'비프스톡',1.4,NULL,'powder',NULL,0),(147,'쯔유',1.4,NULL,'liquid',NULL,0),(148,'액젓',1.2,NULL,'liquid',NULL,0),(149,'춘장',1.2,NULL,'liquid',NULL,0),(150,'우스터셔',1.2,NULL,'liquid',NULL,0),(151,'액상캬라멜',1.2,NULL,'liquid',NULL,0),(152,'케찹',1.2,NULL,'liquid',NULL,0),(153,'마요네즈',1.2,NULL,'liquid',NULL,0),(154,'토마토 페이스트',1.2,NULL,'liquid',NULL,0),(155,'휘핑크림',1.2,NULL,'liquid',NULL,0),(156,'그릭 요거트',1.2,NULL,'liquid',NULL,0),(157,'토마토 소스',1.13333,NULL,'liquid',NULL,0),(158,'물',1,NULL,'liquid',NULL,0),(159,'우유',1,NULL,'liquid',NULL,0),(160,'간장',1,NULL,'liquid',NULL,0),(161,'식초',1,NULL,'liquid',NULL,0),(162,'레몬즙',1,NULL,'liquid',NULL,0),(163,'라임즙',1,NULL,'liquid',NULL,0),(164,'맛술',1,NULL,'liquid',NULL,0),(165,'와인',1,NULL,'liquid',NULL,0),(166,'핫소스',1,NULL,'liquid',NULL,0),(167,'스리라챠',1,NULL,'liquid',NULL,0),(168,'브로스',1,NULL,'liquid',NULL,0),(169,'생크림',1,NULL,'liquid',NULL,0),(170,'사워크림',1,NULL,'liquid',NULL,0),(171,'버터',0.933333,NULL,'liquid',NULL,0),(172,'참기름',0.933333,NULL,'liquid',NULL,0),(173,'들기름',0.933333,NULL,'liquid',NULL,0),(174,'식용유',0.866667,NULL,'liquid',NULL,0),(175,'올리브유',0.866667,NULL,'liquid',NULL,0),(176,'바닐라 익스트랙',0.866667,NULL,'liquid',NULL,0),(177,'소금',1,NULL,'powder',NULL,0),(178,'설탕',1,NULL,'powder',NULL,0),(179,'미원',1,NULL,'powder',NULL,0),(180,'카레가루',1,NULL,'powder',NULL,0),(181,'치킨파우더',1,NULL,'powder',NULL,0),(182,'베이킹 소다',1,NULL,'powder',NULL,0),(183,'전분',1,NULL,'powder',NULL,0),(184,'베이킹 파우더',0.8,NULL,'powder',NULL,0),(185,'찹쌀가루',0.8,NULL,'powder',NULL,0),(186,'후추',0.8,NULL,'powder',NULL,0),(187,'고춧가루',0.8,NULL,'powder',NULL,0),(188,'다시다',0.8,NULL,'powder',NULL,0),(189,'카이엔',0.8,NULL,'powder',NULL,0),(190,'레드페퍼 플레이크',0.8,NULL,'powder',NULL,0),(191,'건고추',0.8,NULL,'powder',NULL,0),(192,'페페로치노 홀',0.8,NULL,'powder',NULL,0),(193,'파프리카 파우더',0.8,NULL,'powder',NULL,0),(194,'칠리 파우더',0.8,NULL,'powder',NULL,0),(195,'갈릭 파우더',0.8,NULL,'powder',NULL,0),(196,'강황',0.8,NULL,'powder',NULL,0),(197,'어니언 파우더',0.8,NULL,'powder',NULL,0),(198,'올스파이스',0.8,NULL,'powder',NULL,0),(199,'양꼬치시즈닝',0.8,NULL,'powder',NULL,0),(200,'오향분',0.8,NULL,'powder',NULL,0),(201,'시나몬',0.8,NULL,'powder',NULL,0),(202,'제스트',0.6,NULL,'powder',NULL,0),(203,'파마산',0.6,NULL,'powder',NULL,0),(204,'이스트',0.6,NULL,'powder',NULL,0),(205,'콘밀',0.6,NULL,'powder',NULL,0),(206,'튀김가루',0.6,NULL,'powder',NULL,0),(207,'부침가루',0.6,NULL,'powder',NULL,0),(208,'들깨가루',0.6,NULL,'powder',NULL,0),(209,'강력분',0.55,NULL,'powder',NULL,0),(210,'중력분',0.5,NULL,'powder',NULL,0),(211,'박력분',0.42,NULL,'powder',NULL,0),(212,'아몬드 가루',0.6,NULL,'powder',NULL,0),(213,'타임',0.4,NULL,'powder',NULL,0),(214,'바질',0.4,NULL,'powder',NULL,0),(215,'넛맥',0.4,NULL,'powder',NULL,0),(216,'마조람',0.4,NULL,'powder',NULL,0),(217,'로즈마리',0.4,NULL,'powder',NULL,0),(218,'큐민 시드',0.4,NULL,'powder',NULL,0),(219,'캐러웨이 시드',0.4,NULL,'powder',NULL,0),(220,'가람 마살라',0.4,NULL,'powder',NULL,0),(221,'코리앤더',0.4,NULL,'powder',NULL,0),(222,'커피가루',0.4,NULL,'powder',NULL,0),(223,'통깨',0.4,NULL,'powder',NULL,0),(224,'오레가노',0.2,NULL,'powder',NULL,0),(225,'타라곤',0.2,NULL,'powder',NULL,0),(226,'세이지',0.2,NULL,'powder',NULL,0),(227,'딜',0.133333,NULL,'powder',NULL,0),(228,'파슬리 가루',0.133333,NULL,'powder',NULL,0),(229,'양파(소)',0,125,'vegetable',NULL,0),(230,'양파(중)',0,160,'vegetable',NULL,0),(231,'양파(대)',0,250,'vegetable',NULL,0),(232,'당근',0,200,'vegetable',NULL,0),(233,'감자(소)',0,150,'vegetable',NULL,0),(234,'감자(중)',0,200,'vegetable',NULL,0),(235,'감자(대)',0,300,'vegetable',NULL,0),(236,'토마토',0,135,'vegetable',NULL,0),(237,'피망',0,100,'vegetable',NULL,0),(238,'파프리카',0,180,'vegetable',NULL,0),(239,'다다기 오이',0,215,'vegetable',NULL,0),(240,'가시 오이',0,250,'vegetable',NULL,0),(241,'취청 오이',0,240,'vegetable',NULL,0),(242,'생강(톨)',0,15,'vegetable',NULL,0),(243,'마늘쪽',0,4,'vegetable',NULL,0),(244,'통마늘/피마늘',0,70,'vegetable',NULL,0),(245,'생표고버섯',0,35,'vegetable',NULL,0),(246,'건표고버섯',0,5,'vegetable',NULL,0),(247,'대파(대)',0,150,'vegetable',NULL,0),(248,'시금치(단)',0,200,'vegetable',NULL,0),(249,'상추(잎)',0,5,'vegetable',NULL,0),(250,'부추(단)',0,500,'vegetable',NULL,0),(251,'쪽파(단)',0,1000,'vegetable',NULL,0),(252,'청경채',0,90,'vegetable',NULL,0),(253,'배추(3~9월)',0,3,'vegetable',NULL,0),(254,'배추(10~2월)',0,3.75,'vegetable',NULL,0),(255,'양배추',0,3.5,'vegetable',NULL,0),(256,'쥬키니호박',0,450,'vegetable',NULL,0),(257,'애호박',0,400,'vegetable',NULL,0),(258,'방울토마토',0,15,'vegetable',NULL,0);
/*!40000 ALTER TABLE `ingredients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location_tags`
--

DROP TABLE IF EXISTS `location_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `city` varchar(20) DEFAULT NULL,
  `sort_order` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location_tags`
--

LOCK TABLES `location_tags` WRITE;
/*!40000 ALTER TABLE `location_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `location_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_ingredients`
--

DROP TABLE IF EXISTS `recipe_ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_ingredients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipe_id` int DEFAULT NULL,
  `ingredient_id` int DEFAULT NULL,
  `quantity` float NOT NULL,
  `unit_name` varchar(500) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `recipe_id` (`recipe_id`),
  KEY `ingredient_id` (`ingredient_id`),
  KEY `ix_recipe_ingredients_id` (`id`),
  CONSTRAINT `recipe_ingredients_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`),
  CONSTRAINT `recipe_ingredients_ibfk_2` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_ingredients`
--

LOCK TABLES `recipe_ingredients` WRITE;
/*!40000 ALTER TABLE `recipe_ingredients` DISABLE KEYS */;
INSERT INTO `recipe_ingredients` VALUES (1,NULL,NULL,0,''),(3,3,1,500,'ml'),(4,3,3,100,'g'),(9,10,2,30,'ml'),(10,10,3,10,'g'),(23,1,2,7,'개');
/*!40000 ALTER TABLE `recipe_ingredients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_step_images`
--

DROP TABLE IF EXISTS `recipe_step_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_step_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `step_id` int NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `step_id` (`step_id`),
  CONSTRAINT `recipe_step_images_ibfk_1` FOREIGN KEY (`step_id`) REFERENCES `recipe_steps` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_step_images`
--

LOCK TABLES `recipe_step_images` WRITE;
/*!40000 ALTER TABLE `recipe_step_images` DISABLE KEYS */;
INSERT INTO `recipe_step_images` VALUES (13,13,'/uploads/recipes/3/steps/1/3742411a10de48e4a06643c595c58968.png',NULL),(15,14,'/uploads/recipes/3/steps/2/a1423ae63f144d46841370d429ced983.png',NULL);
/*!40000 ALTER TABLE `recipe_step_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_steps`
--

DROP TABLE IF EXISTS `recipe_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_steps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipe_id` int DEFAULT NULL,
  `step_order` int NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `recipe_id` (`recipe_id`),
  KEY `ix_recipe_steps_id` (`id`),
  CONSTRAINT `recipe_steps_ibfk_1` FOREIGN KEY (`recipe_id`) REFERENCES `recipes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_steps`
--

LOCK TABLES `recipe_steps` WRITE;
/*!40000 ALTER TABLE `recipe_steps` DISABLE KEYS */;
INSERT INTO `recipe_steps` VALUES (13,3,1,'육수 끓이기'),(14,3,2,'야채와 고기 넣기'),(15,3,3,'뿌아아ㅏㅇ'),(17,10,1,'팬에 기름을 두르고 밥을 볶는다.'),(18,10,2,'굴소스와 설탕을 넣고 고르게 섞는다.'),(29,1,3,'string');
/*!40000 ALTER TABLE `recipe_steps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipes`
--

DROP TABLE IF EXISTS `recipes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(500) NOT NULL,
  `base_serving` int NOT NULL,
  `uploader_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `uploader_id` (`uploader_id`),
  KEY `ix_recipes_id` (`id`),
  CONSTRAINT `recipes_ibfk_1` FOREIGN KEY (`uploader_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipes`
--

LOCK TABLES `recipes` WRITE;
/*!40000 ALTER TABLE `recipes` DISABLE KEYS */;
INSERT INTO `recipes` VALUES (1,'맛있는빵',2,1,'2025-11-25 10:28:09',''),(3,'예시 음식3',4,1,'2025-11-25 10:28:09',''),(5,'string',1,1,'2025-11-25 10:28:09',''),(6,'string',1,1,'2025-11-25 10:28:09',''),(7,'string',1,1,'2025-11-25 10:28:09',''),(10,'굴소스 볶음밥',2,1,'2025-11-25 10:28:09','');
/*!40000 ALTER TABLE `recipes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `regions`
--

DROP TABLE IF EXISTS `regions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(500) NOT NULL,
  `parent_id` int DEFAULT NULL,
  `depth` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `regions_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `regions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `regions`
--

LOCK TABLES `regions` WRITE;
/*!40000 ALTER TABLE `regions` DISABLE KEYS */;
INSERT INTO `regions` VALUES (1,'서울',NULL,1),(2,'경기',NULL,1),(3,'인천',NULL,1),(4,'부산',NULL,1),(5,'강원',NULL,1),(6,'대전',NULL,1),(7,'충북',NULL,1),(8,'충남',NULL,1),(9,'경남',NULL,1),(10,'대구',NULL,1),(11,'경북',NULL,1),(12,'울산',NULL,1),(13,'전남',NULL,1),(14,'광주',NULL,1),(15,'전북',NULL,1),(16,'제주',NULL,1),(18,'세종',NULL,1),(21,'강남',1,2),(22,'서초',1,2),(23,'잠실/송파/강동',1,2),(24,'종로/중구',1,2),(25,'영등포/여의도/당산',1,2),(26,'건대/성수/왕십리',1,2),(27,'홍대/합정/마포',1,2),(28,'용산/이태원/한남',1,2),(29,'성북/노원/중랑',1,2),(30,'구로/관악/동작',1,2),(41,'수원/화성/오산',2,2),(42,'용인/분당/성남',2,2),(43,'안양/군포/의왕',2,2),(44,'안산/시흥',2,2),(45,'일산/고양',2,2),(46,'부천/김포',2,2),(47,'광명',2,2),(48,'의정부/양주/동두천',2,2),(49,'구리/남양주/하남',2,2),(50,'광주/여주/이천',2,2),(51,'평택/안성',2,2),(52,'파주',2,2),(53,'포천/가평/연천',2,2),(54,'서울 전체',1,2),(55,'경기 전체',2,2),(56,'인천 전체',3,2),(57,'부산 전체',4,2),(58,'강원 전체',5,2),(59,'대전 전체',6,2),(60,'충북 전체',7,2),(61,'충남 전체',8,2),(62,'경남 전체',9,2),(63,'대구 전체',10,2),(64,'경북 전체',11,2),(65,'울산 전체',12,2),(66,'전남 전체',13,2),(67,'광주 전체',14,2),(68,'전북 전체',15,2),(69,'제주 전체',16,2),(70,'세종 전체',18,2);
/*!40000 ALTER TABLE `regions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_images`
--

DROP TABLE IF EXISTS `restaurant_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `created_at` float DEFAULT NULL,
  `is_cover` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `restaurant_id` (`restaurant_id`),
  CONSTRAINT `restaurant_images_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_images`
--

LOCK TABLES `restaurant_images` WRITE;
/*!40000 ALTER TABLE `restaurant_images` DISABLE KEYS */;
INSERT INTO `restaurant_images` VALUES (11,4,'/static/uploads/1756403294160_053be63d.png',1756400000,NULL),(12,4,'/static/uploads/1756403373970_fcbff686.png',1756400000,NULL),(13,16,'/static/uploads/1756403617327_f9f8249c.png',1756400000,NULL);
/*!40000 ALTER TABLE `restaurant_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_tag_categories`
--

DROP TABLE IF EXISTS `restaurant_tag_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_tag_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(500) NOT NULL,
  `slug` varchar(500) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_tag_categories`
--

LOCK TABLES `restaurant_tag_categories` WRITE;
/*!40000 ALTER TABLE `restaurant_tag_categories` DISABLE KEYS */;
INSERT INTO `restaurant_tag_categories` VALUES (1,'음식 종류','cuisine'),(2,'분위기','ambience'),(3,'사용자 지정','user_defined'),(9,'j',''),(100,'가격대','price');
/*!40000 ALTER TABLE `restaurant_tag_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_tags`
--

DROP TABLE IF EXISTS `restaurant_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_tags` (
  `restaurant_id` int NOT NULL,
  `tag_id` int NOT NULL,
  PRIMARY KEY (`restaurant_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `restaurant_tags_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`),
  CONSTRAINT `restaurant_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_tags`
--

LOCK TABLES `restaurant_tags` WRITE;
/*!40000 ALTER TABLE `restaurant_tags` DISABLE KEYS */;
INSERT INTO `restaurant_tags` VALUES (32,10),(34,10),(35,10),(36,10),(37,10),(38,10),(41,10),(45,10),(46,10),(42,11),(49,11),(54,11),(59,12),(61,12),(62,12),(44,13),(52,13),(47,14),(51,14),(48,15),(63,15),(60,16),(33,17),(55,17),(56,17),(58,17),(39,18),(43,18),(50,19),(55,22),(40,30),(53,30),(57,30),(60,310),(54,315),(1,316),(3,316),(15,316),(17,316),(26,316),(21,329),(58,335),(24,368),(29,368),(60,375),(48,376),(49,380),(1,381),(3,381),(7,381),(15,381),(23,381),(31,381),(46,381),(54,393),(5,394),(28,394),(32,394),(34,394),(38,394),(58,400),(47,403),(51,403),(59,405),(42,406),(49,406),(1,407),(4,407),(7,407),(17,407),(18,407),(19,407),(20,407),(26,407),(30,407),(31,407),(32,407),(34,407),(35,407),(36,407),(37,407),(41,407),(45,407),(22,421),(22,428),(6,430),(6,431),(38,431),(3,432),(22,432),(7,434),(14,434),(22,434),(23,434),(42,434),(44,435),(52,435),(9,436),(16,436),(17,436),(50,436),(9,437),(27,437),(27,438),(33,439),(39,439),(43,439),(56,439),(2,700),(8,702),(10,702),(13,702),(24,702),(53,702),(57,702),(40,707),(12,712),(40,712),(8,713),(10,713),(13,713),(57,713);
/*!40000 ALTER TABLE `restaurant_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurants`
--

DROP TABLE IF EXISTS `restaurants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(500) NOT NULL,
  `address` varchar(500) DEFAULT NULL,
  `location_link` varchar(500) NOT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `location_tag_id` int NOT NULL,
  `uploaded_by` int NOT NULL,
  `rating` int DEFAULT NULL,
  `summary` text,
  `description` text,
  `price_min` int NOT NULL,
  `price_max` int NOT NULL,
  `created_at` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `location_tag_id` (`location_tag_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `restaurants_ibfk_1` FOREIGN KEY (`location_tag_id`) REFERENCES `regions` (`id`),
  CONSTRAINT `restaurants_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurants`
--

LOCK TABLES `restaurants` WRITE;
/*!40000 ALTER TABLE `restaurants` DISABLE KEYS */;
INSERT INTO `restaurants` VALUES (1,'할랄킹',NULL,'https://kko.kakao.com/x1tvZHwqM7',NULL,NULL,47,4,5,'나시르막이 6900원밖에 안 하고 뚬얌에 새우가 많다.','나시르막',11904,15367,NULL),(2,'솔리드웍스 아이스크림 고려대점',NULL,'https://kko.kakao.com/9PXlwweIdt',NULL,NULL,41,4,5,'과즙함량 아주 높고 식감 잘 살린 안암에서 fine이란 단어 붙어도 되는곳','',13203,15896,NULL),(3,'시홍쓰',NULL,'https://kko.kakao.com/eI7kw7AZxH',NULL,NULL,26,4,5,'잘 볶은 돼지고기, 적절한 매운맛과 라한맛의 기름, 고수가 자아내는 아름다운 삼박자가 있는 마파두부 (11500원) ','마파두부',8554,12538,NULL),(4,'논현손칼국수',NULL,'https://place.map.kakao.com/16037196',NULL,NULL,46,4,5,'사리 무한리필 가능! 논현칼국수의 육수는 육고기와 바닷고기의 감칠맛 상승효과가 무엇인지 제대로 알 수 있는 맛집','',13783,19280,NULL),(5,'왕십리닭곰탕',NULL,'https://place.map.kakao.com/16183533',NULL,NULL,42,4,5,'노계를 썼음에도 딱 알맞은 쫄깃함을 가진 살코기와 극한의 감칠맛과 적절한 매운맛을 지닌 양념의 닭도리탕은 총주방장의 최애 닭도리탕집이다.','',14462,18216,NULL),(6,'박서방 순대곱창',NULL,'https://place.map.kakao.com/7881618',NULL,NULL,23,4,5,'다양한 내장과 부속이 들어온다. 진국이다.','',11918,15601,NULL),(7,'서두산 딤섬 2호점',NULL,'https://place.map.kakao.com/1396116679',NULL,NULL,30,4,5,'식감이 좋고 재료가 실하게 들어있음. 비싸지도 않다.','군만두',10209,16073,NULL),(8,'흐릇',NULL,'https://place.map.kakao.com/560527159',NULL,NULL,51,4,5,'케이크가 무척 맛있다. 케이크 덕후에게 인정받음.','치즈케이크',10950,15666,NULL),(9,'차고버거',NULL,'https://place.map.kakao.com/1645311420',NULL,NULL,42,4,5,'잘 구워진 패티와 양파로 버거의 기본을 완벽하게 잡고 와우포인트가 있는 버거들과 타코를 파는 집입니다. ','',11707,17515,NULL),(10,'알페도 카페',NULL,'https://place.map.kakao.com/582841952',NULL,NULL,25,4,5,'튀르키예 등 다양한 나라의 특이한 디저트가 많고 엄청 달다.','퀴네페, 트레스레체스',8986,14770,NULL),(11,'알페도 케밥',NULL,'https://place.map.kakao.com/76119460',NULL,NULL,49,4,5,'케밥과 피데가 맛있고 특이하다.','케밥, 피데',10297,13829,NULL),(12,'니커버커 베이글',NULL,'https://place.map.kakao.com/211083550',NULL,NULL,42,4,5,'베이글의 겉부분에 아주 맛있는 향신료가 올라가 있고 쫄깃쫄깃한 니커버커베이글입니다.','',13528,18759,NULL),(13,'써니사이드커피',NULL,'https://place.map.kakao.com/18857241',NULL,NULL,23,4,5,'제가 개인적으로 안암에서 원탑이라고 생각하는 써니사이드 카페','',7287,12679,NULL),(14,'쟈니덤플링',NULL,'https://place.map.kakao.com/721715250',NULL,NULL,46,4,5,'군만두, 물만두 둘 다 맛있다.','',7800,10165,NULL),(15,'모로코코',NULL,'https://place.map.kakao.com/276990260',NULL,NULL,41,4,4,'','',13921,16065,NULL),(16,'올디스타코',NULL,'https://place.map.kakao.com/457395048',NULL,NULL,26,4,4,'','',9649,12505,NULL),(17,'갓잇',NULL,'https://place.map.kakao.com/1807739168',NULL,NULL,42,4,4,'','',10692,17075,NULL),(18,'지로우라멘',NULL,'https://place.map.kakao.com/23734945',NULL,NULL,23,4,4,'','돈코츠',12389,20053,NULL),(19,'멘야시노기',NULL,'https://place.map.kakao.com/212188356',NULL,NULL,23,4,4,'','츠케멘',5456,12101,NULL),(20,'샤오바오우육면',NULL,'https://place.map.kakao.com/2053098478',NULL,NULL,43,4,4,'','',12962,17235,NULL),(21,'오늘은슈림프',NULL,'https://place.map.kakao.com/1207324621',NULL,NULL,29,4,4,'','',14764,21710,NULL),(22,'울란바토르',NULL,'https://place.map.kakao.com/18824253',NULL,NULL,53,4,4,'무난하게 맛있는 몽골 음식점! 만두가 다양하고 맛있다.','튀김 만두, 양고기 덮밥',13071,16305,NULL),(23,'춘향미엔 왕십리점',NULL,'https://place.map.kakao.com/1658512250',NULL,NULL,45,4,4,'치마 깔리게 튀기는 근본 만두집','',7325,11986,NULL),(24,'도코로',NULL,'https://place.map.kakao.com/1134104552',NULL,NULL,23,4,4,'특이한 메뉴. 처음 먹어보는데 맛있다.','아보카도 스무디, 샤케라또',12351,17190,NULL),(25,'스아게 성수점',NULL,'https://place.map.kakao.com/136249701',NULL,NULL,42,4,4,'스프카레가 얼큰해요','',11707,16821,NULL),(26,'서보',NULL,'https://place.map.kakao.com/290687035',NULL,NULL,26,4,4,'','',13395,18562,NULL),(27,'롸카두들 내쉬빌 핫치킨 이태원점',NULL,'https://place.map.kakao.com/83108266',NULL,NULL,21,4,4,'맛있는 동선','',9180,14101,NULL),(28,'김영자나주곰탕',NULL,'https://place.map.kakao.com/27451554',NULL,NULL,29,4,4,'서울역과 서울대의 맛집','',6928,13904,NULL),(29,'높은산',NULL,'https://place.map.kakao.com/1440389368',NULL,NULL,41,4,4,'짜이를 먹어보고 싶은 여러분을 위해 공유합니다','짜이',10674,16298,NULL),(30,'더빛남',NULL,'https://place.map.kakao.com/1618885386',NULL,NULL,49,4,4,'맛있긴 하나 30분 웨이팅을 감수할 정도는 아님','',9071,15918,NULL),(31,'중국관',NULL,'https://place.map.kakao.com/11992230',NULL,NULL,46,4,4,'시간이 멈춰있기에 더욱 더 가치있는 중국집','',11324,14278,NULL),(32,'육장정',NULL,'https://place.map.kakao.com/309142826',37.5106,127.109,23,4,4,'갈비 4대와 꼬들한 면은 라면을 먹으면서 부자가 된 기분을 느끼게 해준다. 마지막에 기름기를 완벽히 날려주는 자몽이 있다.\n\n송리단길이라는 단어와 뭔가 어울리지 않는 육개장집. 갈비 4대와 꼬들한 면은 라면을 먹으면서 부자가 된 기분을 느끼게 해준다. 마지막에 기름기를 완벽히 날려주는 자몽은 사장님 부부의 센스를 느끼게 해주는 디테일이다.','육개장',10000,14000,NULL),(33,'꼬따',NULL,'https://place.map.kakao.com/143081516',37.5074,127.115,23,4,4,'화덕에서 구워 빵에서 불향이 남\n\n이탈리아에서 피자를 배워오신 사장님이 화덕에서 구워주시는 진짜 나폴리 피자. 빵에서 계속 불향이 나서 엣지까지 재미있는 피자였습니다','나폴리 피자',10000,14000,NULL),(34,'산월수제비',NULL,'https://place.map.kakao.com/16271793',37.4953,127.064,21,4,4,'멸치베이스에 딱 밀가루 반죽으로 칼국수랑 수제비를 넣은 정말 기본적인 배치지만 딱 기본에 충실하게 먹고 싶을때 가기 좋습니당.',NULL,10000,14000,NULL),(35,'강남교자칼국수','서울 서초구 강남대로69길 11 삼미빌딩','https://place.ap.kakao.com/11891754',37.5015,127.024,22,4,4,'명동교자에 비해 더 깔끔한 맛이 일품입니다',NULL,10000,14000,NULL),(36,'임병주산동칼국수','서울 서초구 강남대로37길 65','https://place.map.kakao.com/25038356',37.4846,127.03,22,4,4,'해산물+채소 베이스라 부담없이 잘 넘어갑니다',NULL,10000,14000,NULL),(37,'베테랑칼국수','전북 전주시 완산구 경기전길 135','https://place.map.kakao.com/15482458',35.8135,127.151,15,4,4,'쫄면도 맛있고 칼국수도 무난합니다',NULL,10000,14000,NULL),(38,'백암왕순대','서울 서초구 사평대로55길 139 미성빌딩','https://place.map.kakao.com/9817288',37.51,127.02,22,4,4,'국물이 깔끔하고 건더기가 많음.\n\n이투스 정승제T의 최애 순댓국이라는 백암 왕순대. 호기롭게 주문한 얼큰이탕 (특)은 ‘얼큰‘하지는 않았다. 국물이 깔끔하고 건더기가 아주 많은점은 좋았음.',NULL,10000,14000,NULL),(39,'브릭오븐','서울 강남구 강남대로102길 31 2층','https://place.map.kakao.com/19037502',37.5031,127.028,21,4,4,'본토 스타일\n\n시험이 끝난것을 기념하여 오랜만에 식당 모임을 가졌습니다. 미국인 형님들의 바이브를 느끼며 본토 스타일의 피자와 지티를 먹었습니다. 그리고 프로슈토 풍기 피자에 도전해주신 부원들께 진심으로 감사드리며 다음에도 맛있는 음식으로 찾아뵙겠습니다.','프로슈토 풍기',10000,14000,NULL),(40,'비밀베이커리','서울 송파구 올림픽로 269 프리미엄 롯데슈퍼 지하1층 비밀베이커리','https://place.map.kakao.com/1329233080',37.5144,127.101,23,4,4,'가성비 샌드위치 맛집 .재료간의 조화가 아주 좋으며, 가벼운 한끼 식사로 추천합니다.\n\n가성비 샌드위치 맛집 ‘비밀 베이커리’입니다. 6-8천원 가격대에서 만원 중반대 샌드위치 퀄리티를 그대로 느낄 수 있는 아주 훌륭한 맛집입니다. 재료간의 조화가 아주 좋으며, 가벼운 한끼 식사로 추천합니다.',NULL,10000,14000,NULL),(41,'원조손칼국수','서울 성북구 종암로 113 국승호치과의원','https://place.map.kakao.com/11486122',36.3732,127.32,29,4,4,'한식의 강자를 찾기 상당히 어려운 학교 주변 권역에서 묵직한 한방을 가진 맛집입니다.\n\n갈축 끝나는 날 가본 맛집인데 이제서야 소개를 합니다. 한식의 강자를 찾기 상당히 어려운 학교 주변 권역에서 묵직한 한방을 가진 맛집입니다. 전식으로 주시는 동치미국물은 적절히 찬 온도감에 통쾌하다싶은 시원한 맛이 좋습니다. 칼국수의 육수는 사골베이스와 채소의 단맛이 묵직하게 때려박는 일품 그 자체인 맛입니다. 만두는 부추와 고기가 넉넉히 들어있고 (당면 없는걸로 봐서 가게에서 만들었음) 간 또한 타이트해서 좋았습니다.',NULL,10000,14000,NULL),(42,'지우관','서울 성동구 뚝섬로 427-15 B1층','https://place.map.kakao.com/1060315738',37.5384,127.058,26,4,4,'총평: 잘하는 집은 맞음. 가격대비 만족도 좋음.하지만 회장 본인이 중식에 대한 기준이 매애애우 까다로운 사람이라 회장한테는 soso\n\n성수동의 아주 안쪽에 있는 중화요리집 ‘지우관’에 갔다 왔습니다. 딤섬, 요리, 우육면 등을 파는 곳입니다. 동파육 덮밥은 고추잡채덮밥에서 응용된 야채볶음을 올려주어 식사 자체를 완주하기에는 아주 좋으나 동파육 자체의 맛은 그럭저럭입니다. 딤섬은 유바에다가 새우를 넣은 춘권인데 식감이 재밌고 새우가 제법 많이 들었습니다. 우육면은 고수의 향이 강하고 (그야 제가 고수를 많이 넣어서) 국물이 무난하였습니다.',NULL,10000,14000,NULL),(43,'모터시티',NULL,'https://place.map.kakao.com/124338573',37.534,126.989,28,4,4,NULL,NULL,10000,14000,NULL),(44,'옷샬','서울 종로구 창경궁로 236 이화빌딩 2층','https://place.map.kakao.com/12740961',37.4798,126.953,30,4,3,NULL,NULL,10000,14000,NULL),(45,'이랑칼국수',NULL,'https://place.map.kakao.com/1708835011',37.5068,127.109,23,4,3,NULL,NULL,10000,14000,NULL),(46,'이드','서울 용산구 우사단로10길 15 1층','https://place.map.kakao.com/26533982',37.5332,126.996,28,4,3,'한식당',NULL,10000,14000,NULL),(47,'박소린두깜풍','서울 용산구 보광로59길 9 2층','https://place.map.kakao.com/995771109',37.5339,126.993,28,4,3,NULL,NULL,10000,14000,NULL),(48,'후르레스토랑','서울 용산구 우사단로10길 20','https://place.map.kakao.com/798069930',37.5331,126.997,28,4,3,NULL,NULL,10000,14000,NULL),(49,'핑퐁','서울 송파구 올림픽로35가길 9 월드마크 푸르지오 1층 135호','https://place.map.kakao.com/733399518',37.522,127.021,23,4,3,'일본식 중화요리집',NULL,10000,14000,NULL),(50,'꿰레','서울 종로구 보문로1길 9 1층 꿰레','https://place.map.kakao.com/325095246',37.5763,127.023,24,4,3,'안암 근처 타코 제대로 하는 집',NULL,10000,14000,NULL),(51,'벱','서울 성동구 성수일로4가길 2 1층','https://place.map.kakao.com/1079903424',37.5421,127.054,26,4,3,NULL,NULL,10000,14000,NULL),(52,'머노까머나','서울 종로구 창경궁로 236 이화빌딩 2층','https://place.map.kakao.com/12980859',37.5826,126.999,24,4,3,NULL,NULL,10000,14000,NULL),(53,'피프에스프레소바','서울 중구 충무로4길 3 1층','https://place.map.kakao.com/1178169559',37.5651,126.993,24,4,3,NULL,NULL,10000,14000,NULL),(54,'줄리아','서울 중구 수표로 48-12','https://place.map.kakao.com/842439367',37.5655,126.99,24,4,3,NULL,NULL,10000,14000,NULL),(55,'문화식당',NULL,'https://place.map.kakao.com/485306026',37.5423,127.054,29,4,3,NULL,NULL,10000,14000,NULL),(56,'로마네꽁띠','서울 종로구 북촌로5나길 83-6 로마네꽁띠','https://place.map.kakao.com/8344631',37.5844,126.982,24,4,3,NULL,NULL,10000,14000,NULL),(57,'so far 소파','서울 성동구 성수일로4길 50 1층','https://place.map.kakao.com/613639039',37.5424,127.054,26,4,3,NULL,NULL,10000,14000,NULL),(58,'로컬릿','서울특별시 성동구 한림말길 33, 2층','https://place.map.kakao.com/412460362',37.5409,127.015,26,4,3,'비건이라는 특성상 한번에 이해하기는 어렵다. 두 번 방문할 각오를 하셔라.\n\n첫 메뉴부터 이들에게 솔직히 난해했다. 후무스는 먹어본 적 있는 이들이였지만 백태콩으로 만든 후무스는 쉽지 않았다. 야채들의 맛이 조화되는 무언가가 느껴지기는 했는데 무언가 이해가 되지 않는 맛이였다.\n\n시금치 뇨끼는 개인적으로 나에게는 감칠맛에 부족하다고 느껴졌다. 평소 접하는 파스타에서는 소스를 낼 때 고기육수를 주되게 쓰거나 동물성 크림을 쓰다보니 그런듯 했다. 시금치를 뭔가 넣고 육수를 쓴 것 같기는 한데...... 많이 아쉬웠다.\n\n비건 삼형제 중에서 호박 까넬로니는 그나마 이해할 수 있었다. 파스타 속 단호박과 당근 소스, 치즈의 조화가 괜찮게 다가왔다. 하지만 이미 두개의 메뉴에서 기대가 꺾인 두 남자들은 그냥저냥 먹었다. 평소의 나처럼 이거라도 이해해보라고 설명을 할 분위기가 아니였다.\n\n라구 리가토니는 비건이 아닌 메뉴였다. 그래서 겁나 맛있었다. 그냥 해치웠다. 그래도 백수저의 클래스가 느껴지는 깊이였다.\n\n암튼 두 남자는 난해한 메뉴를 먹었다. 그들의 첫 비건 식당 탐방은 물음표만을 잔뜩 남기고 끝났다. 그렇게 그들은 물음표를 떠안고 다른 무언가를 먹기 위해 동호대교를 걸었다.\n\n그렇게 커손연 영문표기 논쟁은 시작되었다......',NULL,10000,14000,NULL),(59,'고미태','서울 마포구 월드컵로 41 1층 고미태','https://place.map.kakao.com/1947880008',37.553,126.912,27,4,3,'무언가 철학이 있는 요리를 먹고 싶다면 추천합니디',NULL,10000,14000,NULL),(60,'베델아프리칸레스토랑','서울 용산구 보광로60길 8','https://place.map.kakao.com/1589374106',37.5339,126.995,28,4,1,'입맛에 안 맞음. 같이 간 사람 중에 토하러 간 사람도 있음.',NULL,10000,14000,NULL),(61,'마초야',NULL,'https://maps.app.goo.gl/6y21p7gCRhXHLUJ98',NULL,NULL,23,4,4,'면발','dddddd',10000,25000,1766910000),(62,'마초야',NULL,'https://maps.app.goo.gl/6y21p7gCRhXHLUJ98',NULL,NULL,23,4,5,'자루우동냉우동','dsfdgs',10000,25000,1766910000),(63,'허머스키친',NULL,'https://maps.app.goo.gl/8Y5MM4WY7i7a7tax6',NULL,NULL,21,4,5,'..............','kkkkkkkkkkkkk',10000,20000,1767360000);
/*!40000 ALTER TABLE `restaurants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role` varchar(500) NOT NULL,
  `permission_id` int NOT NULL,
  `is_enabled` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_role_permissions_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permissions`
--

LOCK TABLES `role_permissions` WRITE;
/*!40000 ALTER TABLE `role_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `role_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `signup_code`
--

DROP TABLE IF EXISTS `signup_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `signup_code` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `changed_by` int DEFAULT NULL,
  `changed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_signup_code_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `signup_code`
--

LOCK TABLES `signup_code` WRITE;
/*!40000 ALTER TABLE `signup_code` DISABLE KEYS */;
INSERT INTO `signup_code` VALUES (1,'kurry',1,NULL,'2025-11-13 16:35:58');
/*!40000 ALTER TABLE `signup_code` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `parent_id` int DEFAULT NULL,
  `name` varchar(500) NOT NULL,
  `slug` varchar(500) DEFAULT NULL,
  `is_selectable` tinyint(1) DEFAULT NULL,
  `featured_rank` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `category_id` (`category_id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `tags_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `restaurant_tag_categories` (`id`),
  CONSTRAINT `tags_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `tags` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=729 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (1,2,NULL,'캐주얼','casual',1,1),(2,2,NULL,'아늑함','cozy',1,2),(3,2,NULL,'조용함','quiet',1,3),(4,2,NULL,'데이트 코스','date-night',1,4),(5,2,NULL,'가족/아이동반','family-friendly',1,5),(6,2,NULL,'단체 모임','group-friendly',1,6),(7,2,NULL,'트렌디/힙','trendy',1,7),(8,2,NULL,'늦은 밤','late-night',1,8),(9,2,NULL,'브런치','brunch',1,9),(10,1,NULL,'한식','korean',1,NULL),(11,1,NULL,'중식','chinese',1,NULL),(12,1,NULL,'일식','japanese',1,NULL),(13,1,NULL,'인도','indian',1,NULL),(14,1,NULL,'동남아시아','southeast-asia',1,NULL),(15,1,NULL,'중동','middle-east',1,NULL),(16,1,NULL,'아프리카','africa',1,NULL),(17,1,NULL,'양식','western',1,NULL),(18,1,NULL,'북미','north-america',1,NULL),(19,1,NULL,'남미','south-america',1,NULL),(20,1,NULL,'북유럽','nordic',1,NULL),(21,1,NULL,'동유럽','eastern-europe',1,NULL),(22,1,NULL,'컨템포러리(퓨전)','contemporary-fusion',1,NULL),(23,1,NULL,'몽골/중앙아시아','central-asia',1,NULL),(30,1,NULL,'카페','cafe',1,NULL),(304,1,22,'고기','contemporary-fusion-meat',1,NULL),(305,1,21,'고기','eastern-europe-meat',1,NULL),(306,1,20,'고기','nordic-meat',1,NULL),(307,1,19,'고기','south-america-meat',1,NULL),(308,1,18,'고기','north-america-meat',1,NULL),(309,1,17,'고기','western-meat',1,NULL),(310,1,16,'고기','africa-meat',1,NULL),(311,1,15,'고기','middle-east-meat',1,NULL),(312,1,14,'고기','southeast-asia-meat',1,NULL),(313,1,13,'고기','indian-meat',1,NULL),(314,1,12,'고기','japanese-meat',1,NULL),(315,1,11,'고기','chinese-meat',1,NULL),(316,1,10,'고기','korean-meat',1,NULL),(317,1,22,'해산물','contemporary-fusion-seafood',1,NULL),(318,1,21,'해산물','eastern-europe-seafood',1,NULL),(319,1,20,'해산물','nordic-seafood',1,NULL),(320,1,19,'해산물','south-america-seafood',1,NULL),(321,1,18,'해산물','north-america-seafood',1,NULL),(322,1,17,'해산물','western-seafood',1,NULL),(323,1,16,'해산물','africa-seafood',1,NULL),(324,1,15,'해산물','middle-east-seafood',1,NULL),(325,1,14,'해산물','southeast-asia-seafood',1,NULL),(326,1,13,'해산물','indian-seafood',1,NULL),(327,1,12,'해산물','japanese-seafood',1,NULL),(328,1,11,'해산물','chinese-seafood',1,NULL),(329,1,10,'해산물','korean-seafood',1,NULL),(330,1,22,'채소','contemporary-fusion-vegetable',1,NULL),(331,1,21,'채소','eastern-europe-vegetable',1,NULL),(332,1,20,'채소','nordic-vegetable',1,NULL),(333,1,19,'채소','south-america-vegetable',1,NULL),(334,1,18,'채소','north-america-vegetable',1,NULL),(335,1,17,'채소','western-vegetable',1,NULL),(336,1,16,'채소','africa-vegetable',1,NULL),(337,1,15,'채소','middle-east-vegetable',1,NULL),(338,1,14,'채소','southeast-asia-vegetable',1,NULL),(339,1,13,'채소','indian-vegetable',1,NULL),(340,1,12,'채소','japanese-vegetable',1,NULL),(341,1,11,'채소','chinese-vegetable',1,NULL),(342,1,10,'채소','korean-vegetable',1,NULL),(343,1,22,'디저트','contemporary-fusion-dessert',1,NULL),(344,1,21,'디저트','eastern-europe-dessert',1,NULL),(345,1,20,'디저트','nordic-dessert',1,NULL),(346,1,19,'디저트','south-america-dessert',1,NULL),(347,1,18,'디저트','north-america-dessert',1,NULL),(348,1,17,'디저트','western-dessert',1,NULL),(349,1,16,'디저트','africa-dessert',1,NULL),(350,1,15,'디저트','middle-east-dessert',1,NULL),(351,1,14,'디저트','southeast-asia-dessert',1,NULL),(352,1,13,'디저트','indian-dessert',1,NULL),(353,1,12,'디저트','japanese-dessert',1,NULL),(354,1,11,'디저트','chinese-dessert',1,NULL),(355,1,10,'디저트','korean-dessert',1,NULL),(356,1,22,'음료','contemporary-fusion-beverage',1,NULL),(357,1,21,'음료','eastern-europe-beverage',1,NULL),(358,1,20,'음료','nordic-beverage',1,NULL),(359,1,19,'음료','south-america-beverage',1,NULL),(360,1,18,'음료','north-america-beverage',1,NULL),(361,1,17,'음료','western-beverage',1,NULL),(362,1,16,'음료','africa-beverage',1,NULL),(363,1,15,'음료','middle-east-beverage',1,NULL),(364,1,14,'음료','southeast-asia-beverage',1,NULL),(365,1,13,'음료','indian-beverage',1,NULL),(366,1,12,'음료','japanese-beverage',1,NULL),(367,1,11,'음료','chinese-beverage',1,NULL),(368,1,10,'음료','korean-beverage',1,NULL),(369,1,22,'밥류','contemporary-fusion-rice-dish',1,NULL),(370,1,21,'밥류','eastern-europe-rice-dish',1,NULL),(371,1,20,'밥류','nordic-rice-dish',1,NULL),(372,1,19,'밥류','south-america-rice-dish',1,NULL),(373,1,18,'밥류','north-america-rice-dish',1,NULL),(374,1,17,'밥류','western-rice-dish',1,NULL),(375,1,16,'밥류','africa-rice-dish',1,NULL),(376,1,15,'밥류','middle-east-rice-dish',1,NULL),(377,1,14,'밥류','southeast-asia-rice-dish',1,NULL),(378,1,13,'밥류','indian-rice-dish',1,NULL),(379,1,12,'밥류','japanese-rice-dish',1,NULL),(380,1,11,'밥류','chinese-rice-dish',1,NULL),(381,1,10,'밥류','korean-rice-dish',1,NULL),(382,1,22,'국물류/스튜류','contemporary-fusion-soup-stew',1,NULL),(383,1,21,'국물류/스튜류','eastern-europe-soup-stew',1,NULL),(384,1,20,'국물류/스튜류','nordic-soup-stew',1,NULL),(385,1,19,'국물류/스튜류','south-america-soup-stew',1,NULL),(386,1,18,'국물류/스튜류','north-america-soup-stew',1,NULL),(387,1,17,'국물류/스튜류','western-soup-stew',1,NULL),(388,1,16,'국물류/스튜류','africa-soup-stew',1,NULL),(389,1,15,'국물류/스튜류','middle-east-soup-stew',1,NULL),(390,1,14,'국물류/스튜류','southeast-asia-soup-stew',1,NULL),(391,1,13,'국물류/스튜류','indian-soup-stew',1,NULL),(392,1,12,'국물류/스튜류','japanese-soup-stew',1,NULL),(393,1,11,'국물류/스튜류','chinese-soup-stew',1,NULL),(394,1,10,'국물류/스튜류','korean-soup-stew',1,NULL),(395,1,22,'면류','contemporary-fusion-noodle',1,NULL),(396,1,21,'면류','eastern-europe-noodle',1,NULL),(397,1,20,'면류','nordic-noodle',1,NULL),(398,1,19,'면류','south-america-noodle',1,NULL),(399,1,18,'면류','north-america-noodle',1,NULL),(400,1,17,'면류','western-noodle',1,NULL),(401,1,16,'면류','africa-noodle',1,NULL),(402,1,15,'면류','middle-east-noodle',1,NULL),(403,1,14,'면류','southeast-asia-noodle',1,NULL),(404,1,13,'면류','indian-noodle',1,NULL),(405,1,12,'면류','japanese-noodle',1,NULL),(406,1,11,'면류','chinese-noodle',1,NULL),(407,1,10,'면류','korean-noodle',1,NULL),(408,1,22,'빵류','contemporary-fusion-bread',1,NULL),(409,1,21,'빵류','eastern-europe-bread',1,NULL),(410,1,20,'빵류','nordic-bread',1,NULL),(411,1,19,'빵류','south-america-bread',1,NULL),(412,1,18,'빵류','north-america-bread',1,NULL),(413,1,17,'빵류','western-bread',1,NULL),(414,1,16,'빵류','africa-bread',1,NULL),(415,1,15,'빵류','middle-east-bread',1,NULL),(416,1,14,'빵류','southeast-asia-bread',1,NULL),(417,1,13,'빵류','indian-bread',1,NULL),(418,1,12,'빵류','japanese-bread',1,NULL),(419,1,11,'빵류','chinese-bread',1,NULL),(420,1,10,'빵류','korean-bread',1,NULL),(421,1,23,'고기','central-asia-meat',1,NULL),(422,1,23,'해산물','central-asia-seafood',1,NULL),(423,1,23,'채소','central-asia-vegetable',1,NULL),(424,1,23,'디저트','central-asia-dessert',1,NULL),(425,1,23,'음료','central-asia-beverage',1,NULL),(426,1,23,'밥류','central-asia-rice-dish',1,NULL),(427,1,23,'국물류/스튜류','central-asia-soup-stew',1,NULL),(428,1,23,'면류','central-asia-noodle',1,NULL),(429,1,23,'빵류','central-asia-bread',1,NULL),(430,1,10,'곱창','korean-gopchang',1,NULL),(431,1,10,'순대','korean-sundae',1,NULL),(432,1,10,'튀김','korean-fried',1,NULL),(434,1,11,'만두','chinese-dumpling',1,NULL),(435,1,13,'커리','indian-curry',1,NULL),(436,1,19,'타코','latin-taco',1,NULL),(437,1,18,'버거','northamerica-burger',1,NULL),(438,1,18,'치킨','northamerica-chicken',1,NULL),(439,1,17,'피자','western-pizza',1,NULL),(700,1,30,'아이스크림','cafe-icecream',1,NULL),(701,1,30,'케이크','cafe-cake',1,NULL),(702,1,30,'커피/차','cafe-coffee-tea',1,NULL),(703,1,30,'과일주스/에이드','cafe-fruitjuice-ade',1,NULL),(704,1,30,'요거트','cafe-yogurt',1,NULL),(705,1,30,'구움과자','cafe-baked',1,NULL),(707,1,30,'베이커리','cafe-bakery',1,NULL),(708,1,30,'젤라또','cafe-gelato',1,NULL),(709,1,30,'도넛','cafe-donut',1,NULL),(710,1,30,'빙수','cafe-bingsu',1,NULL),(711,1,30,'초콜릿/캔디/마카롱','cafe-choco-candy-macaron',1,NULL),(712,1,30,'샌드위치','cafe-sandwich',1,NULL),(713,1,30,'디저트','cafe-dessert',1,NULL);
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit_conversions`
--

DROP TABLE IF EXISTS `unit_conversions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit_conversions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from_unit_id` int NOT NULL,
  `to_unit_id` int NOT NULL,
  `coefficient` float NOT NULL,
  PRIMARY KEY (`id`),
  KEY `from_unit_id` (`from_unit_id`),
  KEY `to_unit_id` (`to_unit_id`),
  CONSTRAINT `unit_conversions_ibfk_1` FOREIGN KEY (`from_unit_id`) REFERENCES `units` (`unit_id`),
  CONSTRAINT `unit_conversions_ibfk_2` FOREIGN KEY (`to_unit_id`) REFERENCES `units` (`unit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_conversions`
--

LOCK TABLES `unit_conversions` WRITE;
/*!40000 ALTER TABLE `unit_conversions` DISABLE KEYS */;
INSERT INTO `unit_conversions` VALUES (1,14,1,1000),(2,5,1,200),(3,3,1,15),(4,4,1,5),(5,15,2,1000);
/*!40000 ALTER TABLE `unit_conversions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `units` (
  `unit_id` int NOT NULL AUTO_INCREMENT,
  `unit_name` varchar(500) NOT NULL,
  `unit_type` varchar(500) NOT NULL,
  PRIMARY KEY (`unit_id`),
  UNIQUE KEY `unit_name` (`unit_name`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `units`
--

LOCK TABLES `units` WRITE;
/*!40000 ALTER TABLE `units` DISABLE KEYS */;
INSERT INTO `units` VALUES (1,'ml','volume'),(2,'g','weight'),(3,'tbsp','volume'),(4,'tsp','volume'),(5,'cup','volume'),(6,'개','count'),(7,'단','count'),(8,'잎','count'),(9,'대','count'),(10,'톨','count'),(11,'쪽','count'),(12,'접','count'),(13,'포기','count'),(14,'L','volume'),(15,'kg','weight'),(16,'뿌리','count'),(17,'꼬집','misc'),(18,'주먹','misc');
/*!40000 ALTER TABLE `units` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userid` varchar(500) NOT NULL,
  `password` varchar(500) NOT NULL,
  `name` varchar(500) DEFAULT NULL,
  `nickname` varchar(500) NOT NULL,
  `is_admin` tinyint(1) NOT NULL,
  `role` varchar(500) NOT NULL,
  `created_at` datetime DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `userid` (`userid`),
  UNIQUE KEY `nickname` (`nickname`),
  KEY `ix_users_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'jwhong','jwhong','홍지우','jwkurry',0,'staff',NULL),(3,'웅엥','$2b$12$hLM9bZqd90iIb1OdIkkxIerBFHDfTr5BS4KV/Ja4sEeAC24g4Gqqe','','string',0,'member',NULL),(4,'jwhong1020','$2b$12$sCa7V27ikmGnP7sPtZz6bOptKszLrBoclclXCytfubzKD22S/16Dq','홍지우','피크민블룸',1,'admin',NULL),(5,'stng','$2b$12$fncnxoD7m8YxxxcAA9wXPuC10tXBNJrPBPULJ7QpXRbb51x4C221G','string','sng',0,'member',NULL),(7,'sssheen3','$2b$12$sb/NfPizNyQg6ZhWpyx3gOsjXua3vV61WUnKAD1kGNhRiIqrg5oLK','신윤희','ㅁㅁ',0,'member',NULL),(9,'test02','$2b$12$PWPbxs5x0R6vnGFu1/bQnu6ZUjh3SgaxNKD5wly9MsuSkfWebpB0G','김회장','회장',1,'staff',NULL),(11,'test03','$2b$12$frS9XvBNCFkVpmu3QblaROpq7sLxyCFlkeFT9KK6mcyfnFNXL/KfO','테스트유저3','테스트유저3',0,'member',NULL),(12,'staff01','$2b$12$hC0zwtYO8Uf9gP6K8/MtzeGIej4K2VtjvI/SsP50Le.0D6lkUOyBC','임원유저1','임원유저1',0,'staff',NULL),(13,'test','$2b$12$/BVRhYot7Bf9kB3JrovvKuGRKjKUNqrVllVsolME.xis2AVELMdrO','asdf','asdf',0,'member','2025-11-14 00:02:04'),(14,'tester','$2b$12$3DxoS7jzo78onI.gupY7we2a/S4wx4fNWS31Nm.FyMW200ASfS4dO','테스터','test',0,'member','2025-11-16 12:48:14'),(15,'andy','$2b$12$hWsVQ3vkEXg7iwplG60OGuPNyqB8RlE6x1k7GgcsR17OTRSq71Thy','andy','andy',0,'member','2025-11-21 12:25:29'),(16,'tester08','$2b$12$607Bu1PmHiZoyxVXc.1O0.vGo/nMjx7/w3ByhaxPfPsIie40/ZK4C','string','slrspdla',0,'member','2025-11-28 08:24:31'),(17,'test06','$2b$12$UpjQz7z1Cs2.6x0tFNPeV.0c4XTsmmH/dS9Ym33NTgNC6Y3yrNa8y','커카이브 테스트','dd',0,'member','2025-12-31 09:11:43'),(18,'testing','$2b$12$5ZToftnU0symRfLJ8Oe89eBC5/0obH8LEI07WlvdOmfJpqbLrqrW.','testing','testing',0,'member','2026-01-01 05:46:04');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'kurchive'
--

--
-- Dumping routines for database 'kurchive'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-04  6:56:31
