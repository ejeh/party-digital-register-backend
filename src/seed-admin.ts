// import { UsersService } from './users/users.service';
// import { UserRole } from 'src/users/users.role.enum';
// import { hashPassword } from './auth/auth';

// export async function seedAdmin(usersService: UsersService) {
//   const existingAdmin = await usersService.findAdminByEmail(
//     'ejehgodfrey@gmail.com',
//   );
//   const password = 'magickiss17A#';
//   const activationToken = null;
//   const userId = '';
//   const activationUrl = `http://localhost:5000/api/auth/activate/${userId}/${activationToken}\n`;
//   // const activationUrl = `https://identity-management-af43.onrender.com/api/auth/activate/${userId}/${activationToken}\n`;
//   if (!existingAdmin) {
//     const hashedPassword = await hashPassword(password);
//     await usersService.create(
//       'Admin', // firstname
//       'User', // lastname
//       'ejehgodfrey@gmail.com', // email
//       hashedPassword, // password
//       1234567890, // phone
//       123456789, // NIN
//       UserRole.SUPER_ADMIN, // role
//       activationUrl, // origin
//     );
//     console.log('Admin account created');
//   }
// }
