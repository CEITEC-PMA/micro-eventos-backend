import {
  CastMember,
  CastMemberId,
} from '@core/castMember/domain/castMember.aggregate';
import { ICastMemberRepository } from '@core/castMember/domain/castMember.repository';
import { CastMemberType } from '@core/castMember/domain/castMemberType.vo';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../commom/castMember.output';
import { UpdateCastMemberInput } from './updateCastMember.input';

export class UpdateCastMemberUseCase
  implements IUseCase<UpdateCastMemberInput, UpdateCastMemberOutput>
{
  constructor(private castMemberRepo: ICastMemberRepository) {}

  async execute(input: UpdateCastMemberInput): Promise<UpdateCastMemberOutput> {
    const castMemberId = new CastMemberId(input.id);
    const castMember = await this.castMemberRepo.findById(castMemberId);

    if (!castMember) {
      throw new NotFoundError(input.id, CastMember);
    }

    input.name && castMember.changeName(input.name);

    if (input.type) {
      const [type, errorCastMemberType] = CastMemberType.create(
        input.type,
      ).asArray();

      castMember.changeType(type);

      errorCastMemberType &&
        castMember.notification.setError(errorCastMemberType.message, 'type');
    }

    if (castMember.notification.hasErrors()) {
      throw new EntityValidationError(castMember.notification.toJSON());
    }

    await this.castMemberRepo.update(castMember);

    return CastMemberOutputMapper.toOutput(castMember);
  }
}

export type UpdateCastMemberOutput = CastMemberOutput;
