import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  const usersService = {
    findVisibleFor: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateActivityBatch: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns sanitized users', async () => {
      usersService.findVisibleFor.mockResolvedValue([
        { id: '1', email: 'a', passwordHash: 'secret' },
      ]);

      const result = await controller.findAll({ user: { role: UserRole.Admin } } as any);

      expect(usersService.findVisibleFor).toHaveBeenCalledWith(UserRole.Admin);
      expect(result[0]).toEqual({ id: '1', email: 'a' });
      expect((result[0] as any).passwordHash).toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('throws when user not found', async () => {
      usersService.findOne.mockResolvedValue(null);
      await expect(controller.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('throws NotFound when update returns null', async () => {
      usersService.update.mockResolvedValue(null);
      await expect(controller.update('missing', { firstName: 'Test' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('returns sanitized user on success', async () => {
      usersService.update.mockResolvedValue({
        id: '1',
        email: 'a',
        passwordHash: 'secret',
      });

      const result = await controller.update('1', { firstName: 'Ok' });
      expect(result).toEqual({ id: '1', email: 'a' });
    });
  });

  describe('batchUpdate', () => {
    it('returns sanitized list', async () => {
      usersService.updateActivityBatch.mockResolvedValue([
        { id: '1', email: 'a', passwordHash: 'secret' },
      ]);

      const result = await controller.batchUpdate({ userIds: ['1'], active: false });
      expect(usersService.updateActivityBatch).toHaveBeenCalledWith(['1'], false);
      expect(result).toEqual([{ id: '1', email: 'a' }]);
    });
  });
});
