import { ArrayNotEmpty, IsArray, IsBoolean, IsUUID } from 'class-validator';

export class BatchUpdateActivityDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  userIds: string[];

  @IsBoolean()
  active: boolean;
}
