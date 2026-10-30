import { SetMetadata } from '@nestjs/common';

export const REQUIRE_BRANCH_KEY = 'require_branch';
export const RequireBranch = () => SetMetadata(REQUIRE_BRANCH_KEY, true);
