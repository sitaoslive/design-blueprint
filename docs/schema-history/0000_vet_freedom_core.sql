
create type public.app_role as enum ('cliente','cuidador','veterinario','auxiliar','coordinador','recepcion','finanzas','administrador','luis','soporte','consultor');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  phone text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select, insert, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
create or replace function public.has_any_role(_user_id uuid, _roles public.app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = any(_roles))
$$;
create or replace function public.is_staff(_uid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select public.has_any_role(_uid, array['veterinario','auxiliar','coordinador','recepcion','finanzas','administrador','luis']::public.app_role[])
$$;
create or replace function public.is_ops(_uid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select public.has_any_role(_uid, array['coordinador','recepcion','administrador','luis']::public.app_role[])
$$;
create or replace function public.is_director(_uid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select public.has_any_role(_uid, array['administrador','luis']::public.app_role[])
$$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_director(auth.uid()));
create policy "own profile write" on public.profiles for update to authenticated using (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_director(auth.uid()));
create policy "roles grant" on public.user_roles for insert to authenticated with check (public.is_director(auth.uid()));
create policy "roles revoke" on public.user_roles for delete to authenticated using (public.is_director(auth.uid()) and user_id <> auth.uid());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)));
  if not exists (select 1 from public.user_roles) then
    insert into public.user_roles (user_id, role) values (new.id,'luis'),(new.id,'administrador');
  else
    insert into public.user_roles (user_id, role) values (new.id,'cliente');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Operational tables
create table public.staff_members (
  id text primary key default gen_random_uuid()::text,
  user_id uuid,
  name text not null, short text not null, role text not null default 'Veterinario',
  zone text not null, status text not null default 'disponible', next_visit text,
  photo text, skills text[] not null default '{}', load int not null default 0
);
create table public.pets (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid, owner_name text not null default '',
  name text not null, species text not null default 'Perro', breed text not null default '', age text not null default '',
  photo text, allergies text not null default 'Ninguna registrada', created_at timestamptz not null default now()
);
create table public.visits (
  id text primary key default gen_random_uuid()::text,
  pet_id text not null references public.pets(id) on delete cascade,
  staff_id text references public.staff_members(id) on delete set null,
  service text not null, date text not null, time text not null,
  status text not null default 'pendiente', zone text not null default '', address text not null default '',
  step text not null default 'programada', prep text[] not null default '{}', created_at timestamptz not null default now()
);
create table public.service_requests (
  id text primary key default gen_random_uuid()::text,
  client text not null, phone text not null default '', pet text not null default '', channel text not null default 'Portal',
  message text not null, status text not null default 'nueva', at text not null default to_char(now(),'HH24:MI'), created_by uuid
);
create table public.incidents (
  id text primary key default gen_random_uuid()::text,
  title text not null, detail text not null default '', severity text not null default 'media', status text not null default 'abierta', owner text not null default 'Coordinación', created_at timestamptz not null default now()
);
create table public.approvals (
  id text primary key default gen_random_uuid()::text,
  title text not null, detail text not null default '', kind text not null, status text not null default 'pendiente', decided_by uuid, decided_at timestamptz
);
create table public.payments (
  id text primary key default gen_random_uuid()::text,
  client_id uuid, client text not null, concept text not null, amount numeric not null, status text not null default 'pendiente', date text not null default 'Hoy'
);
create table public.tasks (id text primary key default gen_random_uuid()::text, title text not null, done boolean not null default false, staff_id text);
create table public.inventory_items (id text primary key default gen_random_uuid()::text, name text not null, stock int not null default 0, min int not null default 0, lot text not null default '', expires text not null default '');
create table public.courses (id text primary key default gen_random_uuid()::text, title text not null, role text not null default 'Todos', progress int not null default 0, required boolean not null default false, reviewed text not null default '');
create table public.specialists (id text primary key default gen_random_uuid()::text, name text not null, specialty text not null, city text not null default '');
create table public.referrals (id text primary key default gen_random_uuid()::text, pet_id text references public.pets(id) on delete cascade, pet text not null, specialty text not null, status text not null default 'por_resolver', specialist text);
create table public.treatments (id text primary key default gen_random_uuid()::text, pet text not null, plan text not null, frequency text not null, responsible text not null, done int not null default 0, total int not null default 1);
create table public.notifications (id text primary key default gen_random_uuid()::text, user_id uuid, title text not null, body text not null default '', read boolean not null default false, created_at timestamptz not null default now());
create table public.audit_log (id uuid primary key default gen_random_uuid(), actor uuid, action text not null, entity text, entity_id text, created_at timestamptz not null default now());
create table public.absence_plans (id uuid primary key default gen_random_uuid(), coordinator text not null, replacements text[] not null, limits text not null default '', date_from date not null, date_to date not null, active boolean not null default true, created_by uuid, created_at timestamptz not null default now());
create table public.assistant_messages (id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid(), sender text not null, text text not null, proposal jsonb, created_at timestamptz not null default now());
create table public.integrations (id text primary key, name text not null, purpose text not null, status text not null default 'NO CONFIGURADA', note text not null default '');

grant select, insert, update, delete on public.staff_members, public.pets, public.visits, public.service_requests, public.incidents, public.approvals, public.payments, public.tasks, public.inventory_items, public.courses, public.specialists, public.referrals, public.treatments, public.notifications, public.audit_log, public.absence_plans, public.assistant_messages, public.integrations to authenticated;
grant all on public.staff_members, public.pets, public.visits, public.service_requests, public.incidents, public.approvals, public.payments, public.tasks, public.inventory_items, public.courses, public.specialists, public.referrals, public.treatments, public.notifications, public.audit_log, public.absence_plans, public.assistant_messages, public.integrations to service_role;

alter table public.staff_members enable row level security;
alter table public.pets enable row level security;
alter table public.visits enable row level security;
alter table public.service_requests enable row level security;
alter table public.incidents enable row level security;
alter table public.approvals enable row level security;
alter table public.payments enable row level security;
alter table public.tasks enable row level security;
alter table public.inventory_items enable row level security;
alter table public.courses enable row level security;
alter table public.specialists enable row level security;
alter table public.referrals enable row level security;
alter table public.treatments enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;
alter table public.absence_plans enable row level security;
alter table public.assistant_messages enable row level security;
alter table public.integrations enable row level security;

create or replace function public.owns_pet(_pet text) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.pets where id = _pet and owner_id = auth.uid())
$$;

create policy "staff read" on public.staff_members for select to authenticated using (true);
create policy "ops write" on public.staff_members for all to authenticated using (public.is_ops(auth.uid())) with check (public.is_ops(auth.uid()));

create policy "pets read" on public.pets for select to authenticated using (public.is_staff(auth.uid()) or owner_id = auth.uid());
create policy "pets insert" on public.pets for insert to authenticated with check (public.is_staff(auth.uid()) or owner_id = auth.uid());
create policy "pets update" on public.pets for update to authenticated using (public.is_staff(auth.uid()) or owner_id = auth.uid());

create policy "visits read" on public.visits for select to authenticated using (public.is_staff(auth.uid()) or public.owns_pet(pet_id));
create policy "visits insert" on public.visits for insert to authenticated with check (public.is_staff(auth.uid()) or (public.owns_pet(pet_id) and status = 'pendiente' and staff_id is null));
create policy "visits update" on public.visits for update to authenticated using (public.is_staff(auth.uid()) or public.owns_pet(pet_id));

create or replace function public.guard_client_visit() returns trigger language plpgsql set search_path = public as $$
begin
  if not public.is_staff(auth.uid()) then
    if new.status not in ('pendiente','cancelada') or new.staff_id is distinct from old.staff_id or new.step <> old.step then
      raise exception 'Solo el equipo puede confirmar o asignar citas';
    end if;
  end if;
  return new;
end $$;
create trigger visits_client_guard before update on public.visits for each row execute function public.guard_client_visit();

create policy "req staff" on public.service_requests for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "req client insert" on public.service_requests for insert to authenticated with check (created_by = auth.uid());
create policy "inc staff" on public.incidents for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "appr read" on public.approvals for select to authenticated using (public.is_staff(auth.uid()));
create policy "appr insert" on public.approvals for insert to authenticated with check (public.is_staff(auth.uid()));
create policy "appr decide" on public.approvals for update to authenticated using (public.is_director(auth.uid()));
create policy "pay read" on public.payments for select to authenticated using (public.has_any_role(auth.uid(), array['finanzas','administrador','luis','coordinador']::public.app_role[]) or client_id = auth.uid());
create policy "pay update" on public.payments for update to authenticated using (public.has_any_role(auth.uid(), array['finanzas','administrador','luis']::public.app_role[]) or client_id = auth.uid());
create policy "pay insert" on public.payments for insert to authenticated with check (public.has_any_role(auth.uid(), array['finanzas','administrador','luis']::public.app_role[]));
create policy "tasks staff" on public.tasks for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "inv staff" on public.inventory_items for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "courses staff" on public.courses for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "spec read" on public.specialists for select to authenticated using (true);
create policy "spec write" on public.specialists for all to authenticated using (public.is_ops(auth.uid())) with check (public.is_ops(auth.uid()));
create policy "ref read" on public.referrals for select to authenticated using (public.is_staff(auth.uid()) or public.owns_pet(pet_id));
create policy "ref write" on public.referrals for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "treat staff" on public.treatments for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "notif read" on public.notifications for select to authenticated using (user_id = auth.uid() or (user_id is null and public.is_staff(auth.uid())));
create policy "notif update" on public.notifications for update to authenticated using (user_id = auth.uid() or (user_id is null and public.is_staff(auth.uid())));
create policy "notif insert" on public.notifications for insert to authenticated with check (public.is_staff(auth.uid()));
create policy "audit read" on public.audit_log for select to authenticated using (public.has_any_role(auth.uid(), array['administrador','luis','soporte']::public.app_role[]));
create policy "audit insert" on public.audit_log for insert to authenticated with check (actor = auth.uid());
create policy "absence director" on public.absence_plans for all to authenticated using (public.is_director(auth.uid())) with check (public.is_director(auth.uid()));
create policy "absence staff read" on public.absence_plans for select to authenticated using (public.is_staff(auth.uid()));
create policy "chat own" on public.assistant_messages for all to authenticated using (user_id = auth.uid() and public.is_director(auth.uid())) with check (user_id = auth.uid() and public.is_director(auth.uid()));
create policy "integ read" on public.integrations for select to authenticated using (public.is_staff(auth.uid()));
create policy "integ write" on public.integrations for update to authenticated using (public.is_director(auth.uid()));

-- Audit triggers
create or replace function public.audit_change() returns trigger language plpgsql security definer set search_path = public as $$
declare d text;
begin
  if tg_op = 'INSERT' then d := 'Creado';
  elsif tg_table_name = 'visits' then d := 'Cita → ' || new.status || ' / ' || new.step;
  elsif new ? 'status' then d := 'Estado → ' || (to_jsonb(new)->>'status');
  else d := 'Actualizado'; end if;
  insert into public.audit_log(actor, action, entity, entity_id) values (auth.uid(), tg_table_name || ': ' || d, tg_table_name, (to_jsonb(new)->>'id'));
  return new;
end $$;
-- jsonb ? operator needs jsonb; fix with safe version
create or replace function public.audit_change() returns trigger language plpgsql security definer set search_path = public as $$
declare j jsonb := to_jsonb(new); d text;
begin
  if tg_op = 'INSERT' then d := 'creado';
  elsif j ? 'status' then d := coalesce(j->>'status','') || coalesce(' · ' || (j->>'step'), '');
  else d := 'actualizado'; end if;
  insert into public.audit_log(actor, action, entity, entity_id) values (auth.uid(), tg_table_name || ': ' || d, tg_table_name, j->>'id');
  return new;
end $$;
do $$ declare t text; begin
  foreach t in array array['visits','service_requests','incidents','approvals','payments','staff_members','referrals','absence_plans','user_roles'] loop
    execute format('create trigger audit_%1$s after insert or update on public.%1$s for each row execute function public.audit_change()', t);
  end loop;
end $$;

-- Seed demo data
insert into public.staff_members (id,name,short,role,zone,status,next_visit,photo,skills,load) values
 ('valeria','Dra. Valeria Torres','Dra. Valeria','Veterinario','Zona Norte','disponible','10:00','valeria','{Medicina preventiva,Vacunación,Felinos}',70),
 ('martin','Dr. Martín Rojas','Dr. Rojas','Veterinario','Zona Centro','en_ruta','12:30','martin','{Medicina interna,Curaciones}',85),
 ('sofia','Dra. Sofía Méndez','Dra. Sofía','Veterinario','Zona Sur','ausente',null,'sofia','{Geriatría,Tratamientos recurrentes}',0);
insert into public.pets (id,owner_name,name,species,breed,age,photo,allergies) values
 ('luna','Familia Gómez','Luna','Perro','Golden Retriever','4 años','dog','Ninguna registrada'),
 ('bruno','Familia Gómez','Bruno','Gato','Atigrado doméstico','2 años','cat','Pollo');
insert into public.visits (id,pet_id,staff_id,service,date,time,status,zone,address,prep) values
 ('v1','luna','valeria','Control preventivo','Mar, 28 de enero','09:00','confirmada','Zona Norte','Cra 15 #93-40, Bogotá','{Kit preventivo,Báscula portátil}'),
 ('v2','bruno','martin','Vacunación','Mar, 28 de enero','10:30','confirmada','Zona Centro','Cl 45 #13-20, Bogotá','{Vacuna triple felina,Cadena de frío}'),
 ('v3','luna',null,'Reasignación pendiente','Mar, 28 de enero','12:30','pendiente','Zona Sur','Cl 9 Sur #24-11, Bogotá','{}'),
 ('v4','bruno','valeria','Control recurrente','Mar, 28 de enero','15:00','revision','Zona Norte','Cra 15 #93-40, Bogotá','{Plan recurrente aprobado}'),
 ('v5','luna','valeria','Control preventivo','Mar, 28 de enero','10:00','confirmada','Zona Norte','Cra 15 #93-40, Bogotá','{Kit preventivo}'),
 ('v6','bruno','martin','Vacunación','Jue, 30 de enero','15:30','pendiente','Zona Centro','Cl 45 #13-20, Bogotá','{Vacuna triple felina}');
insert into public.service_requests (id,client,phone,pet,channel,message,at) values
 ('r1','Andrea Gómez','300 555 1201','Luna','WhatsApp','¿Pueden venir mañana a vacunar?','08:12'),
 ('r2','Carlos Pérez','310 555 8844','Toby','Llamada','Mi perro no quiere comer desde ayer.','08:40'),
 ('r3','Marta Ruiz','315 555 0021','Mia','WhatsApp','Necesito reprogramar la cita del jueves.','09:02'),
 ('r4','Jorge Díaz','320 555 7732','Rocky','Portal','Solicito control geriátrico.','09:15'),
 ('r5','Lucía Herrera','301 555 4410','Nala','WhatsApp','¿Tienen cupo para esterilización?','09:30'),
 ('r6','Pedro Castro','312 555 9090','Max','Llamada','Quiero cotizar paquete de vacunas.','09:48');
insert into public.incidents (id,title,detail,severity) values
 ('i1','Visita con retraso','Luna · Hoy, 10:00 · +20 min','media'),('i2','Tráfico en Av. Boyacá','Ruta Norte afectada','baja');
insert into public.approvals (id,title,detail,kind) values
 ('a1','Aprobar reorganización','Mover visita de 12:30 a Dra. Valeria por ausencia de Dra. Sofía.','reorganizacion'),
 ('a2','Cobro alto pendiente','Cirugía menor · Familia Ruiz · $ 1.850.000 COP','cobro'),
 ('a3','Solicitud de reemplazo','Dra. Torres · 28 de enero, turno tarde','reemplazo');
insert into public.payments (id,client,concept,amount,status,date) values
 ('p1','Familia Gómez','Control preventivo · Luna',180000,'pagado','Hoy'),('p2','Familia Ruiz','Cirugía menor · Mia',1850000,'pendiente','Hoy'),
 ('p3','Familia Díaz','Vacunación · Rocky',150000,'pagado','Hoy'),('p4','Familia Castro','Consulta general · Max',220000,'vencido','15 ene');
insert into public.tasks (id,title,done,staff_id) values ('t1','Revisar kit de vacunas',false,'valeria'),('t2','Confirmar dirección de Luna',true,'valeria'),('t3','Cierre de jornada',false,'valeria');
insert into public.inventory_items (id,name,stock,min,lot,expires) values ('in1','Vacuna triple felina',4,5,'TF-2291','2026-03-10'),('in2','Jeringas 3 ml',120,50,'J3-110','2028-01-01'),('in3','Gasas estériles',35,40,'GS-778','2027-06-01');
insert into public.courses (id,title,role,progress,required,reviewed) values ('c1','Protocolo de visita domiciliaria','Veterinario',100,true,'Ene 2026'),('c2','Bioseguridad y manejo de residuos','Todos',60,true,'Dic 2025'),('c3','Comunicación empática en duelo','Todos',0,false,'Nov 2025');
insert into public.specialists (id,name,specialty,city) values ('s1','Dr. Andrés Vela','Cardiología','Bogotá'),('s2','Dra. Paula Ríos','Dermatología','Bogotá'),('s3','Dr. Felipe Mora','Oftalmología','Chía');
insert into public.referrals (id,pet_id,pet,specialty,status,specialist) values ('rf1','luna','Luna','Dermatología','por_resolver',null),('rf2','bruno','Bruno','Cardiología','agendada','Dr. Andrés Vela');
insert into public.treatments (id,pet,plan,frequency,responsible,done,total) values ('tr1','Bruno','Control renal','Cada 15 días','Dra. Valeria Torres',3,8),('tr2','Luna','Fisioterapia articular','Semanal','Dr. Martín Rojas',5,12);
insert into public.notifications (id,title,body,read) values ('n1','Cita confirmada','Luna · Mar 28 de enero, 10:00',false),('n2','Recordatorio de vacuna','Bruno tiene vacunación el jueves',false),('n3','Pago recibido','$ 180.000 COP · Control preventivo',true);
insert into public.integrations (id,name,purpose,status,note) values
 ('cloud','Lovable Cloud','Base de datos, usuarios y permisos','CONECTADA','Activa con datos de ejemplo'),
 ('okvet','OKVET','Sistema clínico oficial','NO CONFIGURADA','Esperando credenciales y documentación técnica'),
 ('whatsapp','WhatsApp Business Platform','Canal principal con clientes','NO CONFIGURADA','Esperando cuenta oficial'),
 ('n8n','n8n (WF-001…WF-112)','Automatizaciones','PREPARADA','Comportamiento documentado, sin implementar'),
 ('gcal','Google Calendar','Agenda del equipo','NO CONFIGURADA',''),
 ('gmaps','Google Maps','Navegación del profesional','PREPARADA','Enlaces externos'),
 ('waze','Waze','Navegación del profesional','PREPARADA','Enlaces externos'),
 ('ai','Proveedor de IA','Asistente privada de Dirección','PREPARADA','Respuestas de demostración'),
 ('email','Correo','Avisos y recuperación de contraseña','EN PRUEBAS','Correos de acceso de Lovable Cloud'),
 ('pagos','Pasarela de pago','Cobro en línea','NO CONFIGURADA','Proveedor por definir'),
 ('github','GitHub','Respaldo del código','PREPARADA',''),
 ('monitor','Monitoreo y respaldos','Salud del sistema','NO CONFIGURADA','');
