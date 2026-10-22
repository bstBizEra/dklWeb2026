import * as migration_20261022_135548_initial from './20261022_135548_initial';
import * as migration_20261022_143328_pages_articles from './20261022_143328_pages_articles';

import * as migration_20261022_150000_supabase_lockdown from './20261022_150000_supabase_lockdown';

export const migrations = [
  {
    up: migration_20261022_135548_initial.up,
    down: migration_20261022_135548_initial.down,
    name: '20261022_135548_initial',
  },
  {
    up: migration_20261022_143328_pages_articles.up,
    down: migration_20261022_143328_pages_articles.down,
    name: '20261022_143328_pages_articles'
  },
  {
    up: migration_20261022_150000_supabase_lockdown.up,
    down: migration_20261022_150000_supabase_lockdown.down,
    name: '20261022_150000_supabase_lockdown',
  },
];
