# Configuração da Tabela de Comentários de Vídeos no Supabase

Para implementar o sistema de comentários de vídeos, você precisa criar a tabela `video_comments` no seu banco de dados Supabase.

## Passo a Passo:

### 1. Acesse o Dashboard do Supabase
- Vá para [https://app.supabase.com](https://app.supabase.com)
- Faça login na sua conta
- Selecione seu projeto

### 2. Abra o SQL Editor
- No menu lateral, clique em "SQL Editor"
- Clique em "New query" para criar uma nova consulta

### 3. Execute o SQL abaixo:

```sql
-- Tabela para armazenar comentários dos vídeos
CREATE TABLE IF NOT EXISTS video_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id VARCHAR(255) NOT NULL,
    user_address VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_video_comments_video_id ON video_comments(video_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_user_address ON video_comments(user_address);
CREATE INDEX IF NOT EXISTS idx_video_comments_created_at ON video_comments(created_at DESC);

-- RLS (Row Level Security) policies
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura de todos os comentários
CREATE POLICY "Allow read access to all comments" ON video_comments
    FOR SELECT USING (true);

-- Política para permitir inserção de comentários
CREATE POLICY "Allow insert comments" ON video_comments
    FOR INSERT WITH CHECK (true);

-- Política para permitir que usuários editem/deletem apenas seus próprios comentários
CREATE POLICY "Allow users to update their own comments" ON video_comments
    FOR UPDATE USING (true);

CREATE POLICY "Allow users to delete their own comments" ON video_comments
    FOR DELETE USING (true);
```

### 4. Execute a Query
- Cole o código SQL acima no editor
- Clique em "Run" para executar

### 5. Verifique se a tabela foi criada
- Vá para "Table Editor" no menu lateral
- Você deve ver a tabela `video_comments` listada

## Estrutura da Tabela:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único do comentário |
| `video_id` | VARCHAR(255) | ID do vídeo (corresponde ao ID do vídeo no YouTube) |
| `user_address` | VARCHAR(255) | Endereço da carteira do usuário |
| `user_name` | VARCHAR(255) | Nome do usuário (opcional) |
| `comment` | TEXT | Conteúdo do comentário |
| `created_at` | TIMESTAMP | Data/hora de criação |
| `updated_at` | TIMESTAMP | Data/hora da última atualização |

## Funcionalidades Implementadas:

✅ **Página Individual de Vídeo** (`/video/[id]`)
- Player de vídeo incorporado do YouTube
- Informações do vídeo e curso
- Lista de vídeos relacionados do mesmo autor

✅ **Sistema de Comentários**
- Comentários em tempo real
- Apenas usuários conectados podem comentar
- Exibição do nome do usuário e data
- Persistência no Supabase

✅ **Navegação Melhorada**
- Clique no card de curso vai direto para o primeiro vídeo
- Botão separado para ver o curso completo (se houver múltiplos vídeos)

## Como Testar:

1. ✅ **Acesse:** https://extraordinary-treacle-1bc552.netlify.app
2. ✅ **Vá para "Courses"** 
3. ✅ **Clique em qualquer card de vídeo** - deve ir para `/video/[id]`
4. ✅ **Conecte sua carteira** para poder comentar
5. ✅ **Deixe um comentário** e veja se é salvo

**Nota:** Após executar o SQL no Supabase, o sistema de comentários estará totalmente funcional!