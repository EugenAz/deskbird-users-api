import 'dotenv/config';
import { hash } from 'bcrypt';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/user.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User],
});

type SeedUser = Pick<User, 'email' | 'firstName' | 'lastName' | 'role'> & {
  password: string;
};

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var ${key} for seeding`);
  }
  return value;
};

const getSaltOrRounds = (): string | number => {
  const salt = process.env.BCRYPT_SALT;
  if (salt) {
    return salt;
  }

  const roundsRaw = process.env.BCRYPT_SALT_ROUNDS ?? '12';
  const rounds = Number(roundsRaw);
  if (Number.isNaN(rounds) || rounds <= 0) {
    throw new Error('BCRYPT_SALT_ROUNDS must be a positive number');
  }

  return rounds;
};

const saltOrRounds = getSaltOrRounds();

const festiveUsers: SeedUser[] = [
  {
    email: requireEnv('SEED_ADMIN_EMAIL'),
    password: requireEnv('SEED_ADMIN_PASSWORD'),
    firstName: 'Santa',
    lastName: 'Claus',
    role: UserRole.Admin,
  },
  {
    email: requireEnv('SEED_RUDOLPH_EMAIL'),
    password: requireEnv('SEED_RUDOLPH_PASSWORD'),
    firstName: 'Rudolph',
    lastName: 'Reindeer',
    role: UserRole.User,
  },
  {
    email: requireEnv('SEED_BUDDY_EMAIL'),
    password: requireEnv('SEED_BUDDY_PASSWORD'),
    firstName: 'Buddy',
    lastName: 'Elf',
    role: UserRole.User,
  },
  {
    email: requireEnv('SEED_FROSTY_EMAIL'),
    password: requireEnv('SEED_FROSTY_PASSWORD'),
    firstName: 'Frosty',
    lastName: 'Snowman',
    role: UserRole.User,
  },
];

async function seed() {
  await dataSource.initialize();
  const usersRepository = dataSource.getRepository(User);

  for (const user of festiveUsers) {
    const passwordHash = await hash(user.password, saltOrRounds);
    const existing = await usersRepository.findOne({
      where: { email: user.email },
    });

    if (existing) {
      await usersRepository.save({ ...existing, ...user, passwordHash });
      console.log(`Updated existing user ${user.email}`);
    } else {
      const entity = usersRepository.create({ ...user, passwordHash });
      await usersRepository.save(entity);
      console.log(`Created user ${user.email}`);
    }
  }
}

seed()
  .then(async () => {
    console.log('Seeding complete');
    await dataSource.destroy();
  })
  .catch(async (error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'Unknown seeding error';
    console.error('Seeding failed', message);
    await dataSource.destroy();
    process.exit(1);
  });
