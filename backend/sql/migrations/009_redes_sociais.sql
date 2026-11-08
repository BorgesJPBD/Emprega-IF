-- ============================================================
-- 009 - LinkedIn e Instagram no perfil do estudante
--
-- Os dois campos são opcionais e guardados já padronizados:
--   linkedin_url       -> https://www.linkedin.com/in/<perfil>
--   instagram_usuario  -> só o usuário, em minúsculas e sem @
--
-- O CHECK repete o formato que a API já confere: como a empresa vê
-- estes valores como links clicáveis, o banco também recusa qualquer
-- endereço fora do padrão, mesmo vindo de fora da API.
-- Linhas sem link (NULL) passam no CHECK.
-- ============================================================

ALTER TABLE estudantes
    ADD COLUMN linkedin_url      VARCHAR(140),
    ADD COLUMN instagram_usuario VARCHAR(30),
    ADD CONSTRAINT ck_estudantes_linkedin
        CHECK (linkedin_url ~ '^https://www\.linkedin\.com/in/[A-Za-z0-9%_-]{3,100}$'),
    ADD CONSTRAINT ck_estudantes_instagram
        CHECK (instagram_usuario ~ '^[a-z0-9._]{1,30}$');