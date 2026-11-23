# Fieldnotes CMS demo

Laravel 13 + Filament 5 demo for [`solutionforest/filament-collaboration`](../).

The package itself lives at the **repository root**. This folder is only the sample blog CMS.

```bash
composer install
cp .env.example .env
php artisan key:generate
mkdir -p database && touch database/database.sqlite
php artisan migrate --seed
npm install
npm run build
php artisan serve
```

Open `/admin` as `alice@example.test` / `password`, and `/blog` for the public site.
