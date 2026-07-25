REVOKE EXECUTE ON FUNCTION public.earn_points(uuid, uuid, integer, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.redeem_points(uuid, integer, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_user_wallet(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_wallet_balance(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_profile_wallet() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.earn_points(uuid, uuid, integer, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.redeem_points(uuid, integer, text, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.ensure_user_wallet(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_wallet_balance(uuid) TO service_role;
