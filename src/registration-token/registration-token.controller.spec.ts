import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationTokenController } from './registration-token.controller';

describe('RegistrationTokenController', () => {
  let controller: RegistrationTokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationTokenController],
    }).compile();

    controller = module.get<RegistrationTokenController>(RegistrationTokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
