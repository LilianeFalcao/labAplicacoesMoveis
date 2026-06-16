-- Script para criar ou promover o usuário Lázaro a administrador
-- Execute este script no editor SQL do Supabase (SQL Editor no Dashboard do Supabase)

-- 1. Habilita a extensão pgcrypto se ainda não estiver habilitada (necessária para criptografia de senha)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
  user_email TEXT := 'lazaro.bamboleadmin@gmail.com';
  user_password TEXT := 'MudeMinhaSenha123!'; -- <-- SUBISTITUA POR UMA SENHA SEGURA AQUI
  user_name TEXT := 'Lázaro Admin';
BEGIN
  -- Verifica se o usuário já existe na tabela de autenticação
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    -- 1. Se já existe, atualiza a metadata em auth.users para definir a role como admin
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin', 'full_name', user_name)
    WHERE email = user_email;
    
    -- 2. Atualiza o perfil público para admin
    UPDATE public.users
    SET role = 'admin', full_name = user_name
    WHERE email = user_email;
    
    RAISE NOTICE 'Usuário % existente promovido para Admin com sucesso!', user_email;
  ELSE
    -- Se não existe, cria o usuário na tabela de autenticação do Supabase (auth.users)
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      confirmation_token,
      is_super_admin
    )
    VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      user_email,
      crypt(user_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('role', 'admin', 'full_name', user_name),
      now(),
      now(),
      'authenticated',
      '',
      false
    );

    -- Nota: A trigger "on_auth_user_created" inserirá automaticamente 
    -- o usuário na tabela public.users com a role 'admin' e o full_name.
    RAISE NOTICE 'Novo usuário Admin % criado com sucesso!', user_email;
  END IF;
END $$;
