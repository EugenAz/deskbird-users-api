import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(includeInactive = false): Promise<User[]> {
    if (includeInactive) {
      return this.usersRepository.find();
    }

    return this.usersRepository.find({ where: { active: true } });
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

  findVisibleFor(role?: UserRole): Promise<User[]> {
    if (role === UserRole.Admin) {
      return this.usersRepository.find();
    }

    return this.usersRepository.find({ where: { active: true } });
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
