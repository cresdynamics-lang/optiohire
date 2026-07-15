/* eslint-disable camelcase */
const fs = require('fs');
const path = require('path');

exports.shorthands = undefined;

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS universities (
      university_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name            TEXT NOT NULL,
      short_name      TEXT,
      type            TEXT NOT NULL CHECK (type IN ('public','private','specialized','constituent')),
      country         TEXT NOT NULL DEFAULT 'KE',
      slug            TEXT UNIQUE NOT NULL,
      is_active       BOOLEAN NOT NULL DEFAULT true,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_universities_country ON universities(country);
    CREATE INDEX IF NOT EXISTS idx_universities_name ON universities(name);
    CREATE INDEX IF NOT EXISTS idx_universities_type ON universities(type);

    ALTER TABLE candidate_profiles
      ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(university_id) ON DELETE SET NULL;

    CREATE INDEX IF NOT EXISTS idx_candidate_profiles_university ON candidate_profiles(university_id);
  `);

  const dataPath = path.join(__dirname, '..', 'data', 'kenya-universities.json');
  const universities = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const slugs = new Set();
  const values = [];

  for (const u of universities) {
    let slug = slugify(u.name);
    let n = 2;
    while (slugs.has(slug)) {
      slug = `${slugify(u.name)}-${n++}`;
    }
    slugs.add(slug);
    const esc = (s) => String(s).replace(/'/g, "''");
    values.push(
      `('${esc(u.name)}', ${u.short_name ? `'${esc(u.short_name)}'` : 'NULL'}, '${esc(u.type)}', 'KE', '${esc(slug)}')`
    );
  }

  if (values.length > 0) {
    pgm.sql(`
      INSERT INTO universities (name, short_name, type, country, slug)
      VALUES ${values.join(',\n')}
      ON CONFLICT (slug) DO NOTHING;
    `);
  }
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE candidate_profiles DROP COLUMN IF EXISTS university_id;
    DROP TABLE IF EXISTS universities;
  `);
};
