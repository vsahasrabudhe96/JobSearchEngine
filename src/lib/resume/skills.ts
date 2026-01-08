export const TECH_SKILLS = new Set([
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'golang', 'rust',
  'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'haskell',
  'react', 'reactjs', 'react.js', 'vue', 'vuejs', 'vue.js', 'angular', 'angularjs',
  'svelte', 'nextjs', 'next.js', 'nuxt', 'nuxtjs', 'gatsby', 'remix',
  'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'tailwind', 'tailwindcss',
  'bootstrap', 'material-ui', 'mui', 'chakra-ui', 'styled-components',
  'webpack', 'vite', 'rollup', 'parcel', 'babel', 'esbuild',
  'node', 'nodejs', 'node.js', 'express', 'expressjs', 'fastify', 'nestjs', 'koa',
  'django', 'flask', 'fastapi', 'spring', 'spring boot', 'springboot',
  'rails', 'ruby on rails', 'laravel', 'symfony',
  'sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'mariadb', 'oracle', 'mssql',
  'mongodb', 'mongoose', 'dynamodb', 'cassandra', 'redis', 'memcached',
  'elasticsearch', 'neo4j', 'firebase', 'firestore', 'supabase',
  'prisma', 'sequelize', 'typeorm', 'drizzle', 'knex',
  'aws', 'amazon web services', 'ec2', 's3', 'lambda', 'rds', 'ecs', 'eks',
  'azure', 'microsoft azure', 'gcp', 'google cloud', 'google cloud platform',
  'heroku', 'vercel', 'netlify', 'railway', 'render', 'digitalocean',
  'docker', 'kubernetes', 'k8s', 'helm', 'openshift',
  'terraform', 'pulumi', 'cloudformation', 'ansible', 'puppet', 'chef',
  'jenkins', 'github actions', 'gitlab ci', 'circleci', 'travis ci',
  'nginx', 'apache', 'prometheus', 'grafana', 'datadog', 'splunk',
  'ios', 'android', 'react native', 'flutter', 'xamarin', 'ionic',
  'machine learning', 'ml', 'deep learning', 'tensorflow', 'pytorch', 'keras',
  'pandas', 'numpy', 'scipy', 'matplotlib', 'opencv', 'nlp',
  'jest', 'mocha', 'chai', 'jasmine', 'vitest', 'cypress', 'playwright', 'selenium',
  'git', 'github', 'gitlab', 'bitbucket', 'linux', 'unix', 'bash', 'shell',
  'rest', 'restful', 'graphql', 'grpc', 'websockets', 'oauth', 'jwt',
  'agile', 'scrum', 'jira', 'confluence', 'figma', 'sketch',
])

export const SOFT_SKILLS = new Set([
  'leadership', 'communication', 'teamwork', 'problem solving',
  'critical thinking', 'creativity', 'adaptability', 'time management',
  'project management', 'mentoring', 'coaching', 'collaboration',
])

const SKILL_ALIASES: Record<string, string> = {
  'reactjs': 'react', 'react.js': 'react', 'vuejs': 'vue', 'vue.js': 'vue',
  'nodejs': 'node.js', 'node': 'node.js', 'nextjs': 'next.js',
  'postgresql': 'postgres', 'golang': 'go', 'k8s': 'kubernetes',
  'amazon web services': 'aws', 'google cloud platform': 'gcp',
}

export function normalizeSkill(skill: string): string {
  const lower = skill.toLowerCase().trim()
  return SKILL_ALIASES[lower] || lower
}

export function isKnownSkill(word: string): boolean {
  const normalized = normalizeSkill(word)
  return TECH_SKILLS.has(normalized) || SOFT_SKILLS.has(normalized)
}

export function extractAllSkills(text: string): string[] {
  const foundSkills = new Set<string>()
  const textLower = text.toLowerCase()

  for (const skill of TECH_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(`\\b${escaped}\\b`, 'i')
    if (pattern.test(textLower)) {
      foundSkills.add(normalizeSkill(skill))
    }
  }

  for (const skill of SOFT_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(`\\b${escaped}\\b`, 'i')
    if (pattern.test(textLower)) {
      foundSkills.add(normalizeSkill(skill))
    }
  }

  return Array.from(foundSkills).sort()
}
