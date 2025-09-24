import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationTokenService } from './registration-token.service';

describe('RegistrationTokenService', () => {
  let service: RegistrationTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistrationTokenService],
    }).compile();

    service = module.get<RegistrationTokenService>(RegistrationTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
