const { createClient } = require('@supabase/supabase-js');

// Configurações
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://hxavvgniunzcbzjtluxk.supabase.co';
// A chave 'anon' pública não tem permissão para criar usuários diretamente sem verificação.
// Por isso, você precisará da chave 'service_role' (secreta) do seu painel do Supabase.
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
  console.error('\n❌ Erro: Chave secreta SUPABASE_SERVICE_ROLE_KEY não fornecida.');
  console.log('\nComo rodar este script:');
  console.log('1. Obtenha a chave "service_role" em seu painel do Supabase (Settings -> API -> service_role secret).');
  console.log('2. Execute o comando no terminal substituindo pela sua chave:');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=sua_chave_secreta_aqui node supabase/scripts/create_admin.js\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  const email = 'lazaro.bamboleadmin@gmail.com';
  const password = '11223344!'; // <-- ALTERE PARA A SENHA QUE DESEJAR AQUI
  const fullName = 'Lázaro Admin';

  console.log(`\n1. Criando usuário no Supabase Auth (${email})...`);

  // Cria o usuário usando a API de Admin do Supabase (cria em auth.users)
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      full_name: fullName
    }
  });

  if (error) {
    console.error('❌ Erro da API de Auth do Supabase:', error.message);
    process.exit(1);
  }

  const userId = data.user.id;
  console.log('✅ Usuário criado com sucesso no Supabase Auth!');
  console.log(`   ID do Usuário: ${userId}`);

  console.log('\n2. Sincronizando com a tabela pública "public.users"...');

  // Faz um upsert na tabela pública public.users para garantir que o perfil apareça
  const { error: dbError } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email: email,
      role: 'admin',
      full_name: fullName
    }, { onConflict: 'id' });

  if (dbError) {
    console.error('❌ Erro ao inserir na tabela public.users:', dbError.message);
    process.exit(1);
  }

  console.log('✅ Perfil de administrador sincronizado com sucesso na tabela public.users!');
  console.log('\n🎉 Processo concluído com sucesso!');
}

createAdmin();
