-- ADR-0008: the RUT only matters for asientos the 2181 resolves (it declares
-- the detail per RUT). The 1376 declares totals per line code and never
-- reads it, so a line like an IRAE advance payment (13122 against 11111) can
-- carry any value in that column. Whether a line reaches the 2181 depends on
-- the company's plan de cuentas, which a table check cannot see, so the
-- 12-digit rule moves out of the table: the parser validates it on 2181
-- lines and the 2181 engine excludes any resolved line with an invalid RUT.
-- The column stays NOT NULL.
alter table public.asiento drop constraint asiento_rut_check;
