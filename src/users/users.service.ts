import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findVisibleFor(role?: UserRole): Promise<User[]> {
    if (role === UserRole.Admin) {
      return this.usersRepository.find({
        order: { role: 'ASC', email: 'ASC' },
      });
    }

    return this.usersRepository.find({
      where: { active: true },
      order: { role: 'ASC', email: 'ASC' },
    });
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  create(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async update(
    id: string,
    update: Partial<Pick<User, 'firstName' | 'lastName' | 'role' | 'active'>>,
  ): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      return null;
    }

    return this.usersRepository.save({ ...user, ...update });
  }

  async updateActivityBatch(
    userIds: string[],
    active: boolean,
  ): Promise<User[]> {
    if (userIds.length === 0) {
      return [];
    }

    const users = await this.usersRepository.findBy({ id: In(userIds) });
    if (users.length === 0) {
      return [];
    }

    const updated = users.map((user) => ({ ...user, active }));
    return this.usersRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
