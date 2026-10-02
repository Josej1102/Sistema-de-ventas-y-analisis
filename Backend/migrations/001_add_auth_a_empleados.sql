-- =====================================================================
-- MIGRACIÓN: agrega autenticación (password) y rol a empleados
-- Corre esto UNA VEZ sobre tu base de datos ya existente (en TablePlus).
-- =====================================================================

ALTER TABLE empleados
    ADD COLUMN password_hash VARCHAR(255),
    ADD COLUMN rol VARCHAR(20) NOT NULL DEFAULT 'empleado';

ALTER TABLE empleados
    ADD CONSTRAINT chk_rol CHECK (rol IN ('empleado', 'admin'));

-- Nota: password_hash queda nullable a propósito. Los empleados que ya
-- tenías insertados (si los hay) no tienen contraseña todavía; usa el
-- script scripts/crearAdmin.js para crear tu primer usuario admin con
-- contraseña, o para asignarle una a un empleado existente.
