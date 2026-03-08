
ALTER TABLE public.groups ADD COLUMN plan_id uuid REFERENCES public.plans(id) ON DELETE CASCADE DEFAULT NULL;

CREATE UNIQUE INDEX groups_plan_id_unique ON public.groups(plan_id) WHERE plan_id IS NOT NULL;
