-- Enable realtime for plan_members and join_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.plan_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.join_requests;