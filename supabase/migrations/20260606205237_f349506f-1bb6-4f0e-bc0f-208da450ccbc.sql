
REVOKE EXECUTE ON FUNCTION public.handle_first_user_admin() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, PUBLIC;
