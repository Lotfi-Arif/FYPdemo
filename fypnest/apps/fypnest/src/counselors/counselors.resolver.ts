import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PrismaSelect } from '@paljs/plugins';
import { Counselor } from '@app/common/generated/index/counselor/counselor.model';
import { CounselorsService } from './counselors.service';
import { FindManyCounselorArgs } from '@app/common/generated/index/counselor/find-many-counselor.args';
import { CreateOneCounselorArgs } from '@app/common/generated/index/counselor/create-one-counselor.args';
import { DeleteOneCounselorArgs } from '@app/common/generated/index/counselor/delete-one-counselor.args';
import { UpdateOneCounselorArgs } from '@app/common/generated/index/counselor/update-one-counselor.args';
import { FindUniqueCounselorArgs } from '@app/common/generated/index/counselor/find-unique-counselor.args';

@Resolver(() => Counselor)
export class CounselorsResolver {
  constructor(private readonly counselorsService: CounselorsService) {
  }

  @Query(() => Counselor)
  async findAllCounselors(@Args() counselorFindManyArgs: FindManyCounselorArgs, @Info() info) {
    try {
      const counselors = new PrismaSelect(info).value
      return this.counselorsService.findAll({ ...counselorFindManyArgs, ...counselors })
    } catch (error) {
      console.error(error);
    }

  }

  @Mutation(() => Counselor)
  async findOneCounselor(@Args() counselorFindUnique: FindUniqueCounselorArgs, @Info() info) {
    try {
      const counselor = new PrismaSelect(info).value;
      return this.counselorsService.findOne({ ...counselorFindUnique, ...counselor })
    } catch (error) {
      console.error(error);
    }
  }

  @Mutation(() => Counselor)
  async createCounselor(@Args() counselorCreateArgs: CreateOneCounselorArgs, @Info() info) {
    try {
      const newCounselor = new PrismaSelect(info).value;
      return this.counselorsService.createCounselor({ ...counselorCreateArgs, ...newCounselor })
    } catch (error) {
      console.error(error);
    }
  }

  @Mutation(() => Counselor)
  async updateCounselor(@Args() counselorUpdateArgs: UpdateOneCounselorArgs, @Info() info) {
    try {
      const update = new PrismaSelect(info).value;
      return this.counselorsService.updateCounselor({ ...counselorUpdateArgs, ...update })
    } catch (error) {
      console.error(error);
    }

  }

  @Mutation(() => Counselor)
  async deleteCounselor(@Args() counselorDeletArgs: DeleteOneCounselorArgs, @Info() info) {
    try {
      const counselor = new PrismaSelect(info).value;
      return this.counselorsService.deleteCounselor({ ...counselorDeletArgs, ...counselor })
    } catch (error) {
      console.error(error);
    }
  }
}