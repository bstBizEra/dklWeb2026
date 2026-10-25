import * as migration_20261022_135548_initial from './20261022_135548_initial';
import * as migration_20261022_143328_pages_articles from './20261022_143328_pages_articles';
import * as migration_20261022_150000_supabase_lockdown from './20261022_150000_supabase_lockdown';
import * as migration_20261022_151309_pages_sitemap_menu from './20261022_151309_pages_sitemap_menu';
import * as migration_20261023_044132_social_links from './20261023_044132_social_links';
import * as migration_20261023_050041_reference_clients from './20261023_050041_reference_clients';
import * as migration_20261025_094137_card_sections from './20261025_094137_card_sections';

export const migrations = [
  {
    up: migration_20261022_135548_initial.up,
    down: migration_20261022_135548_initial.down,
    name: '20261022_135548_initial',
  },
  {
    up: migration_20261022_143328_pages_articles.up,
    down: migration_20261022_143328_pages_articles.down,
    name: '20261022_143328_pages_articles',
  },
  {
    up: migration_20261022_150000_supabase_lockdown.up,
    down: migration_20261022_150000_supabase_lockdown.down,
    name: '20261022_150000_supabase_lockdown',
  },
  {
    up: migration_20261022_151309_pages_sitemap_menu.up,
    down: migration_20261022_151309_pages_sitemap_menu.down,
    name: '20261022_151309_pages_sitemap_menu',
  },
  {
    up: migration_20261023_044132_social_links.up,
    down: migration_20261023_044132_social_links.down,
    name: '20261023_044132_social_links',
  },
  {
    up: migration_20261023_050041_reference_clients.up,
    down: migration_20261023_050041_reference_clients.down,
    name: '20261023_050041_reference_clients',
  },
  {
    up: migration_20261025_094137_card_sections.up,
    down: migration_20261025_094137_card_sections.down,
    name: '20261025_094137_card_sections'
  },
];
