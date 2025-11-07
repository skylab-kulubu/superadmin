# Kod Kalitesi Araç Zinciri

Bu proje için kurulu olan araçlar ve önerilen çalışma biçimi aşağıda özetlenmiştir.

## Komutlar

- `pnpm lint`: ESLint ile tüm TypeScript/JavaScript dosyalarını tarar.
- `pnpm lint:styles`: Stylelint ile stil dosyalarını kontrol eder.
- `pnpm format`: Prettier ile kodu otomatik formatlar.
- `pnpm format:check`: Prettier kurallarına uyumu doğrular.
- `pnpm typecheck`: TypeScript tip denetimini çalıştırır.
- `pnpm test`: Jest ile birim testlerini çalıştırır (`--passWithNoTests` aktif).
- `pnpm test:e2e`: Playwright ile uçtan uca testleri çalıştırır.
- `pnpm exec playwright install`: Playwright tarayıcılarını bir defalık indirir (CI öncesi koş).

## Git Hook Akışı

- `pre-commit`: `pnpm exec lint-staged` ile staged dosyalarda Prettier, ESLint ve Stylelint kontrolleri.
- `commit-msg`: Commit mesajını Commitlint üzerinden `@commitlint/config-conventional` kurallarına göre doğrular.

Husky kurulumu `pnpm install` sonrası otomatik olarak `prepare` scriptiyle tetiklenir.

## Test ve Mock Yönetimi

- Jest kurulumunda `src/test/setup/jest.setup.ts` dosyası Testing Library ve MSW sunucusunu hazırlar.
- Playwright yapılandırması `playwright.config.ts` altındadır. `tests/e2e` klasöründe örnek bir smoke senaryosu bulunur.

## Önerilen CI Adımları

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`
4. (Opsiyonel) `pnpm test:e2e`
   Bu akışı CI/CD ortamında ardışık olarak koşturarak kod kalitesini standart bir seviyede tutabilirsiniz.
