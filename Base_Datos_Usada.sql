-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`Rol`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Rol` (
  `idRol` INT NOT NULL AUTO_INCREMENT,
  `nombreRol` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`idRol`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Usuario` (
  `idUsuario` INT NOT NULL AUTO_INCREMENT,
  `idRol` INT NOT NULL,
  `correoUsuario` VARCHAR(45) NOT NULL,
  `contraseñaUsuario` VARCHAR(255) NOT NULL,
  `fechaCreacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaModificacion` DATETIME NULL,
  PRIMARY KEY (`idUsuario`),
  INDEX `fk_Usuario_Rol1_idx` (`idRol` ASC) VISIBLE,
  UNIQUE INDEX `correoUsuario_UNIQUE` (`correoUsuario` ASC) VISIBLE,
  CONSTRAINT `fk_Usuario_Rol1`
    FOREIGN KEY (`idRol`)
    REFERENCES `mydb`.`Rol` (`idRol`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Token`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Token` (
  `idToken` INT NOT NULL AUTO_INCREMENT,
  `token` LONGTEXT NOT NULL,
  `idUsuario` INT NOT NULL,
  `estadoActivo` TINYINT(1) DEFAULT 1,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idToken`),
  INDEX `idx_idUsuario` (`idUsuario` ASC) VISIBLE,
  INDEX `idx_estadoActivo` (`estadoActivo` ASC) VISIBLE,
  CONSTRAINT `fk_Token_Usuario`
    FOREIGN KEY (`idUsuario`)
    REFERENCES `mydb`.`Usuario` (`idUsuario`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Cliente`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Cliente` (
  `idCliente` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombreCliente` VARCHAR(100) NOT NULL,
  `telefonoCliente` VARCHAR(30) NOT NULL,
  `activoCliente` TINYINT(1) NOT NULL DEFAULT 1,
  `idUsuario` INT NOT NULL,
  PRIMARY KEY (`idCliente`),
  UNIQUE INDEX `telefono_UNIQUE` (`telefonoCliente` ASC) VISIBLE,
  INDEX `fk_Cliente_Usuario1_idx` (`idUsuario` ASC) VISIBLE,
  UNIQUE INDEX `idUsuario_UNIQUE` (`idUsuario` ASC) VISIBLE,
  CONSTRAINT `fk_Cliente_Usuario1`
    FOREIGN KEY (`idUsuario`)
    REFERENCES `mydb`.`Usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Barbero`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Barbero` (
  `idBarbero` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `idUsuario` INT NOT NULL,
  `nombreBarbero` VARCHAR(100) NOT NULL,
  `telefonoBarbero` VARCHAR(30) NOT NULL,
  `activoBarbero` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`idBarbero`),
  UNIQUE INDEX `telefono_UNIQUE` (`telefonoBarbero` ASC) VISIBLE,
  INDEX `fk_Barbero_Usuario1_idx` (`idUsuario` ASC) VISIBLE,
  CONSTRAINT `fk_Barbero_Usuario1`
    FOREIGN KEY (`idUsuario`)
    REFERENCES `mydb`.`Usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Reserva`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Reserva` (
  `idReserva` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `idCliente` INT UNSIGNED NOT NULL,
  `idBarbero` INT UNSIGNED NOT NULL,
  `fechaReserva` DATETIME NOT NULL,
  `detalleReserva` VARCHAR(400) NOT NULL,
  `estadoReserva` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`idReserva`),
  INDEX `fk_Reserva_Cliente_idx` (`idCliente` ASC) VISIBLE,
  INDEX `fk_Reserva_Barbero1_idx` (`idBarbero` ASC) VISIBLE,
  UNIQUE INDEX `idReserva_UNIQUE` (`idReserva` ASC) VISIBLE,
  CONSTRAINT `fk_Reserva_Cliente`
    FOREIGN KEY (`idCliente`)
    REFERENCES `mydb`.`Cliente` (`idCliente`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Reserva_Barbero1`
    FOREIGN KEY (`idBarbero`)
    REFERENCES `mydb`.`Barbero` (`idBarbero`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`CancelacionReserva`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`CancelacionReserva` (
  `idCancelacionReserva` INT NOT NULL AUTO_INCREMENT,
  `idReserva` INT UNSIGNED NOT NULL,
  `motivo` VARCHAR(150) NULL,
  `fechaCancelacion` DATETIME NOT NULL,
  PRIMARY KEY (`idCancelacionReserva`),
  INDEX `fk_CancelacionReserva_Reserva1_idx` (`idReserva` ASC) VISIBLE,
  UNIQUE INDEX `idReserva_UNIQUE` (`idReserva` ASC) VISIBLE,
  CONSTRAINT `fk_CancelacionReserva_Reserva1`
    FOREIGN KEY (`idReserva`)
    REFERENCES `mydb`.`Reserva` (`idReserva`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Servicio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Servicio` (
  `idServicio` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombreServicio` VARCHAR(45) NOT NULL,
  `duracion` TINYINT UNSIGNED NOT NULL,
  `costo` DECIMAL(10,2) UNSIGNED NOT NULL,
  `puntuacion` DECIMAL(3,2) NULL,
  PRIMARY KEY (`idServicio`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Reserva_Servicio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Reserva_Servicio` (
  `idReserva` INT UNSIGNED NOT NULL,
  `idServicio` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`idReserva`, `idServicio`),
  INDEX `fk_Reserva_has_Servicio_Servicio1_idx` (`idServicio` ASC) VISIBLE,
  INDEX `fk_Reserva_has_Servicio_Reserva1_idx` (`idReserva` ASC) VISIBLE,
  CONSTRAINT `fk_Reserva_has_Servicio_Reserva1`
    FOREIGN KEY (`idReserva`)
    REFERENCES `mydb`.`Reserva` (`idReserva`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Reserva_has_Servicio_Servicio1`
    FOREIGN KEY (`idServicio`)
    REFERENCES `mydb`.`Servicio` (`idServicio`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Barbero_Horario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Barbero_Horario` (
  `idBarbero_Horario` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `idBarbero` INT UNSIGNED NOT NULL,
  `diaSemana` TINYINT NULL,
  `fechaEspecifica` DATE NULL,
  `horaInicio` TIME NULL,
  `horaFin` TIME NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`idBarbero_Horario`),
  INDEX `fk_Barbero_Horario_Barbero1_idx` (`idBarbero` ASC) INVISIBLE,
  UNIQUE INDEX `ux_barbero_diaSemana` (`idBarbero` ASC, `diaSemana` ASC) VISIBLE,
  UNIQUE INDEX `ux_barbero_fecha` (`idBarbero` ASC, `fechaEspecifica` ASC) VISIBLE,
  CONSTRAINT `fk_Barbero_Horario_Barbero1`
    FOREIGN KEY (`idBarbero`)
    REFERENCES `mydb`.`Barbero` (`idBarbero`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`Barbero_Servicio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`Barbero_Servicio` (
  `idBarbero` INT UNSIGNED NOT NULL,
  `idServicio` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`idBarbero`, `idServicio`),
  INDEX `fk_Barbero_has_Servicio_Servicio1_idx` (`idServicio` ASC) VISIBLE,
  INDEX `fk_Barbero_has_Servicio_Barbero1_idx` (`idBarbero` ASC) VISIBLE,
  CONSTRAINT `fk_Barbero_has_Servicio_Barbero1`
    FOREIGN KEY (`idBarbero`)
    REFERENCES `mydb`.`Barbero` (`idBarbero`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Barbero_has_Servicio_Servicio1`
    FOREIGN KEY (`idServicio`)
    REFERENCES `mydb`.`Servicio` (`idServicio`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`intentosVerificacion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mydb`.`intentosVerificacion` (
  `idIntentosVerificacion` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `idUsuario` INT NOT NULL,
  `exitoso` TINYINT(1) NOT NULL DEFAULT 0,
  `bloqueado` TINYINT(1) NOT NULL DEFAULT 0,
  `fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idIntentosVerificacion`),
  INDEX `idx_cliente_exitoso_fecha` (`exitoso` ASC, `fecha` ASC) VISIBLE,
  INDEX `idx_fecha` (`fecha` ASC) VISIBLE,
  INDEX `fk_intentosVerificacion_Usuario1_idx` (`idUsuario` ASC) VISIBLE,
  CONSTRAINT `fk_intentosVerificacion_Usuario1`
    FOREIGN KEY (`idUsuario`)
    REFERENCES `mydb`.`Usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
