-- Align the only security definer function with the rest of the RPCs:
-- an empty search_path so no object can be resolved through a schema the
-- caller controls. The body already uses fully qualified names.
alter function public.handle_new_user() set search_path = '';
