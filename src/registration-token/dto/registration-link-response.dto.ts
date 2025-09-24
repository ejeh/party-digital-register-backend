export class RegistrationLinkResponseDto {
  id: string;
  email: string;
  created: Date;
  expiration: Date;
  status: 'active' | 'expired' | 'used';
  link: string;
}
