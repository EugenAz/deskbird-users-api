import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User, UserRole } from './user.entity';

type MockRepo = Partial<Record<keyof Repository<User>, jest.Mock>>;

const createMockRepo = (): MockRepo => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  findBy: jest.fn(),
  save: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let repo: MockRepo;

  beforeEach(async () => {
    repo = createMockRepo();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repo,
        },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  afterEach(() => jest.resetAllMocks());

  it('findVisibleFor fetches all users for admins with ordering', async () => {
    const users = [{ id: '1' } as User];
    repo.find!.mockResolvedValue(users);

    const result = await service.findVisibleFor(UserRole.Admin);

    expect(repo.find).toHaveBeenCalledWith({
      order: { role: 'ASC', email: 'ASC' },
    });
    expect(result).toEqual(users);
  });

  it('findVisibleFor filters active users for non-admins', async () => {
    const users = [{ id: '1', active: true } as User];
    repo.find!.mockResolvedValue(users);

    const result = await service.findVisibleFor(UserRole.User);

    expect(repo.find).toHaveBeenCalledWith({
      where: { active: true },
      order: { role: 'ASC', email: 'ASC' },
    });
    expect(result).toEqual(users);
  });

  it('update returns null when user not found', async () => {
    repo.findOneBy!.mockResolvedValue(null);

    const result = await service.update('missing', { firstName: 'Test' });

    expect(result).toBeNull();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('update merges user fields and saves', async () => {
    const user = { id: '1', firstName: 'Old' } as User;
    repo.findOneBy!.mockResolvedValue(user);
    repo.save!.mockResolvedValue({ ...user, firstName: 'New' });

    const result = await service.update('1', { firstName: 'New' });

    expect(repo.save).toHaveBeenCalledWith({ ...user, firstName: 'New' });
    expect(result?.firstName).toBe('New');
  });
});
