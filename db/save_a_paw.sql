-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-08-2024 a las 05:59:13
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `save_a_paw`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administradores`
--

CREATE TABLE `administradores` (
  `id_admin` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contraseña` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `administradores`
--

INSERT INTO `administradores` (`id_admin`, `nombre`, `apellido`, `correo`, `contraseña`) VALUES
(1, 'Armando', 'Gonzalez', 'admin@gmail.com', '12345');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria_usuarios`
--

CREATE TABLE `auditoria_usuarios` (
  `id_auditoria` int(11) NOT NULL,
  `id_admin` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `accion` varchar(255) NOT NULL,
  `fecha_accion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicaciones`
--

CREATE TABLE `publicaciones` (
  `id_publicacion` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `imagen` varchar(255) NOT NULL,
  `fecha_publicacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('pendiente','aprobada','rechazada') DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `publicaciones`
--

INSERT INTO `publicaciones` (`id_publicacion`, `id_user`, `titulo`, `descripcion`, `imagen`, `fecha_publicacion`, `estado`) VALUES
(19, 7, 'Gato de 3 meses busca hogar', 'Adopta a Max, un elegante gato blanco de 3 meses. Es cariñoso y juguetón. Si estás interesado, llama al 555-123-4567.', '/uploads/1723208545592.jpg', '2024-08-09 13:02:25', 'aprobada'),
(20, 7, 'Husky en adopcion', 'Comunicate a este correo: sdsdhs', '/uploads/1723563074178.jpg', '2024-08-13 15:31:14', 'aprobada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `revision_publicaciones`
--

CREATE TABLE `revision_publicaciones` (
  `id_revision` int(11) NOT NULL,
  `id_publicacion` int(11) NOT NULL,
  `id_admin` int(11) NOT NULL,
  `estado` enum('aprobada','rechazada') NOT NULL,
  `fecha_revision` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `revision_publicaciones`
--

INSERT INTO `revision_publicaciones` (`id_revision`, `id_publicacion`, `id_admin`, `estado`, `fecha_revision`) VALUES
(8, 19, 1, 'aprobada', '2024-08-09 13:02:54'),
(9, 20, 1, 'aprobada', '2024-08-13 15:32:41');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_user` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contraseña` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_user`, `nombre`, `apellido`, `correo`, `contraseña`) VALUES
(7, 'Armando', 'González', 'armando@gmail.com', '12345');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administradores`
--
ALTER TABLE `administradores`
  ADD PRIMARY KEY (`id_admin`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- Indices de la tabla `auditoria_usuarios`
--
ALTER TABLE `auditoria_usuarios`
  ADD PRIMARY KEY (`id_auditoria`),
  ADD KEY `id_admin` (`id_admin`),
  ADD KEY `id_user` (`id_user`);

--
-- Indices de la tabla `publicaciones`
--
ALTER TABLE `publicaciones`
  ADD PRIMARY KEY (`id_publicacion`),
  ADD KEY `id_user` (`id_user`);

--
-- Indices de la tabla `revision_publicaciones`
--
ALTER TABLE `revision_publicaciones`
  ADD PRIMARY KEY (`id_revision`),
  ADD KEY `id_publicacion` (`id_publicacion`),
  ADD KEY `id_admin` (`id_admin`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administradores`
--
ALTER TABLE `administradores`
  MODIFY `id_admin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `auditoria_usuarios`
--
ALTER TABLE `auditoria_usuarios`
  MODIFY `id_auditoria` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `publicaciones`
--
ALTER TABLE `publicaciones`
  MODIFY `id_publicacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `revision_publicaciones`
--
ALTER TABLE `revision_publicaciones`
  MODIFY `id_revision` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `auditoria_usuarios`
--
ALTER TABLE `auditoria_usuarios`
  ADD CONSTRAINT `auditoria_usuarios_ibfk_1` FOREIGN KEY (`id_admin`) REFERENCES `administradores` (`id_admin`),
  ADD CONSTRAINT `auditoria_usuarios_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `usuarios` (`id_user`);

--
-- Filtros para la tabla `publicaciones`
--
ALTER TABLE `publicaciones`
  ADD CONSTRAINT `publicaciones_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `usuarios` (`id_user`);

--
-- Filtros para la tabla `revision_publicaciones`
--
ALTER TABLE `revision_publicaciones`
  ADD CONSTRAINT `revision_publicaciones_ibfk_1` FOREIGN KEY (`id_publicacion`) REFERENCES `publicaciones` (`id_publicacion`),
  ADD CONSTRAINT `revision_publicaciones_ibfk_2` FOREIGN KEY (`id_admin`) REFERENCES `administradores` (`id_admin`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
