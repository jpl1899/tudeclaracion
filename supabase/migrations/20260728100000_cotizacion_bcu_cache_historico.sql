-- El motor ahora resuelve la cotización de las líneas en dólares contra el
-- día hábil anterior al del asiento (confirmado 2026-07-28) cuando el TXT
-- no trae el dato en la columna Cotización -- ya no alcanza con guardar un
-- único valor "más reciente" por moneda, hace falta un histórico por fecha.
alter table public.cotizacion_bcu_cache drop constraint cotizacion_bcu_cache_pkey;
alter table public.cotizacion_bcu_cache add primary key (moneda_codigo, fecha);
